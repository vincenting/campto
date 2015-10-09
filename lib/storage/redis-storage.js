/**
 * Created by vt on 15/10/8.
 */

'use strict';

var redis = require('redis');

var StorageFactory = require('./factory');

module.exports = {
    initialize: function (storageOptions) {
        var redisOptions = {};
        try {
            require('hiredis');
            redisOptions.parser = 'hiredis';
        } catch (e) {
            console.log('hiredis is not installed.')
        }
        if (storageOptions.hasOwnProperty('uri')) {
            this.conn = redis.createClient(storageOptions.uri, redisOptions);
        } else {
            this.conn = redis.createClient(redisOptions);
        }

    }
};

StorageFactory.register('redis', module.exports);
