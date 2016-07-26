/**
 * Created by vt on 16/7/26.
 */

'use strict'

const chinese = require('./fragments')

module.exports = function () {
  const random = (from, to) => from + parseInt(Math.random() * (to - from), 10)
  const builder = chinese.builders[random(0, chinese.builders.length)]
  const params = Array(3)
    .fill()
    .map(_ => random(1, 9))
  const chinesefiyParams = params.map(num => chinese.num[num])
  return {
    subject: chinesefiyParams
      .reduce((pre, current, idx) => pre.replace(`{${idx}}`, current), builder[1])
      .split(''),
    result: params.reduce((pre, current, idx) => pre + current * builder[0][idx], 0)
  }
}

require('../').register('number', module.exports)
