/**
 * Created by vt on 15/10/8.
 */

'use strict'

const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const Promise = require('bluebird')

const Topic = require('./topic')
const Builder = require('./builder')
const Storage = require('./storage')
const Monitor = require('./monitor')

Promise.promisifyAll(fs)

const requireCamptoConfig = function () {
  const rootPath = process.env['CAMPTO_ROOT_DIR'] || process.cwd()
  try {
    // 载入项目中配置文件 `campto.js` 或者 `campto.json`
    return _.extend(require(path.join(rootPath, './campto')), {
      rootPath: rootPath
    })
  } catch (e) {
    return {
      rootPath: rootPath
    }
  }
}

const camptoConfig = requireCamptoConfig()

const defaultServer = function () {
  const config = _.clone(camptoConfig)

  if (config['preBuild'] !== true) {
    // 非缓存模式支持启动时制定 config
    if (_.isObject(arguments[0])) {
      config = _.extend(config, arguments[0])
    }
    return function (callback) {
      const t = Topic.rand(config)
      Builder.toBuffer(t.subject, function (err, buffer) {
        if (err) return callback(err)
        callback(null, buffer, t.result)
      })
    }
  }

  const storage = Storage.create(config)
  return function (callback) {
    storage.nextCaptcha(function (err, captcha) {
      fs.readFile(captcha.path, function (err, buffer) {
        if (err) return callback(err)
        callback(null, buffer, captcha.result)
      })
    })
  }
}

module.exports = {
  camptoConfig: camptoConfig,
  defaultServer: defaultServer,

  Storage: Storage,
  Builder: Builder,
  Topic: Topic,
  Monitor: Monitor
}
