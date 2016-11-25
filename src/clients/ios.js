var util = require('util')
var path = require('path')
var mustache = require('mustache')
var fs = require('fs')
var BaseClient = require('./BaseClient')

var pageDir = path.join(__dirname, '..', '..', 'pages')


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
    return res.end('NO SUCCESS')
  } else next()
}


// iOS client that opens a page in CNA with a link to continue in 
// a full Safari window
var SafariIosClient = exports.SafariIosClient = function SafariIosClient() { 
  BaseIosClient.apply(this, arguments)
  this.rejectCaptiveNetworkSupport = true
}
util.inherits(SafariIosClient, BaseIosClient)

SafariIosClient.recognizes = function(req) {
  return BaseIosClient.isCaptiveNetworkSupport(req)
}

SafariIosClient.prototype.connectedPagePath = path.join(pageDir, 'ios', 'connected.html')
SafariIosClient.prototype.connectingPagePath = path.join(pageDir, 'ios', 'connecting.html')

SafariIosClient.prototype.handler = function(req, res, next) {
  var self = this
  var clientStatus = this.clientStatus(req, res)

  // requests testing the connectivity of the network :
  // - when first connecting to the network, any other page than "success.html" will trigger the CNA to open.
  // - when CNA is open if "success.html" is sent the CNA will be marked as connected.
  if (BaseIosClient.isCaptiveNetworkSupport(req)) {
    if (this.rejectCaptiveNetworkSupport)
      res.end('NO SUCCESS')
    else
      res.sendFile(path.join(pageDir, 'ios', 'success.html'))

  // Other requests start the connection process :
  // 1. "connecting.html":
  //  - picks a client id
  //  - sends a request to /CaptiveNetworkSupport, which will cause next CaptiveNetworkSupport request
  //    to be answered with "success.html" page
  //  - navigates to "connected.html" with the same id, also triggering the CNA 
  //    to send a new CaptiveNetworkSupport request
  // 
  // 2. "connected.html" (at this stage the CNA should be marked as connected) :
  //  - displays a link which allows to redirect the user to a full browser
  } else if (clientStatus.status === 'not-connected') {
    res.sendFile(this.connectingPagePath)

  } else if (clientStatus.status === 'connecting') {
    
    // Open for a short time the blocking on CaptiveNetworkSupport requests,
    // so that CNA can be marked as connected.
    if (req.path === '/CaptiveNetworkSupport') {
      this.rejectCaptiveNetworkSupport = false
      setTimeout(function() { self.rejectCaptiveNetworkSupport = true }, 5000)
      res.status(200).end()

    } else if (req.path === '/connected') {
      fs.readFile(this.connectedPagePath, function(err, contents) {
        if (err) return console.error(err)
        res.end(mustache.render(contents.toString(), { clientId: clientStatus.id }))
      })

    } else next()

  } else if (clientStatus.status === 'connected') next()
}