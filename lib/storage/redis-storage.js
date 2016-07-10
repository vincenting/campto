/**
 * Created by vt on 15/10/8.
 */

'use strict'

const redis = require('redis')
const Promise = require('bluebird')

const StorageFactory = require('./factory')

const DEFAULT_STORED_KEY = 'campto:store'
const DEFAULT_COUNT_KEY = 'campto:count'

Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

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
    return this.conn.srandmemberAsync(this.storedKey, 1).then(items => {
      return items.length < 1 ? null : JSON.parse(items[0])
    })
  },

  update: function (items) {
    const itemsCount = items.length
    return this.conn.sremAsync(this.storedKey, itemsCount).then(_ => {
      const stringfiedItems = items.map(item => JSON.stringify(item))
      return this.conn.saddAsync(this.storedKey, stringfiedItems)
    })
  },

  count: function () {
    return this.conn.incrAsync(this.countKey).then(count => {
      return count && parseInt(count, 10)
    })
  },

  currentLoad: function () {
    return this.conn.getsetAsync(this.countKey, 0).then(count => {
      return count && parseInt(count, 10)
    })
  },

  flush: function () {
    return this.conn.delAsync(this.countKey, this.storedKey)
  }
}

StorageFactory.register('redis', module.exports)
