/**
 * Created by vt on 15/9/29.
 */

'use strict';

var Topic = require('./lib/topic');
var Builder = require('./lib/builder');

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