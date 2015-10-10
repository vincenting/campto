/**
 * Created by vt on 15/10/9.
 */

'use strict';

var should = require('should');

var StorageFactory = require('../lib/storage/factory');

var redisUri = process.env.hasOwnProperty('DEVELOP_REDIS_URI') ?
    process.env['DEVELOP_REDIS_URI'] : 'redis://127.0.0.1:6379';
var redisHost = redisUri.split(':')[1].substring(2);
var redisPort = redisUri.split(':')[2];

describe('redis storage init', function () {
    it('should use uri if exist', function () {
        var s = new StorageFactory({uri: redisUri, type: 'redis'});
        s.__type.should.equal('redis');
    });

    it('should use host or use default if exist', function () {
        var s = new StorageFactory({host: redisHost, type: 'redis'});
        s.__type.should.equal('redis');
        var ss = new StorageFactory({host: redisHost, port: redisPort, type: 'redis'});
        ss.__type.should.equal('redis');
    });

    it('should use database if exist', function () {
        var s = new StorageFactory({host: redisHost, type: 'redis', database: 1});
        s.__type.should.equal('redis');
    });

});