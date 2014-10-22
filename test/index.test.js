var redis = require('redis');
var tor = require('../lib/index');
var assert = require('assert');

describe('tor-exits-redis', function() {
  // Clean up
  beforeEach(function(done) {
    var client = redis.createClient();
    client.del('tor-exits-redis-test', function(err){
      done();
    });
  });

  describe('check()', function() {
    // create some fictional tor nodes for testing purposes
    beforeEach(function(done) {
      var client = redis.createClient();
      var nodes = ['100.100.100.100', '127.0.0.1'];
      client.sadd('tor-exits-redis-test', nodes, function(err) {
        client.quit();
        done(err);
      });
    });

    it('should detect Tor nodes', function(done) {
      var client = redis.createClient();
      tor.check({
          ip: '127.0.0.1',
          db: client,
          set: 'tor-exits-redis-test'
      }, function(err, isTor) {
        assert.ifError(err);
        assert.ok(isTor === true);
        tor.check({
            ip: '100.100.100.100',
            db: client,
            set: 'tor-exits-redis-test'
        }, function(err, isTor) {
          assert.ifError(err);
          assert.ok(isTor === true);
          client.quit();
          done();
        });
      });
    });

    it('should not detect non-Tor nodes', function(done) {
      var client = redis.createClient();
      tor.check({
        ip: '192.168.1.1',
        db: client,
        set: 'tor-exits-redis-test'
      }, function(err, isTor) {
        assert.ifError(err);
        assert.ok(isTor === false);
        client.quit();
        done();
      });
    });
  });

  describe('update', function() {

    it('should work', function(done){
      var client = redis.createClient();
      client.smembers('tor-exits-redis-test', function(err, set) {
        assert.equal(set.length, 0);

        tor.update({
          db: client,
          set: 'tor-exits-redis-test'
        }, function() {

          client.smembers('tor-exits-redis-test', function(err, set) {
            assert.ok(set.length > 0);
          });
          done();
        });
      })
    });
  });

});
