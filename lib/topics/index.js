/**
 * Created by vt on 16/7/23.
 */

'use strict'

const TopicStore = module.exports = {}
const store = {}

TopicStore.register = function (type, generator) {
  store[type] = generator
}

TopicStore.generateFrom = function (type) {
  if (typeof type === 'function') return type()
  return store[type]()
}

require('./math')
