/**
 * Created by vt on 15/11/3.
 */

'use strict'

const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')
const winston = require('winston')

const glob = Promise.promisify(require('glob'))
const mkdirp = Promise.promisify(require('mkdirp'))
const forever = Promise.promisifyAll(require('forever'))

const StorageFactory = require('../storages')

const _defaultMonitorConfig = {
  pidPath: './.campto/pids',
  logsPath: './.campto/logs',
  sockPath: './.campto/sock',
  cachePath: './.campto/cache'
}

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: 'all',
      timestamp: true
    })
  ]
})

const Monitor = function (config) {
  this.config = Object.assign({}, _defaultMonitorConfig, config || {})
}

Monitor.prototype.currentIdx = function () {
  return forever.listAsync(false).then(processes => {
    if (!processes) return -1
    const execFile = path.join(__dirname, './campto.js')
    return processes.findIndex(proc => proc.file === execFile)
  })
}

Monitor.prototype.loadForeverConfig = function () {
  const necessaryDirs = {
    root: path.join(process.cwd(), this.config.logsPath),
    pidPath: path.join(process.cwd(), this.config.pidPath),
    sockPath: path.join(process.cwd(), this.config.sockPath)
  }
  return Promise.each(Object.keys(necessaryDirs), key => mkdirp(necessaryDirs[key]))
    .then(_ => forever.load(necessaryDirs))
    .return(necessaryDirs)
}

Monitor.prototype.start = function () {
  this.loadForeverConfig().then(_ => {
    return this.currentIdx()
  }).then(idx => {
    if (idx > -1) {
      return Promise.reject(new Error(
        'Campto has started!!!\n**PLEASE DO NOT** run start twice in one project.'))
    }
  })
  .then(_ => mkdirp(this.config.cachePath))
  .then(_ => {
    forever.startDaemon(path.join(__dirname, './campto.js'), {
      killTree: true
    })
    logger.info('Campto will start soon with daemon.')
  }).catch(err => logger.error(err.message))
}

Monitor.prototype.stop = function () {
  this.loadForeverConfig().then(_ => {
    return this.currentIdx()
  }).then(idx => {
    if (idx < 0) return
    forever.stop(idx)
    forever.cleanUp()
  })
}

Monitor.prototype.tail = function () {
  this.loadForeverConfig().then(_ => {
    return this.currentIdx()
  }).then(idx => {
    if (idx < 0) return
    forever.tail(path.join(__dirname, './campto.js'), { stream: true }, (err, output) => {
      if (err) {
        return logger.error(err)
      }
      logger.info(output.line)
    })
  })
}

Monitor.prototype.status = function () {
  this.loadForeverConfig().then(_ => {
    return this.currentIdx()
  }).then(idx => {
    idx === -1 ? logger.error('stopped') : logger.info('running')
  })
}

Monitor.prototype.flush = function () {
  glob(`${this.config.cachePath}/**/*`).then(files => {
    return Promise.each(files, file => fs.unlinkAsync(file)).return(this.loadForeverConfig())
  }).then(_ => {
    const storage = StorageFactory.create(Object.assign({}, this.config))
    return storage.flush()
  }).then(_ => {
    return this.currentIdx()
  }).then(idx => {
    forever.cleanLogsSync(idx === -1 ? undefined : path.join(__dirname, './campto.js'))
    if (idx === -1) return
    forever.restart(idx)
    logger.info('Flush success. Server will restart soon.')
  }).finally(_ => process.exit(0))
}

module.exports = Monitor
