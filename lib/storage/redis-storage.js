/**
 * Created by vt on 15/10/8.
 */

'use strict'

const redis = require('redis')

const StorageFactory = require('./factory')

const DEFAULT_STORED_KEY = 'campto:store'
const DEFAULT_COUNT_KEY = 'campto:store'

module.exports = {
  initialize: function (storageOptions) {
    let redisOptions = {}
    this.__$storageOptions = storageOptions
    try {
      require('hiredis')
      redisOptions.parser = 'hiredis'
    } catch (e) {
      /* istanbul ignore next */
    }
    console.info(storageOptions)
    if (storageOptions.hasOwnProperty('uri')) {
      this.conn = redis.createClient(storageOptions.uri, redisOptions)
    } else {
      this.conn = redis.createClient(
        storageOptions.port || 6379,
        storageOptions.host || /* istanbul ignore next: redis may fail */ '127.0.0.1',
        redisOptions
      )
    }
    this.storedKey = storageOptions.storedKey || DEFAULT_STORED_KEY
    this.countKey = storageOptions.countKey || DEFAULT_COUNT_KEY
    if (storageOptions.hasOwnProperty('database')) {
      this.conn.select(storageOptions.database)
    }
  },

  next: function (callback) {
    this.conn.SRANDMEMBER(this.storedKey, 1, function (err, items) {
      if (err) return callback(err)
      if (items.length < 1) {
        return callback(Error('No item can be found in storage', 'STORAGE_EMPTY'))
      }
      callback(null, JSON.parse(items[0]))
    })
  },

  update: function (items, callback) {
    const itemsCount = items.length
    this.conn.SREM(this.storedKey, itemsCount, err => {
      if (err) return callback(err)
      const stringfiedItems = items.map(item => JSON.stringify(item))
      this.conn.SADD(this.storedKey, stringfiedItems, callback)
    })
  },

  count: function (callback) {
    this.conn.INCR(this.countKey, function (err, count) {
      callback(err, count && parseInt(count, 10))
    })
  },

  currentLoad: function (callback) {
    this.conn.GETSET(this.countKey, 0, function (err, count) {
      callback(err, count && parseInt(count, 10))
    })
  },

  flush: function (callback) {
    this.conn.DEL(this.countKey, this.storedKey, callback)
  }
}

StorageFactory.register('redis', module.exports)
