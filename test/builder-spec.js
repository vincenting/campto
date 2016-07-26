/**
 * Created by vt on 15/10/1.
 */

'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const should = require('should')

const CaptchaBuilder = require('../lib/builder')
const TopicStore = require('../lib/topics')

describe('test without error', function () {
  this.timeout(20000)
  const topicPromise = TopicStore.generateFrom('math')

  it('should callback with result and create file when use toFile', function () {
    const tempFileName = './temp.png'
    return topicPromise.then(topic => {
      return CaptchaBuilder.toFile(topic.subject, tempFileName, {
        captchaHeight: 60
      }).then(tempPath => {
        tempPath.should.eql(tempFileName)
      }).then(function () {
        should(this.doneStatus).be.exactly(true)
        return fs.stat(tempFileName)
      })
        .then(_ => fs.unlinkSync(tempFileName))
    })
  })

  it('should callback with result buffer when use toBuffer', function () {
    return topicPromise.then(topic => {
      return CaptchaBuilder.toBuffer(topic.subject.split(' ')).then(function (buffer) {
        should(this.doneStatus).be.exactly(true)
        should(buffer.length > 0).be.exactly(true)
      })
    })
  })
})
