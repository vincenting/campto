/**
 * Created by vt on 15/10/8.
 */

'use strict';

var _ = require('underscore');

var StorageFactory = module.exports = function () {
    this.init.apply(this, arguments);
};

StorageFactory.storageKlassMap = {};
StorageFactory.implementNeededMethods = [
    'initialize'
];
StorageFactory.defaultType = 'redis';

StorageFactory.register = function (name, klass) {
    StorageFactory.implementNeededMethods.forEach(function (item) {
        if (!_.isFunction(klass[item])) {
            throw Error('Method should be overwrite', 'NO_IMPLEMENT');
        }
    });
    StorageFactory.storageKlassMap[name] = klass;
};

StorageFactory.prototype.init = function (options) {
    options = options || {};
    if (!StorageFactory.storageKlassMap.hasOwnProperty(options.type || StorageFactory.defaultType)) {
        throw Error('StorageFactory must init with type', 'STORAGE_INIT_PARAM_MISSING');
    }
    _.extend(this, StorageFactory.storageKlassMap[type]);
    this.initialize.call(this, options);
};

require('./redis-storage');