/**
 * Created by vt on 15/10/8.
 */

'use strict'

const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

const TopicStore = require('./topics')
const Builder = require('./builder')
const StorageFactory = require('./storages')
const Monitor = require('./monitor')

const camptoConfig = (_ => {
  const rootPath = process.env['CAMPTO_ROOT_DIR'] || process.cwd()
  try {
    // 载入项目中配置文件 `campto.js` 或者 `campto.json`
    return Object.assign({
      rootPath: rootPath
    }, require(path.join(rootPath, './campto')))
  } catch (e) {
    return {
      rootPath: rootPath
    }
  }
})()

const defaultGenerator = function () {
  if (camptoConfig['preBuild'] !== true) {
    // 实时模式下支持运行时指定参数
    return config => {
      config = Object.assign({}, camptoConfig, config)
      const topic = TopicStore.generateFrom(config.topic || 'math')
      return Builder.toBuffer(topic.subject, config).bind(topic).then(buffer => {
        return {
          result: topic.result,
          buffer: buffer
        }
      })
    }
  }

  // 缓存模式不支持运行临时修改参数
  // TODO 考虑预生成模式引入通道，一个项目多种验证码配置
  return config => {
    const storage = StorageFactory.create(Object.assign({}, camptoConfig, config))
    return storage.nextCaptcha().then(captcha => {
      return [captcha.result, fs.readFileAsync(captcha.path)]
    }).spread((result, buffer) => {
      return {
        result: result,
        buffer: buffer
      }
    })
  }
}

module.exports = {
  camptoConfig: camptoConfig,
  defaultGenerator: defaultGenerator,

  StorageFactory: StorageFactory,
  TopicStore: TopicStore,
  Monitor: Monitor
}
