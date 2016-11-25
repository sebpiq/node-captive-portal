var util = require('util')
var EventEmitter = require('events').EventEmitter
var Cookies = require('cookies')

var BaseClient = module.exports = function BaseClient(ip) {
  this.ip = ip
  EventEmitter.apply(this)
}
util.inherits(BaseClient, EventEmitter)

// Checks the connection status of the client.
// This is done by recovering the client id from the request:
//  1. from the request query (status -> 'connecting')
//  2. from cookies (status -> 'connected')
BaseClient.prototype.clientStatus = function(req, res) {
  var cookies = new Cookies(req, res)
  var clientId

  if (clientId = req.query['node-captive-portal']) {
    cookies.set('node-captive-portal', clientId)
    return { status: 'connecting', id: clientId }
  
  } else if (clientId = cookies.get('node-captive-portal')) {
    return { status: 'connected', id: clientId }

  } else {
    return { status: 'not-connected', id: null }
  }
}