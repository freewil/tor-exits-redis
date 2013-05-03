var tor = require('tor-exits'),
    redis = require('redis'),
    async = require('async');
    
var defaults = {
  pass: null,
  cmdLimit: 100,
  set: 'tor-exits-redis'
};

/**
 * Authenticate with redis if password is specified
 */
var auth = function(client, pass, cb) {
  if (pass) {
    client.auth(pass, cb);
  } else {
    process.nextTick(cb);
  }
};

/**
 * Update new exit nodes in redis by creating/appending to the set
 * 
 * @param {Object} options OPTIONAL
 * @param {Function} cb
 */
module.exports.update = function(options, cb) {
  // handle 1 arg: update(cb)
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  
  options = options || {};
  options.pass = options.pass || defaults.pass;
  options.cmdLimit = options.cmdLimit || defaults.cmdLimit;
  options.set = options.set || defaults.set;
  
  // create redis client
  var client = redis.createClient();
  
  // authenticate with redis if password is set
  auth(client, options.pass, function(err) {
    if (err) return cb(err);
    
    // retrieve exit node data
    tor.fetch(function(err, data) {
      if (err) return cb(err);
      
      // parse exit node data
      var nodes = tor.parse(data);
      
      // iterator function to add exit nodes to redis set
      var addNode = function(node, cb) {
        client.sadd(options.set, node.exitAddress.address, cb);
      };
      
      // limit how many nodes are added to set in parallel
      async.eachLimit(nodes, options.cmdLimit, addNode, function(err) {
        client.quit();
        cb(err);
      });
      
    });
  });
  
};

/**
 * Check whether the given ip is a known Tor exit node
 * 
 * @param {String} ip
 * @param {Object} options OPTIONAL
 * @param {Function} cb
 */
module.exports.check = function(ip, options, cb) {
  // handle 2 args: check(ip, cb)
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  
  options = options || {};
  options.pass = options.pass || defaults.pass;
  options.set = options.set || defaults.set;
  
  // create redis client
  var client = redis.createClient();
  
  // authenticate with redis if password is set
  auth(client, options.pass, function(err) {
    if (err) return cb(err);
    
    // check if the ip is an exit node
    client.sismember(options.set, ip, function(err, reply) {
      client.quit();
      if (err) return cb(err);
      cb(null, reply === 1);
    });
    
  });
  
};
