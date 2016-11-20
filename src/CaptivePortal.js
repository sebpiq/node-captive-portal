var path = require('path')
var pageDir = path.join(__dirname, '..', 'pages')

// Usage:
//    var captivePortal = new CaptivePortal(options)
//    expressApp.use(captivePortal.handler)
//
// Options:
//    - `ifCna` : sets the behaviour in case the client sends 
//                Captive Network Assistant requests :
//                - 'cna' : does nothing special. All navigation will happen inside the CNA
//                - 'fullBrowser' : opens a single page on which links open a full browser
//    - `cnaPagePath` : Path of the CNA page when `ifCna === 'fullBrowser'`
//
var CaptivePortal = module.exports = function CaptivePortal(options) {
  this.options = options || {}
  this.options.ifCna = this.options.ifCna || 'cna'
  this.options.cnaPagePath = this.options.cnaPagePath 
    || path.join(pageDir, 'cna', 'connected.html')

  if (this.options.ifCna === 'fullBrowser') {
    // We periodically clean IP addresses, to avoid keeping IPs of clients
    // which aren't connected 
    var self = this
    var timeout = 15000
    setInterval(function() {
      var clientIP
      var now = +(new Date)
      for (clientIP in self.cnaIPAddresses) {
        if (self.cnaIPAddresses[clientIP].timestamp < (now - timeout))
          delete self.cnaIPAddresses[clientIP]
      }
    }, timeout)
  }
  this.cnaIPAddresses = {}

  this.handler = this.handler.bind(this)
}

CaptivePortal.prototype.handler = function(req, res, next) {
  if (this.options.ifCna === 'cna') 
    this._inCnaHandler(req, res, next)
  else this._inFullBrowserHandler(req, res, next)
}

// This handler will keep all pages open in CNA 
CaptivePortal.prototype._inCnaHandler = function(req, res, next) { 
  if (this.isCaptiveNetworkSupport(req)) {
    return res.end('OPEN THAT CNA')
  } else next()
}

// This handler will open the first page in CNA.
// This page should be served at /cna
// All links clicked on that first CNA page will be opened in full browser
// See : http://stackoverflow.com/questions/23281552/captive-wifi-popup-click-a-link-to-open-safari/40561556#40561556
CaptivePortal.prototype._inFullBrowserHandler = function (req, res, next) {
  var clientIP = req.connection.remoteAddress

  // An iOS client is sending captive network support request. 
  if (this.isCaptiveNetworkSupport(req)) {

    // We answer the first CaptiveNetworkSupport request with any page that is not the iOS "success" page
    if (!this.cnaIPAddresses.hasOwnProperty(clientIP)) {
      this.cnaIPAddresses[clientIP] = { timestamp: +(new Date), status: 'connecting' }
      return res.end('OPEN THAT CNA')

    // Subsequent CaptiveNetworkSupport requests will be answered with the iOS "success" page,
    // so that the CNA is marked as "connected" and links open in full browser instead of CNA. 
    } else {
      return res.sendFile(path.join(pageDir, 'cna', 'iOS_Success.html'))
    }

  // If normal request, and the client is in the list of CNA IP addresses, we send :
  // 1. the "connecting" page, which simply reload to trigger another CaptiveNetworkSupport request
  // 2. the "connected" page which will allow to redirect the user to a full browser
  } else if (this.cnaIPAddresses.hasOwnProperty(clientIP)) {

    if (this.cnaIPAddresses[clientIP].status === 'connecting') {
      this.cnaIPAddresses[clientIP].status = 'connected'
      return res.sendFile(path.join(pageDir, 'cna', 'connecting.html'))
    
    } else if (this.cnaIPAddresses[clientIP].status === 'connected') {
      delete this.cnaIPAddresses[clientIP]
      return res.sendFile(this.cnaPagePath)
    }

  // For all other requests, we just send to the next handler
  } else next()
}

CaptivePortal.prototype.isCaptiveNetworkSupport = function(req) {
  return req.get('User-Agent') && req.get('User-Agent').search('CaptiveNetworkSupport') !== -1
}