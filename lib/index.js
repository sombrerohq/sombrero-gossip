'use strict';

var extend = require('xtend');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var defaultOptions = require('./default_options');

module.exports = Gossip;

function Gossip(options) {
  if (!(this instanceof Gossip)) {
    return new Gossip(options);
  }

  EventEmitter.call(this);

  var self = this

  this.options = extend({}, defaultOptions, options);
  this.peers = {};
  this.options.peers.forEach(function(peer) {
    self.addPeer(peer);
  });
};

inherits(Gossip, EventEmitter);

var G = Gossip.prototype;

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

G.eachPeer = function(fn) {
  var self = this;
  Object.keys(this.peers).forEach(function(id) {
    fn.call(null, self.peers[id]);
  });
};

G.close = function close(cb) {
  cb();
};