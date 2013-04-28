var redis = require('redis');
var tor = require('../lib/index');
var async = require('async');
var assert = require('assert');

describe('tor-exits-redis', function() {
  
  // create some fictional tor nodes for testing purposes
  before(function(done) {
    var client = redis.createClient();
    var nodes = ['100.100.100.100', '127.0.0.1'];
    var addNode = function(node, cb) {
      client.sadd('tor-exits-redis-test', node, cb);
    };
    async.each(nodes, addNode, function(err) {
      client.quit();
      done(err);
    });
    
  });
  describe('check()', function() {
    
    var check = function(ip, cb) {
      tor.check(ip, { set: 'tor-exits-redis-test' }, cb);
    };
    
    it('should detect Tor nodes', function(done) {
      check('127.0.0.1', function(err) {
        assert.ok(err);
        check('100.100.100.100', function(err) {
          assert.ok(err);
          done();
        });
      });
    });
    
    it('should not detect non-Tor nodes', function(done) {
      check('192.168.1.1', done);
    });
    
  });
  
  describe('update', function() {
    it('should work');
  });
  
});
