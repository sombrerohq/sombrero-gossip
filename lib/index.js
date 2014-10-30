'use strict';

var net = require('net');
var Doc = require('crdt').Doc;
var extend = require('xtend');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var Synchronizer = require('./synchronizer');
var defaultOptions = require('./default_options');

module.exports = Gossip;

function Gossip(options) {
  if (!(this instanceof Gossip)) {
    return new Gossip(options);
  }

  EventEmitter.call(this);

  var self = this;

  this.options = extend({}, defaultOptions, options);
  this.peers = {};
  this.options.peers.forEach(function(peer) {
    self.addPeer(peer);
  });

  /// server
  this.server = net.createServer(onConnection);
  this.server.on('error', propagateError);
  this.listening = false;

  // CRDT
  this.doc = new Doc();
  this.cluster = this.doc.add({id: 'cluster'});

  // sync
  this.synchronizer = new Synchronizer(this, this.options);
  this.synchronizer.on('error', propagateError);

  this.start();

  function onConnection(con) {
    con.
      pipe(self.doc.createStream()).
      pipe(con);
  }

  function propagateError(err) {
    console.log('error', err.stack || err);
    if (err.message != 'Error: Not running') {
      self.emit('error', err);
    }
  }
}

inherits(Gossip, EventEmitter);

var G = Gossip.prototype;

G.start = function start(cb) {
  var self = this;

  this.synchronizer.start();
  if (! this.listening) {
    this.server.listen(this.options.port, listening);
  } else {
    setImmediate(cb);
  }

  function listening() {
    self.listening = true;
    if (cb) {
      cb();
    }
  }
};

G.addPeer = function addPeer(peer) {
  if (!peer.id) {
    throw new Error('need peer.id');
  }
  this.peers[peer.id] = peer;
};

G.removePeer = function removePeer(peer) {
  if (typeof peer == 'object') {
    peer = peer.id;
  }
  delete this.peers[peer];
};

G.eachPeer = function eachPeer(fn) {
  var self = this;
  Object.keys(this.peers).forEach(function(id) {
    fn.call(null, self.peers[id]);
  });
};

G.stop = function stop(cb) {
  var self = this;
  this.synchronizer.stop(function() {
    if (self.listening) {
      self.listening = false;
      self.server.close(function(err) {
        cb();
      });
    }
    else {
      setImmediate(cb);
    }
  });
};
