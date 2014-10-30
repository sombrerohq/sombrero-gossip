'use strict';

var net = require('net');
var once = require('once');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

module.exports = Synchronizer;

function Synchronizer(node, options) {
  if (!(this instanceof Synchronizer)) {
    return new Synchronizer(node, options);
  }

  EventEmitter.call(this);

  var self = this;

  this.node = node;
  this.options = options;
  this.running = false;
  this.stopping = false;

  this._timeoutCallback = function() {
    self.timeoutCallback();
  };
}

inherits(Synchronizer, EventEmitter);

var S = Synchronizer.prototype;

S.start = function start() {
  this.stopping = false;
  this.schedule();
};

S.schedule = function schedule() {
  if (!this.running && !this.stopping) {
    this.timeout = setTimeout(this._timeoutCallback, this.randomTimeout());
    this.timeout.unref();
  }
};

S.randomTimeout = function randomTimeout() {
  var half = this.options.interval / 2;
  return Math.floor(Math.random() * half + half);
};

S.timeoutCallback = function timeoutCallback() {
  var self = this;
  if (!this.running) {
    this.running = true;
    this.syncOneRandomNode(function(err) {
      self.running = false;
      self.emit('ran');
      if (err) {
        self.emit('warning', err);
      }
      self.schedule();
    });
  }
};

S.syncOneRandomNode = function syncOneRandomNode(cb) {
  cb = once(cb);
  var peer = this.randomPeer();
  if (peer) {
    var con = net.connect(peer.port, peer.hostname);
    con.once('error', cb);
    con.once('close', cb);
    con.pipe(this.node.doc.createStream()).pipe(con);

    setTimeout(function() {
      con.end();
    }, this.options.interval);

  } else {
    setImmediate(cb);
  }
};

S.randomPeer = function randomPeer() {
  var peerKeys = Object.keys(this.node.peers);
  var peerKey = peerKeys[Math.floor(Math.random() * peerKeys.length)];
  return this.node.peers[peerKey];
};

S.stop = function stop(cb) {
  this.stopping = true;
  clearTimeout(this.timeout);
  if (this.running) {
    this.once('ran', cb);
  } else {
    setImmediate(cb);
  }
};
