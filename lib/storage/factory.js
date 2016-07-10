/**
 * Created by vt on 15/10/8.
 */

'use strict'

const _ = require('lodash')

const StorageFactory = module.exports = function () {
  this.init.apply(this, arguments)
}

StorageFactory.create = function (options) {
  return new StorageFactory(options)
}

StorageFactory.storageKlassMap = {}
StorageFactory.implementNeededMethods = [
  'initialize',
  'next',
  'update',
  'count',
  'currentLoad'
]
StorageFactory.defaultType = 'redis'

StorageFactory.register = function (name, klass) {
  StorageFactory.implementNeededMethods.forEach(function (item) {
    if (!_.isFunction(klass[item])) {
      throw Error('Method `function ' + item + ' () {}` should be overwrite', 'NO_IMPLEMENT')
    }
  })
  StorageFactory.storageKlassMap[name] = klass
}

StorageFactory.prototype.init = function (options) {
  options = options || /* istanbul ignore next: redis may fail */ {}
  const type = options.type || StorageFactory.defaultType
  if (!StorageFactory.storageKlassMap.hasOwnProperty(type)) {
    throw Error('StorageFactory must init with type', 'STORAGE_INIT_PARAM_MISSING')
  }
  this.__$options = options
  _.extend(this, StorageFactory.storageKlassMap[type])
  this.__$type = type
  this.initialize.call(this, options)
}

StorageFactory.prototype.nextCaptcha = function (callback) {
  this.count(err => {
    if (err) return callback(err)
    this.next(callback)
  })
}

// 注册 redisStorage
require('./redis-storage')
