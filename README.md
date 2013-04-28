# tor-exits-redis

[![Build Status](https://travis-ci.org/freewil/tor-exits-redis.png)](https://travis-ci.org/freewil/tor-exits-redis)

Maintain set of tor exit nodes and run checks against it

## Install

`npm install tor-exits-redis`

## Usage

* update(options, cb)

Create/append to set of tor exit nodes

* check(ip, options, cb)

Check whether the given ip address is a known Tor exit node
