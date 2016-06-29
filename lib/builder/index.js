/**
 * Created by vt on 15/9/30.
 */

'use strict'

const _ = require('lodash')
const async = require('async')
const fs = require('fs')
const gm = require('gm')
const path = require('path')
const temp = require('temp')
const uuid = require('node-uuid')

const CAMPTO_ASSETS_PATH = path.join(__dirname, './assets')
const DEFAULT_CAPTCHA_WIDTH = 285
const DEFAULT_CAPTCHA_HEIGHT = 50

temp.track(true)

// @param subject 这里为 Array 类型，每一个元素应该为最小的等宽内容
// 例如一个文字、两个数字等等
const CaptchaBuilder = module.exports = function (subject) {
  // 预留熟悉给测试使用，确保每次处理完后缓存文件都会被清空
  this._temp_files_array = []
  this._debug_error_assert = false
  this._done_for_debug = false
  this._temp_prefix = uuid.v1()
  this._captcha_height = DEFAULT_CAPTCHA_HEIGHT
  this._captcha_width = DEFAULT_CAPTCHA_WIDTH
  this._subject = Array.isArray(subject) ? subject : subject.split(' ')

  this.wordImgWidth = null
  this.fontSize = null
}

const _canvasBuilder = function (subject, options, callback) {
  const c = new CaptchaBuilder(subject)
  options = options || {}
  c._debug_error_assert = options['_error_assert']
  c.draw(options, function (err, canvas) {
    if (err) {
      c.done()
      return callback.call(c, err)
    }
    callback.call(c, null, canvas)
  })
}

CaptchaBuilder.toBuffer = function (subject, callback, options) {
  _canvasBuilder(subject, options, function (err, canvas) {
    const c = this
    if (err) {
      return callback.call(c, err)
    }
    canvas.toBuffer(function (err, buffer) {
      c.done()
      if (err || ((err = c._debug_error_assert) === 'TO_BUFFER_WRITE_ERROR')) {
        return callback.call(c, err)
      }
      callback.call(c, null, buffer)
    })
  })
}

CaptchaBuilder.toFile = function (subject, filePath, callback, options) {
  _canvasBuilder(subject, options, function (err, canvas) {
    const c = this
    if (err) {
      return callback.call(c, err)
    }
    canvas.write(filePath, function (err) {
      c.done()
      if (err || ((err = c._debug_error_assert) === 'TO_FILE_WRITE_ERROR')) {
        return callback.call(c, err)
      }
      callback.call(c, null)
    })
  })
}

CaptchaBuilder.prototype.draw = function (options, callback) {
  const self = this
  self.prepareForDraw(options)
  async.map(this._subject, self.createTempWordFile.bind(self), function (err, wordsFiles) {
    if (err) return callback(err, null)
    // 将所有临时单个字母的图片拼凑成一张临时图片
    self.tempFile(function (err, tempPath) {
      if (err) return callback(err, null)
      const tempCaptcha = gm(wordsFiles.shift())
      tempCaptcha.append.apply(tempCaptcha, wordsFiles).append(true)
        .setFormat('png')
        .write(tempPath, function (err) {
          if (err || ((err = self._debug_error_assert) === 'DRAW_TEMP_FILE_WRITE_ERROR')) return callback(err, null)
          self.getBackgroundImage(function (err, backgroundPath) {
            if (err || ((err = self._debug_error_assert) === 'DRAW_BACKGROUND_IMG_ERROR')) return callback(err, null)
            callback(false, gm(backgroundPath)
              .composite(tempPath).geometry('+' + self._captcha_width * .04 + '+0').setFormat('png'))
          })
        })
    })
  })
}

CaptchaBuilder.prototype.prepareForDraw = function (options) {
  const self = this
  ;['captcha_height', 'captcha_width'].forEach(function (item) {
    if (options.hasOwnProperty(item)) {
      self['_' + item] = options[item]
    }
  })
  this.wordImgWidth = Math.floor(this._captcha_width * .82 / this._subject.length)
  this.fontSize = Math.min(this._captcha_height * .7, this.wordImgWidth / 1.15)
}

CaptchaBuilder.prototype.done = function () {
  // 这里无需处理意外，因为程序断开时会强制清除产生的所有临时文件
  const self = this
  const _temp_files_array = self._temp_files_array.concat()
  self._done_for_debug = true
  self._temp_files_array.length = 0
  async.each(_temp_files_array, fs.unlink)
}

CaptchaBuilder.prototype.tempFile = function (callback) {
  const self = this
  temp.open(this._temp_prefix, function (err, info) {
    if (err || ((err = self._debug_error_assert) === 'TEMP_FILE_CREATE_ERROR')) return callback(err, null)
    self._temp_files_array.push(info.path)
    fs.close(info.fd, function () {
      callback(null, info.path)
    })
  })
}

CaptchaBuilder.prototype.createTempWordFile = function (word, callback) {
  const self = this
  // 将每个内容快生产 32 像素大小随机字体随机颜色随机倾斜的临时图片
  self.tempFile(function (err, tempPath) {
    if (err) return callback(err, null)
    gm(self.wordImgWidth, self._captcha_height, 'transparent')
      .fontSize(self.fontSize)
      .fill(self.randColor())
      .font(self.randFont())
      .drawText(0, 0, word, 'Center')
      .rotate('transparent', _.sample([1, -1]) * parseInt(Math.random() * 15, 10))
      .setFormat('png')
      .write(tempPath, function (err) {
        if (err || ((err = self._debug_error_assert) === 'WORD_TEMP_FILE_WRITE_ERROR')) return callback(err, null)
        callback(null, tempPath)
      })
  })
}

CaptchaBuilder.prototype.getBackgroundImage = function (callback) {
  // TODO: 该方法后期允许覆盖，即允许用户自定义背景生产方法
  callback(null, path.join(CAMPTO_ASSETS_PATH, 'image', 'bg.gif'))
}

CaptchaBuilder.prototype.randFont = (function () {
  const fontsArr = []
  _(6).times(function (n) {
    fontsArr.push(path.join(CAMPTO_ASSETS_PATH, 'font', './0' + (n + 1) + '.ttf'))
  })
  // TODO: 这里考虑后期允许用户自定义 fontsArr
  return function () {
    return _.sample(fontsArr)
  }
})()

CaptchaBuilder.prototype.randColor = function () {
  // TODO: 这里考虑后期允许用户自定义 colors
  const colors = ['#000000', '#b50000', '#373000', '#847284']
  return _.sample(colors)
}
