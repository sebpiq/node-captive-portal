var util = require('util')
var path = require('path')
var BaseClient = require('./BaseClient')

var pageDir = path.join(__dirname, '..', 'pages')


// Base client for iOS devices
var BaseIosClient = function BaseIosClient() { 
  BaseClient.apply(this, arguments)
}
util.inherits(BaseIosClient, BaseClient)

BaseIosClient.isCaptiveNetworkSupport = function(req) {
  return req.get('User-Agent') && req.get('User-Agent').search('CaptiveNetworkSupport') !== -1
}


// iOS client that opens all pages in CNA
var CnaIosClient = exports.CnaIosClient = function CnaIosClient() { 
  BaseIosClient.apply(this, arguments) 
}
util.inherits(CnaIosClient, BaseIosClient)

CnaIosClient.recognizes = function(req) {
  return BaseIosClient.isCaptiveNetworkSupport(req)
}

CnaIosClient.prototype.handler = function(req, res, next) {
  if (BaseIosClient.isCaptiveNetworkSupport(req)) {
    return res.end('OPEN THAT CNA')
  } else next()
}


// iOS client that opens a page in CNA with a link to continue in 
// a full Safari window
var SafariIosClient = exports.SafariIosClient = function SafariIosClient() { 
  BaseIosClient.apply(this, arguments)
  this.status = 'connecting'
}
util.inherits(SafariIosClient, BaseIosClient)

SafariIosClient.recognizes = function(req) {
  return BaseIosClient.isCaptiveNetworkSupport(req)
}

SafariIosClient.prototype.connectedPagePath = path.join(pageDir, 'ios', 'connected.html')
SafariIosClient.prototype.connectingPagePath = path.join(pageDir, 'ios', 'connecting.html')

SafariIosClient.prototype.handler = function(req, res, next) {
  // An iOS client is sending captive network support request. 
  if (BaseIosClient.isCaptiveNetworkSupport(req)) {

    // We answer the first CaptiveNetworkSupport request with any page that is not the iOS "success" page
    if (this.status === 'connecting')
      return res.end('OPEN THAT CNA')

    // Subsequent CaptiveNetworkSupport requests will be answered with the iOS "success" page,
    // so that the CNA is marked as "connected" and links open in full browser instead of CNA. 
    else
      return res.sendFile(path.join(pageDir, 'ios', 'success.html'))

  // If normal request send :
  // 1. the "connecting" page, which simply reload to trigger another CaptiveNetworkSupport request
  // 2. the "connected" page which will allow to redirect the user to a full browser
  } else {

    if (this.status === 'connecting') {
      this.status = 'connected'
      return res.sendFile(this.connectingPagePath)
    
    } else if (this.status === 'connected') {
      this.emit('forget')
      return res.sendFile(this.connectedPagePath)
    }
  }
}