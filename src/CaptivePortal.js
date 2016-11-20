var CaptivePortal = module.exports = function CaptivePortal(options) {
  this.handler = this.handler.bind(this)
  this.clients = {}
  this.handler = this.handler.bind(this)
}

CaptivePortal.clientClasses = []

CaptivePortal.prototype.handler = function(req, res, next) {
  var clientIP = req.connection.remoteAddress
  var client = this._getClient(clientIP)
  var self = this

  if (!client) {
    CaptivePortal.clientClasses.some(function(clientClass) {
      if (clientClass.recognizes(req)) {
        client = new clientClass(clientIP)
        self._addClient(client)
        return true
      } else return false
    })
  }

  if (client) client.handler(req, res, next)
  else next()
}

CaptivePortal.prototype._addClient = function(client) {
  this.clients[client.ip] = client
  client.once('forget', this._forgetClient.bind(this, client))
}

CaptivePortal.prototype._getClient = function(ip) {
  return this.clients[ip]
}

CaptivePortal.prototype._forgetClient = function(client) {
  delete this.clients[client.ip]
  client.removeAllListeners()
}