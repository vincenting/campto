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
        var s = new StorageFactory({type: 'userStorage'});

        s.someMethod().should.equal('hello world');
    });
});