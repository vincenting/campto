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

const defaultGenerator = function (options) {
  options = options || {}
  const serverConfig = Object.assign({}, options, camptoConfig)
  if (options.hasOwnProperty('preBuild')) {
    console.warn('请勿在初始化时将预生成模式开启，该参数无效，请创建配置文件！')
  }
  if (serverConfig['preBuild'] !== true) {
    // 实时模式下支持运行时指定参数
    return config => {
      config = Object.assign({}, serverConfig, config)
      const topic = TopicStore.generateFrom(config.topic || 'math')
      return Builder.toBuffer(topic.subject, config).bind(topic).then(buffer => {
        return {
          result: topic.result,
          buffer: buffer
        }
      })
    }
  }

  const storage = StorageFactory.create(serverConfig)
  // 缓存模式不支持运行临时修改参数
  return _ => {
    return storage.nextCaptcha().then(captcha => {
      return fs.readFileAsync(captcha.path).bind(captcha)
    }).then(buffer => {
      return {
        result: topic.result,
        buffer: topic.buffer
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
