var util = require('util')
var path = require('path')
var BaseClient = require('./BaseClient')

var pageDir = path.join(__dirname, '..', '..', 'pages')


var BaseAndroidClient = function BaseAndroidClient() { BaseClient.apply(this, arguments) }
util.inherits(BaseAndroidClient, BaseClient)

BaseAndroidClient.isConnectivityCheck = function(req) {
  return req.url === '/generate_204'
}


// Android client that opens all pages in CNA
var CnaAndroidClient = exports.CnaAndroidClient = function CnaAndroidClient() { 
  BaseAndroidClient.apply(this, arguments) 
}
util.inherits(CnaAndroidClient, BaseAndroidClient)

CnaAndroidClient.recognizes = function(req) {
  return BaseAndroidClient.isConnectivityCheck(req)
}

CnaAndroidClient.prototype.handler = function(req, res, next) { next() }


// Android client only dislay a message in CNA and a button to close itself
var BrowserAndroidClient = exports.BrowserAndroidClient = function BrowserAndroidClient() { 
  BaseAndroidClient.apply(this, arguments)
  this.status = 'connecting'
}
util.inherits(BrowserAndroidClient, BaseAndroidClient)

BrowserAndroidClient.prototype.connectedPagePath = path.join(pageDir, 'android', 'closeCNA.html')

BrowserAndroidClient.recognizes = function(req) {
  return BaseAndroidClient.isConnectivityCheck(req)
}

BrowserAndroidClient.prototype.handler = function(req, res, next) {
  if (BaseAndroidClient.isConnectivityCheck(req)) {
    if (this.status === 'connecting')
      return res.sendFile(this.connectedPagePath)
    else
      return res.status(204).end()  
  } else if (this.status === 'connecting' && req.url === '/specialURL') {
    this.status = 'connected'
  } else next()
}