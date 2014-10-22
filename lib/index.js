var tor = require('tor-exits'),
  assert = require('assert');

var defaults = {
  set: 'tor-exits-redis'
};

/**
 * Update new exit nodes in redis by creating/appending to the set
 *
 * @param {Object} opts Options
 * @param {Function} cb
 */
module.exports.update = function(opts, cb) {
  assert(opts.db, '.db required');

  opts.set = opts.set || defaults.set;
  var client = opts.db;

  tor.fetch(function(err, data) {
    if (err) return cb(err);

    // parse exit node data
    var nodes = tor.parse(data);

    // Add nodes to a redis set
    client.sadd(opts.set, nodes, function(err) {
      cb(err);
    });
  });
};

/**
 * Check whether the given ip is a known Tor exit node
 *
 * @param {String} ip
 * @param {Object} opts Options
 * @param {Function} cb
 */
module.exports.check = function(opts, cb) {
  assert(opts.ip, '.ip required');
  assert(opts.db, '.db required');
  opts.set = opts.set || defaults.set;

  opts.db.sismember(opts.set, opts.ip, function(err, reply) {
    if (err) return cb(err);
    cb(null, reply === 1);
  });
};
