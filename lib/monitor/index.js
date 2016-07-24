/**
 * Created by vt on 15/11/3.
 */

'use strict'

const forever = require('forever')

const _defaultMonitorConfig = {
  pidPath: 'pids',
  initialCount: 1000,
  checkInterval: 2,
  threshold: 20,
  updateCount: 40
}

const Monitor = function (config) {
  this.config = Object.assign({}, _defaultMonitorConfig, config || {})
}

Monitor.prototype.watch = function () {}

Monitor.prototype.kill = function () {}

Monitor.prototype.flush = function () {}

module.exports = Monitor
