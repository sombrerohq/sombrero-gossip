'use strict';

var Lab = require('lab');
var lab = exports.lab = Lab.script();
var it = lab.it;
var assert = Lab.assert;
var describe = lab.describe;

var Gossip = require('../');

describe('gossip', function() {
  var gossip;

  it('can get created', function(done) {
    gossip = Gossip();
    done();
  });

  it('can get created with initial peers', function(done) {
    gossip = Gossip({
      peers: [{id: 'peer id', hostname: 'localhost', port: 8081}]
    });
    gossip.eachPeer(function(peer) {
      assert.deepEqual(peer, {id: 'peer id', hostname: 'localhost', port: 8081});
      done();
    });
  });

  it('cannot add peer without id', function(done) {
    assert.throws(function() {
      gossip.addPeer({hostname: 'localhost', port: 8001});
    });
    done();
  });

  it('can remove peer by object', function(done) {
    gossip.removePeer({id: 'peer id'});
    done();
  });

  it('can add peer', function(done) {
    gossip.addPeer({id: 'peer id', hostname: 'localhost', port: 8001});
    gossip.eachPeer(function(peer) {
      assert.deepEqual(peer, {id: 'peer id', hostname: 'localhost', port: 8001});
      done();
    });
  });

  it('can remove peer by id', function(done) {
    gossip.removePeer('peer id');
    done();
  });

  it('remove worked', function(done) {
    gossip.eachPeer(function(peer) {
      assert(false, 'should not have peers');
    });
    done();
  });

  it('can get closed', function(done) {
    gossip.close(done);
  });
});