/**
 * Created by vt on 15/10/9.
 */

'use strict'

const should = require('should')
const url = require('url')
const Promise = require('bluebird')
const _ = require('lodash')

const StorageFactory = require('../lib/storage/factory')

const redisUri = process.env.hasOwnProperty('DEVELOP_REDIS_URI') &&
  process.env['DEVELOP_REDIS_URI'] || 'redis://127.0.0.1:6379/0'
const parsedRedisUri = url.parse(redisUri)
const redisHost = parsedRedisUri.hostname
const redisPort = parsedRedisUri.port

describe('redis storage init', function () {
  it('should use uri if exist', function () {
    const s = new StorageFactory({
      uri: redisUri,
      type: 'redis'
    })
    s.__$type.should.equal('redis')
  })

  it('should use host or use default if exist', function () {
    const s = new StorageFactory({
      host: redisHost,
      type: 'redis'
    })
    s.__$type.should.equal('redis')
    const ss = new StorageFactory({
      host: redisHost,
      port: redisPort,
      type: 'redis'
    })
    ss.__$type.should.equal('redis')
  })

  it('should use database if exist', function () {
    const s = new StorageFactory({
      host: redisHost,
      type: 'redis',
      database: 1
    })
    s.__$type.should.equal('redis')
  })
})

const createRedisStorage = function () {
  return StorageFactory.create({
    host: redisHost,
    type: 'redis',
    database: 1
  })
}

describe('redis storage usage', function () {
  it('should clear all keys after flush', function () {
    const store = createRedisStorage()
    const conn = store.conn
    return Promise.all([
      conn.setAsync(store.storedKey, '1'),
      conn.setAsync(store.countKey, '1')
    ]).then(_ => {
      return store.flush()
    }).then(() => {
      return Promise.mapSeries([store.storedKey, store.countKey], conn.existsAsync.bind(conn)).then(results => {
        should(_.every(results, result => result == 0)).eql(true)
      })
    })
  })

  it('should return null if empty', function () {
    const store = createRedisStorage()
    return store.flush().then(_ => {
      return store.next()
    }).then(result => {
      should(result).eql(null)
    })
  })

  it('should raise error if anything unexpected', function () {
    const store = createRedisStorage()
    const conn = store.conn
    return store.flush().then(_ => {
      return conn.setAsync(store.storedKey, '1')
    }).then(_ => {
      return store.next()
    }).catch(err => {
      err.message.should.equal('WRONGTYPE Operation against a key holding the wrong kind of value')
    })
  })

  it('should next with success after update success', function () {
    const store = createRedisStorage()
    const conn = store.conn
    const data = {
      path: '/',
      result: 1
    }
    return store.flush().then(_ => {
      return store.update([data])
    }).then(_ => {
      return store.next()
    }).then(result => {
      result.should.eql(data)
    })
  })

  it('should throw error if update with error', function () {
    const store = createRedisStorage()
    const conn = store.conn
    return store.flush().then(_ => {
      return conn.setAsync(store.storedKey, '1')
    }).then(_ => {
      return store.update([{}])
    }).catch(err => {
      err.message.should.equal('WRONGTYPE Operation against a key holding the wrong kind of value')
    })
  })

  it('should increase in multi-thread with count', function () {
    let store = createRedisStorage()
    return store.flush().then(_ => {
      return store.update([{}])
    }).then(() => {
      return Promise.all(_.times(5, _ => {
        let _store = createRedisStorage()
        return _store.nextCaptcha()
      }))
    }).then(_ => {
      return store.currentLoad()
    }).then(result => {
      result.should.equal(5)
    })
  })
})
