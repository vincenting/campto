/**
 * Created by vt on 15/10/8.
 */

'use strict';

var path = require('path');

var Topic = require('./topic');
var Builder = require('./builder');
var Storage = require('./storage');

var requireCamptoConfig = function (rootPath) {
    rootPath = rootPath || process.cwd();
    try {
        // 载入项目中配置文件 `campto.js` 或者 `campto.json`
        return require(path.join(rootPath, './campto'));
    } catch (e) {
        console.error('\x1b[31m%s\x1b[0m\n',
            'Can not import campto config file from `' + rootPath + '/campto[.js|.json]`');
        process.exit(1);
    }
};

module.exports.defaultServer = function () {
    var camptoConfig = requireCamptoConfig();

    if (camptoConfig['preBuild'] !== true) {
        return function (callback) {
            var t = Topic.rand(camptoConfig);
            Builder.toBuffer(t.subject, function (err, buffer) {
                if (err) return callback(err);
                callback(null, buffer, t.result);
            });
        };
    }

    // TODO: 这里将采用缓存方案，从 storage 里面获得验证码

};
