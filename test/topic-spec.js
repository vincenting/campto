/**
 * Created by vt on 16/7/26.
 */

const should = require('should')
const Promise = require('bluebird')

const TopicStore = require('../lib/topics')

describe('topic store', function () {
  it('should access function for register and generateFrom', function () {
    const testTopic = _ => 'world'
    TopicStore.register('helo', testTopic)
    should(TopicStore.generateFrom('helo') instanceof Promise).equal(true)
    TopicStore.generateFrom('helo').then(result => result.should.equal('world'))
    TopicStore.generateFrom(testTopic).then(result => result.should.equal('world'))
  })

  it('should access Promise for register and generateFrom', function () {
    const testTopic = new Promise(resolve => resolve('world'))
    TopicStore.register('hello', testTopic)
    should(TopicStore.generateFrom('hello') instanceof Promise).equal(true)
    TopicStore.generateFrom('hello').then(result => result.should.equal('world'))
    TopicStore.generateFrom(testTopic).then(result => result.should.equal('world'))
  })
})
