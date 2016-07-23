/**
 * Created by vt on 15/10/9.
 */

'use strict'

const should = require('should')
const Promise = require('bluebird')

const StorageFactory = require('../lib/storages')

describe('factory use with error', function () {
  it('should throw error if klass not implement all methods', function () {
    (_ => StorageFactory.register('k', {})).should.throw(Error)
  })

  it('should throw error if init with unknown storage type', function () {
    (_ => {
      new StorageFactory({
        type: 'fakeStorageType'
      })
    }).should.throw(Error)
  })
})

describe('new storage registered', function () {
  it('should include all methods from klass', function () {
    let klass = {}
    StorageFactory.implementNeededMethods.forEach(item => {
      klass[item] = _ => 0
    })
    klass.someMethod = _ => 'hello world'
    StorageFactory.register('userStorage', klass)
    const s = StorageFactory.create({
      type: 'userStorage'
    })

    s.someMethod().should.equal('hello world')
  })

  it('should use redisStorage if no options given', function () {
    const s = new StorageFactory()
    s.__$type.should.equal('redis')
  })
})

describe('storage usage', function () {
  it('should count and return object when nextCaptcha', function () {
    let klass = {}
    StorageFactory.implementNeededMethods.forEach(item => {
      klass[item] = _ => 0
    })
    klass.count = function () {
      return new Promise((resolve, reject) => {
        this.__$count = this.__$count ? this.__$count + 1 : 1
        if (this.__$count % 2 === 0) {
          return reject('SomeError')
        }
        resolve()
      })
    }
    klass.next = function (callback) {
      return new Promise((resolve, reject) => {
        resolve(this.__$count)
      })
    }

    StorageFactory.register('userStorage', klass)
    const store = StorageFactory.create({
      type: 'userStorage'
    })
    return store.nextCaptcha().then(result => {
      return result.should.equal(1)
    }).then(_ => {
      return store.nextCaptcha()
    }).catch(err => {
      return err.should.equal('SomeError')
    })
  })
})
