'use strict';

var Lab = require('lab');
var lab = exports.lab = Lab.script();
var it = lab.it;
var assert = Lab.assert;
var describe = lab.describe;

var async = require('async');
var Gossip = require('../');

var tolerance = 3e3;

describe('networked', function() {
  var nodes = [];
  var node;
  var port = 7000;
  for (var i = 0 ; i < 3 ; i ++) {
    node = Gossip({port: port + i});
    nodes.push(node);
  }

  nodes.forEach(function(nodeA) {
    nodes.forEach(function(nodeB, index) {
      if (nodeA != nodeB) {
        nodeA.addPeer({
          id: index + 1,
          hostname: 'localhost',
          port: nodeB.options.port
        });
      }
    });
  });

  it('sets the leader in one node', function(done) {
    nodes[0].cluster.set('leader', 'some node id');
    done();
  });

  it('after some time passes', {timeout: 11e3}, function(done) {
    setTimeout(done, tolerance);
  });

  it('all nodes know the new leader', function(done) {
    nodes.forEach(function(node) {
      assert.equal(node.cluster.get('leader'), 'some node id');
    });
    done();
  });

  it('can stop all nodes', {timeout: 6e3}, function(done) {
    async.each(nodes, function(node, cb) {
      node.stop(cb);
    }, done);
  });

  it('induce a change in one node', function(done) {
    nodes[nodes.length - 1].cluster.set('leader', 'some other node id');
    done();
  });

  it('after some time passes', {timeout: 11e3}, function(done) {
    setTimeout(done, tolerance);
  });

  it('change was not propagated', function(done) {
    nodes.forEach(function(node, index) {
      if (index < nodes.length - 1) {
        assert.equal(node.cluster.get('leader'), 'some node id');
      } else {
        assert.equal(node.cluster.get('leader'), 'some other node id');
      }
    });
    done();
  });

  it('can start all nodes', {timeout: 6e3}, function(done) {
    async.each(nodes, function(node, cb) {
      node.start(cb);
    }, done);
  });

  it('after some time passes', {timeout: 11e3}, function(done) {
    setTimeout(done, tolerance);
  });

  it('all nodes know the new leader', function(done) {
    nodes.forEach(function(node) {
      assert.equal(node.cluster.get('leader'), 'some other node id');
    });
    done();
  });

});
