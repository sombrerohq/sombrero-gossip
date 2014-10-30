# Sombrero Gossip

[![Build Status](https://travis-ci.org/sombrerohq/sombrero-gossip.svg)](https://travis-ci.org/sombrerohq/sombrero-gossip)

To be used as part of a Sombrero Node. Implements a gossip protocol over a set of peers.

## Install

```bash
$ npm install sombrero-gossip
```

## Require and Create

```javascript
var Gossip = require('sombrero-gossip');
var options = {
  port: 7000
};
var gossip = Gossip(options);
```

## Options:

* `port`:  defaults to 8217
* `peers`: array of peers, each containing an id, hostname and port attributes
* `interval`: the interval with which it contacts other nodes

## API

### gossip.addPeer(peer)

Add a peer. A peer must have the following attributes:

* id
* hostname
* port

### gossip.removePeer(peerId)

Removes a peer.

### gossip.cluster.set(key, value)

Set a gossip value on the cluster.

### gossip.cluster.get(key)

Returns the current known value.

# License

ISC