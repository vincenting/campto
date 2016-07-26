/**
 * Created by vt on 16/7/23.
 */

'use strict'

const Promise = require('bluebird')

const TopicStore = module.exports = {}
const store = {}

TopicStore.register = function (type, generator) {
  store[type] = generator
}

TopicStore.generateFrom = function (type) {
  if (typeof type === 'string') {
    type = store[type]
  }
  if (type instanceof Promise) return type
  return new Promise(resolve => resolve(type()))
}

require('./math')
require('./alphabet')
