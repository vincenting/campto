/**
 * Created by vt on 15/10/8.
 */

'use strict'

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
    if (typeof(klass[item]) !== 'function') {
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
  Object.assign(this, StorageFactory.storageKlassMap[type])
  this.__$type = type
  this.initialize.call(this, options)
}

StorageFactory.prototype.nextCaptcha = function (callback) {
  return this.count().then(_ => this.next())
}

// 默认注册 redisStorage
require('./redis-storage')
