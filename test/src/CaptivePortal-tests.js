var assert = require('assert')
var util = require('util')
var _ = require('underscore')
var CaptivePortal = require('../../src/CaptivePortal')
var BaseClient = require('../../src/BaseClient')

describe('CaptivePortal', function() {

  var DummyClient1 = function() { BaseClient.apply(this, arguments) }
  util.inherits(DummyClient1, BaseClient)
  DummyClient1.recognizes = function (req) { return req.dummy === 1 || req.recognizesAll }
  var DummyClient2 = function() { BaseClient.apply(this, arguments) }
  DummyClient2.recognizes = function (req) { return req.dummy === 2 || req.recognizesAll }
  util.inherits(DummyClient2, BaseClient)
  DummyClient1.prototype.handler = DummyClient2.prototype.handler 
    = function(req, res, next) { this.handlerArgs = [ req, res, next ] }

  var _getDummyReq = function(ip) { return { connection: { remoteAddress: ip } } }

  CaptivePortal.clientClasses = [ DummyClient1, DummyClient2 ]
  

  describe('handler', function() {

    it('should create the first recognized client and call its handler', function() {
      var captivePortal = new CaptivePortal()
      var req, res = {}, next = null
      assert.equal(_.keys(captivePortal.clients).length, 0)

      req = _getDummyReq('2.2.2.2')
      req.dummy = 2
      captivePortal.handler(req, res, next)
      assert.deepEqual(_.keys(captivePortal.clients), ['2.2.2.2'])
      assert.ok(captivePortal.clients['2.2.2.2'] instanceof DummyClient2)
      assert.deepEqual(captivePortal.clients['2.2.2.2'].handlerArgs, [req, res, next])

      req = _getDummyReq('1.1.1.1')
      req.recognizesAll = true
      captivePortal.handler(req, res, next)
      assert.deepEqual(_.keys(captivePortal.clients).sort(), ['1.1.1.1', '2.2.2.2'])
      assert.ok(captivePortal.clients['1.1.1.1'] instanceof DummyClient1)
      assert.deepEqual(captivePortal.clients['1.1.1.1'].handlerArgs, [req, res, next])
    })

    it('should just call next if no client recognized', function() {
      var captivePortal = new CaptivePortal()
      var req, res = {}, called = false, next = function() { called = true }

      req = _getDummyReq('1.1.1.1')
      captivePortal.handler(req, res, next)
      assert.equal(called, true)
    })

  })

  describe('forget client', function() {

    it('should forget the client when client emits "forget"', function() {
      var captivePortal = new CaptivePortal()
      var req, res = {}, next = null

      req = _getDummyReq('1.1.1.1')
      req.dummy = 1
      captivePortal.handler(req, res, next)
      assert.deepEqual(_.keys(captivePortal.clients), ['1.1.1.1'])

      captivePortal.clients['1.1.1.1'].emit('forget')
      assert.deepEqual(_.keys(captivePortal.clients), [])
    })

  })

})