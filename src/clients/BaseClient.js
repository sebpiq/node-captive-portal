var util = require('util')
var EventEmitter = require('events').EventEmitter

var BaseClient = module.exports = function BaseClient(ip) {
  this.ip = ip
  EventEmitter.apply(this)
}
util.inherits(BaseClient, EventEmitter)
