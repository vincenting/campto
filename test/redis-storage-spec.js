/**
 * Created by vt on 15/10/9.
 */

'use strict';

var should = require('should');
var async = require('async');

var StorageFactory = require('../lib/storage/factory');

var redisUri = process.env.hasOwnProperty('DEVELOP_REDIS_URI') ?
  process.env['DEVELOP_REDIS_URI'] : 'redis://127.0.0.1:6379';
var redisHost = redisUri.split(':')[1].substring(2);
var redisPort = redisUri.split(':')[2];

describe('redis storage init', function() {
  it('should use uri if exist', function() {
    var s = new StorageFactory({
      uri: redisUri,
      type: 'redis'
    });
    s.__$type.should.equal('redis');
  });

  it('should use host or use default if exist', function() {
    var s = new StorageFactory({
      host: redisHost,
      type: 'redis'
    });
    s.__$type.should.equal('redis');
    var ss = new StorageFactory({
      host: redisHost,
      port: redisPort,
      type: 'redis'
    });
    ss.__$type.should.equal('redis');
  });

  it('should use database if exist', function() {
    var s = new StorageFactory({
      host: redisHost,
      type: 'redis',
      database: 1
    });
    s.__$type.should.equal('redis');
  });
});

var createRedisStorage = function() {
  return StorageFactory.create({
    host: redisHost,
    type: 'redis',
    database: 1
  });
};

describe('redis storage usage', function() {
  it('should clear all keys after flush', function(done) {
    var s = createRedisStorage();
    s.conn.SET(s.storedKey, '1', function() {
      s.conn.SET(s.countKey, '1', function() {
        s.flush(function() {
          async.every([s.storedKey, s.countKey], function(item, callback) {
            s.conn.EXISTS(item, function(err, result) {
              return callback(!err && result == 0);
            });
          }, function(result) {
            should(result).be.exactly(true);
            done();
          });
        });
      })
    })
  });

  it('should raise error if empty', function(done) {
    var s = createRedisStorage();
    s.flush(function() {
      s.next(function(err) {
        err.message.should.equal('No item can be found in storage');
        done();
      });
    })
  });

  it('should raise error if anything unexpected', function(done) {
    var s = createRedisStorage();
    s.flush(function() {
      s.conn.SET(s.storedKey, '1', function() {
        s.next(function(err) {
          err.message.should.equal('WRONGTYPE Operation against a key holding the wrong kind of value');
          done();
        });
      });
    });
  });

  it('should next with success after update success', function(done) {
    var s = createRedisStorage();
    s.flush(function() {
      var data = {
        path: '/',
        result: 1
      };
      s.update([data], function() {
        s.next(function(_, d) {
          d.should.eql(data);
          done();
        });
      });
    });
  });

  it('should throw error if update with error', function(done) {
    var s = createRedisStorage();
    s.flush(function() {
      s.conn.SET(s.storedKey, '1', function() {
        s.update([{}], function(err) {
          err.message.should.equal('WRONGTYPE Operation against a key holding the wrong kind of value');
          done();
        });
      });
    });
  });

  it('should increase in multi-thread with count', function(done) {
    var s = createRedisStorage();
    s.flush(function() {
      async.times(5, function(n, next) {
        var v = createRedisStorage();
        v.nextCaptcha(function(err) {
          next(err)
        });
      }, function() {
        s.currentLoad(function(err, count) {
          count.should.equal(5);
          done();
        });
      })
    });
  });
});
