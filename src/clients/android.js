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
  this.fakeConnectivity = false
}
util.inherits(BrowserAndroidClient, BaseAndroidClient)

BrowserAndroidClient.prototype.connectedPagePath = path.join(pageDir, 'android', 'connected.html')

BrowserAndroidClient.recognizes = function(req) {
  return BaseAndroidClient.isConnectivityCheck(req)
}

BrowserAndroidClient.prototype.handler = function(req, res, next) {
  var self = this
  var clientStatus = this.clientStatus(req, res)

  // requests testing the connectivity of the network :
  // - when first connecting to the network, any other HTTP response than 204 will trigger the CNA to open
  //   and display the responded page.
  // - when CNA is open if HTTP 204 is sent the CNA will close
  if (BaseAndroidClient.isConnectivityCheck(req)) {
    if (this.fakeConnectivity)
      res.status(204).end()
    else
      res.sendFile(this.connectedPagePath)
  
  // "connected.html" picks a client id so when the user clicks on the link, 
  // subsequent connectivity checks will be answered with 204, which will close the CNA.
  } else if (clientStatus.status === 'connecting') {
    this.fakeConnectivity = true
    setTimeout(function() { self.fakeConnectivity = false }, 5000)
    res.end()
  
  } else next()
}