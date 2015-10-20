/**
 * Created by vt on 15/10/8.
 */

'use strict';

var redis = require('redis');

var StorageFactory = require('./factory');

var DEFAULT_STORED_KEY = 'campto:store';
var DEFAULT_COUNT_KEY = 'campto:store';

module.exports = {
    initialize: function (storageOptions) {
        var redisOptions = {};
        this.__$storageOptions = storageOptions;
        try {
            require('hiredis');
            redisOptions.parser = 'hiredis';
        } catch (e) {
            console.log('hiredis is not installed.');
        }
        if (storageOptions.hasOwnProperty('uri')) {
            this.conn = redis.createClient(storageOptions.uri, redisOptions);
        } else {
            this.conn = redis.createClient(
                storageOptions.port || 6379,
                storageOptions.host || '127.0.0.1',
                redisOptions
            );
        }
        this.storedKey = storageOptions.storedKey || DEFAULT_STORED_KEY;
        this.countKey = storageOptions.countKey || DEFAULT_COUNT_KEY;
        if (storageOptions.hasOwnProperty('database')) {
            this.conn.select(storageOptions.database)
        }
    },

    next: function (callback) {
        this.conn.SRANDMEMBER(this.storedKey, 1, function (err, items) {
            if (err) return callback(err);
            if (items.length < 1) {
                return callback(Error('No item can be found in storage', 'STORAGE_EMPTY'));
            }
            callback(null, JSON.parse(items[0]));
        });
    },

    update: function (items, callback) {
        var itemsCount = items.length;
        var self = this;
        self.conn.SREM(self.storedKey, itemsCount, function (err) {
            if (err) return callback(err);
            self.conn.SADD(self.storedKey, itemsCount.map(function (item) {
                return JSON.stringify(item);
            }), callback)
        });
    },

    count: function (callback) {
        this.conn.INCR(this.countKey, callback);
    },

    currentLoad: function (callback) {
        this.conn.GETSET(this.countKey, 0, callback);
    }
};

StorageFactory.register('redis', module.exports);
