/**
 * Created by vt on 15/10/9.
 */

'use strict'

const should = require('should')
const async = require('async')

const StorageFactory = require('../lib/storage/factory')

const redisUri = process.env.hasOwnProperty('DEVELOP_REDIS_URI') &&
  process.env['DEVELOP_REDIS_URI'] || 'redis://127.0.0.1:6379'
const redisHost = redisUri.split(':')[1].substring(2)
const redisPort = redisUri.split(':')[2]

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
  it('should clear all keys after flush', function (done) {
    const s = createRedisStorage()
    s.conn.SET(s.storedKey, '1', function () {
      s.conn.SET(s.countKey, '1', function () {
        s.flush(function () {
          async.every([s.storedKey, s.countKey], function (item, callback) {
            s.conn.EXISTS(item, function (err, result) {
              return callback(!err && result == 0)
            })
          }, function (result) {
            should(result).be.exactly(true)
            done()
          })
        })
      })
    })
  })

  it('should raise error if empty', function (done) {
    const s = createRedisStorage()
    s.flush(function () {
      s.next(function (err) {
        err.message.should.equal('No item can be found in storage')
        done()
      })
    })
  })

  it('should raise error if anything unexpected', function (done) {
    const s = createRedisStorage()
    s.flush(function () {
      s.conn.SET(s.storedKey, '1', function () {
        s.next(function (err) {
          err.message.should.equal('WRONGTYPE Operation against a key holding the wrong kind of value')
          done()
        })
      })
    })
  })

  it('should next with success after update success', function (done) {
    const s = createRedisStorage()
    s.flush(function () {
      const data = {
        path: '/',
        result: 1
      }
      s.update([data], function () {
        s.next(function (_, d) {
          d.should.eql(data)
          done()
        })
      })
    })
  })

  it('should throw error if update with error', function (done) {
    const s = createRedisStorage()
    s.flush(function () {
      s.conn.SET(s.storedKey, '1', function () {
        s.update([{}], function (err) {
          err.message.should.equal('WRONGTYPE Operation against a key holding the wrong kind of value')
          done()
        })
      })
    })
  })

  it('should increase in multi-thread with count', function (done) {
    const s = createRedisStorage()
    s.flush(function () {
      async.times(5, function (n, next) {
        const v = createRedisStorage()
        v.nextCaptcha(function (err) {
          next(err)
        })
      }, function () {
        s.currentLoad(function (err, count) {
          count.should.equal(5)
          done()
        })
      })
    })
  })
})
