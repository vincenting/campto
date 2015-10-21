/**
 * Created by vt on 15/10/9.
 */

'use strict';

var should = require('should');

var StorageFactory = require('../lib/storage/factory');

describe('factory use with error', function () {
    it('should throw error if klass not implement all methods', function () {
        var k = {};
        (function () {
            StorageFactory.register('k', k);
        }).should.throw(Error);
    });

    it('should throw error if init with unknown storage type', function () {
        (function () {
            new StorageFactory({type: 'fakeStorageType'});
        }).should.throw(Error);
    });
});


describe('new storage registered', function () {
    it('should include all methods from klass', function () {
        var klass = {};
        StorageFactory.implementNeededMethods.forEach(function (item) {
            klass[item] = function () {

            };
        });
        klass.someMethod = function () {
            return 'hello world';
        };
        StorageFactory.register('userStorage', klass);
        var s = StorageFactory.create({type: 'userStorage'});

        s.someMethod().should.equal('hello world');
    });

    it('should use redisStorage if no options given', function () {
        var s = new StorageFactory(process
            .env.hasOwnProperty('DEVELOP_REDIS_URI') ? {uri: process.env['DEVELOP_REDIS_URI']} : undefined);
        s.__$type.should.equal('redis');
    });
});

describe('storage usage', function () {
    it('should count and return object when nextCaptcha', function (done) {
        var klass = {};
        StorageFactory.implementNeededMethods.forEach(function (item) {
            klass[item] = function () {

            };
        });
        klass.count = function (callback) {
            this.__$count = this.__$count ? this.__$count + 1 : 1;
            if (this.__$count % 2 === 0) {
                return callback('SomeError');
            }
            callback(null);
        };
        klass.next = function (callback) {
            callback(null, this.__$count);
        };

        StorageFactory.register('userStorage', klass);
        var s = StorageFactory.create({type: 'userStorage'});
        s.nextCaptcha(function (err, result) {
            result.should.equal(1);
            s.nextCaptcha(function (err) {
                err.should.equal('SomeError');
                done();
            });
        });
    });
});
