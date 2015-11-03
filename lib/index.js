/**
 * Created by vt on 15/10/8.
 */

'use strict';

var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var Topic = require('./topic');
var Builder = require('./builder');
var Storage = require('./storage');
var Monitor = require('./monitor');

var requireCamptoConfig = function () {
  var rootPath = process.env['CAMPTO_ROOT_DIR'] || process.cwd();
  try {
    // 载入项目中配置文件 `campto.js` 或者 `campto.json`
    return _.extend(require(path.join(rootPath, './campto')), {
      rootPath: rootPath
    });
  } catch (e) {
    return {
      rootPath: rootPath
    };
  }
};

var camptoConfig = requireCamptoConfig();

var defaultServer = function () {
  var config = _.clone(camptoConfig);

  if (config['preBuild'] !== true) {
    // 非缓存模式支持启动时制定 config
    if (_.isObject(arguments[0])) {
      config = _.extend(config, arguments[0]);
    }
    return function (callback) {
      var t = Topic.rand(config);
      Builder.toBuffer(t.subject, function (err, buffer) {
        if (err) return callback(err);
        callback(null, buffer, t.result);
      });
    };
  }

  var storage = Storage.create(config);
  return function (callback) {
    storage.nextCaptcha(function (err, c) {
      fs.readFile(c.path, function (err, buffer) {
        if (err) return callback(err);
        callback(null, buffer, c.result);
      });
    });
  };
};

module.exports = {
  camptoConfig: camptoConfig,
  defaultServer: defaultServer,

  Storage: Storage,
  Builder: Builder,
  Topic: Topic,
  Monitor: Monitor
};
