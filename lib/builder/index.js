/**
 * Created by vt on 15/9/30.
 */

'use strict'

const _ = require('lodash')
const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const temp = Promise.promisifyAll(require('temp'))
const gm = require('gm').subClass({imageMagick: true})
const uuid = require('node-uuid')

const CAMPTO_ASSETS_PATH = path.join(__dirname, './assets')
const DEFAULT_CAPTCHA_WIDTH = 285
const DEFAULT_CAPTCHA_HEIGHT = 50

Promise.promisifyAll(gm.prototype)
temp.track(true)

// @param subject 这里为 Array 类型，每一个元素应该为最小的等宽内容
// 例如一个文字、两个数字等等
const CaptchaBuilder = module.exports = function (subject) {
  // 预留熟悉给测试使用，确保每次处理完后缓存文件都会被清空
  this.tempFileArray = []
  this.doneStatus = false
  this.tempPrefix = uuid.v1()
  this.captchaHeight = DEFAULT_CAPTCHA_HEIGHT
  this.captchaWidth = DEFAULT_CAPTCHA_WIDTH
  this.subject = Array.isArray(subject) && subject || subject.split(' ')

  this.wordImgWidth = null
  this.fontSize = null
}

const _canvasBuilder = function (subject, options) {
  const captcha = new CaptchaBuilder(subject)
  options = options || {}
  return captcha.draw(options).bind(captcha).finally(captcha.done.bind(captcha))
}

CaptchaBuilder.toBuffer = function (subject, options) {
  return _canvasBuilder(subject, options).then(canvas => canvas.toBufferAsync())
}

CaptchaBuilder.toFile = function (subject, filePath, options) {
  return _canvasBuilder(subject, options).then(canvas => {
    return canvas.writeAsync(filePath)
  }).return(filePath)
}

CaptchaBuilder.prototype.draw = function (options) {
  this.prepareForDraw(options)
  return Promise.mapSeries(this.subject, this.createTempWordFile.bind(this))
    .then(wordsFiles => {
      return [wordsFiles, this.tempFile()]
    }).spread((wordsFiles, tempPath) => {
    const tempCaptcha = gm(wordsFiles.shift()).background('none')
    return tempCaptcha.append.apply(tempCaptcha, wordsFiles).append(true)
      .setFormat('png')
      .writeAsync(tempPath).return(tempPath)
  }).then(captchaPath => {
    const backgroundPath = this.getBackgroundImagePath()
    return gm(backgroundPath)
      .resize(this.captchaWidth, this.captchaHeight, '!')
      .composite(captchaPath)
      .geometry('+' + this.captchaWidth * .04 + '+0')
      .setFormat('png')
  })
}

CaptchaBuilder.prototype.prepareForDraw = function (options) {
  ['captchaHeight', 'captchaWidth'].forEach(item => {
    if (options.hasOwnProperty(item)) {
      this[item] = options[item]
    }
  })
  this.wordImgWidth = Math.floor(this.captchaWidth * .82 / this.subject.length)
  this.fontSize = Math.min(this.captchaHeight * .7, this.wordImgWidth / 1.15)
}

CaptchaBuilder.prototype.done = function () {
  // 这里无需处理意外，因为程序断开时会强制清除产生的所有临时文件
  const tempFileArray = this.tempFileArray.concat()
  this.doneStatus = true
  this.tempFileArray.length = 0
  Promise.all(tempFileArray, fs.unlinkAsync)
}

CaptchaBuilder.prototype.tempFile = function () {
  return temp.openAsync(this.tempPrefix).then(info => {
    this.tempFileArray.push(info.path)
    return fs.closeAsync(info.fd).return(info.path)
  })
}

CaptchaBuilder.prototype.createTempWordFile = function (word) {
  // 将每个内容快生产 32 像素大小随机字体随机颜色随机倾斜的临时图片
  return this.tempFile().then(tempPath => {
    return gm(this.wordImgWidth, this.captchaHeight, 'transparent')
      .fontSize(this.fontSize)
      .fill(this.randColor())
      .font(this.randFont())
      .drawText(0, 0, word, 'Center')
      .noise(this.randNoise())
      // 随机左右摆动
      .rotate('transparent', _.sample([1, -1]) * parseInt(Math.random() * 15, 10))
      .setFormat('png')
      .writeAsync(tempPath)
      .return(tempPath)
  })
}

CaptchaBuilder.prototype.getBackgroundImagePath = function () {
  // TODO: 该方法后期允许覆盖，即允许用户自定义背景生产方法
  return path.join(CAMPTO_ASSETS_PATH, 'image', 'bg.gif')
}

CaptchaBuilder.prototype.randFont = ($ => {
  const fontsArr = []
  _(6).times(function (n) {
    fontsArr.push(path.join(CAMPTO_ASSETS_PATH, 'font', './0' + (n + 1) + '.ttf'))
  })
  // TODO: 这里考虑后期允许用户自定义 fontsArr
  return function () {
    return _.sample(fontsArr)
  }
})()

CaptchaBuilder.prototype.randNoise = function () {
  const noises = ['uniform', 'gaussian', 'multiplicative', 'impulse', 'poisson', 'laplacian']
  return _.sample(noises)
}

CaptchaBuilder.prototype.randColor = function () {
  // TODO: 这里考虑后期允许用户自定义 colors
  const colors = ['#000000', '#b50000', '#373000']
  return _.sample(colors)
}
