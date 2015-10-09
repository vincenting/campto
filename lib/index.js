/**
 * Created by vt on 15/10/8.
 */

'use strict';

var path = require('path');

var Topic = require('./topic');
var Builder = require('./builder');

var rootPath = process.cwd();
var camptoConfig;
try {
    // 载入项目中配置文件 `campto.js` 或者 `campto.json`
    camptoConfig = require(path.join(rootPath, './campto'));
} catch (e) {
    console.error('\x1b[31m%s\x1b[0m',
        'Can not import campto config file from `' + rootPath + '/campto[.js|.json]`');
    process.exit(1);
}

module.exports = function (options) {
    options = options || {};
    if (options['preBuild'] !== true) {
        return function (callback) {
            var t = Topic.rand();
            Builder.toBuffer(t.subject, function (err, buffer) {
                if (err) return callback(err);
                callback(null, buffer, t.result);
            });
        };
    }
};
