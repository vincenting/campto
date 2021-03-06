/**
 * Created by vt on 15/9/29.
 */

'use strict'

const should = require('should')
const _ = require('lodash')
const MathTopic = require('../lib/topics/math')

describe('number stringify', function () {
  it('should return `数` if number lt 10', function () {
    MathTopic._numToChinese(10).should.eql(['十'])
  })

  it('should return  十`数` if number gt 10 and lt 20', function () {
    MathTopic._numToChinese(15).should.eql(['十', '五'])
  })

  it('should return `数`十 if number gt 20 and can be exact division by 10', function () {
    MathTopic._numToChinese(30).should.eql(['三', '十'])
  })

  it('should return `数`十`数` if number gt 20 and can not be exact division by 10', function () {
    MathTopic._numToChinese(45).should.eql(['四', '十', '五'])
  })
})

describe('parse to subject', function () {
  it('should has no equal statement if currentLen === 6', function () {
    let t = new MathTopic()
    t._le = ['四', '十', '五']
    t._rt = ['二', '十', '五']
    t._operator = '+'
    t._optLen = 4
    t._prepareSubject().should.eql(['四', '十', '五', '加', '二', '十', '五'])
  })

  it('should has no equal if currentLen === 5 && _optLen === 2', function () {
    let t = new MathTopic()
    t._le = ['四', '十', '五']
    t._rt = ['二', '十']
    t._operator = '+'
    t._optLen = 2
    t._prepareSubject().should.eql(['四', '十', '五', '加', '上', '二', '十'])
  })

  it('should size CAPTCHA_LEN default', function () {
    let t = new MathTopic()
    t._le = ['五']
    t._rt = ['二', '十']
    t._operator = '+'
    t._optLen = 1
    t._prepareSubject().should.eql(['五', '加', '二', '十', '是', '多', '少'])
  })
})

describe('rand tests', function () {
  it('should always set operator to +/-', function () {
    let t = new MathTopic()
    t._randOperator()
    _(100).times(function () {
      should(['+', '-'].indexOf(t._operator) > -1).be.exactly(true)
    })
  })

  it('should always return number of chinese', function () {
    _(100).times(function () {
      should(['2', '二'].indexOf(MathTopic._randStringify(2)[0]) > -1).be.exactly(true)
    })
  })

  it('should all lt 30 if operator is +', function () {
    let t = new MathTopic()
    t._operator = '+'
    _(100).times(function () {
      t._rand()
      should(t._leNum < 31).be.exactly(true)
      should(t._rtNum < 31).be.exactly(true)
      should(t._leNum + t._rtNum === t.result).be.exactly(true)
    })
  })

  it('should _leNum gt _rtNum if operator is -', function () {
    let t = new MathTopic()
    t._operator = '-'
    _(100).times(function () {
      t._rand()
      should(t._leNum <= 50).be.exactly(true)
      should(t._rtNum <= t._leNum).be.exactly(true)
      should(t._leNum - t._rtNum === t.result).be.exactly(true)
    })
  })
})

describe('nothing', function () {
  it('should run well', function () {
    MathTopic.rand().should.be.instanceof(MathTopic)
  })
})
