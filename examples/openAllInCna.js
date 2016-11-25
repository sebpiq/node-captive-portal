var https = require('https')
var fs = require('fs')
var path = require('path')
var express = require('express')
var CaptivePortal = require('../index').CaptivePortal
var CnaIosClient = require('../index').CnaIosClient
var CnaAndroidClient = require('../index').CnaAndroidClient
CaptivePortal.clientClasses = [CnaAndroidClient, CnaIosClient]

// Start an HTTPS server with self-signed certificates
// This server simply redirects to our http server
var httpsApp = express()
var httpsServer = https.Server({
  key: fs.readFileSync(path.join(__dirname, './certs/server.key'), 'utf8'),
  cert: fs.readFileSync(path.join(__dirname, './certs/server.crt'), 'utf8'),
  passphrase: 'blabla',
  requestCert: true
}, httpsApp)
httpsApp.get('*', function(req, res) { res.redirect('http://a.co') })
httpsServer.listen(443, function() { console.log('https server listening') })

// HTTP server with captive portal
var httpApp = express()
var captivePortal = new CaptivePortal()
httpApp.use(captivePortal.handler)
httpApp.get('/', function(req, res) { res.sendFile('home.html', { root: __dirname }) })
httpApp.get('/a', function(req, res) { res.sendFile('a.html', { root: __dirname }) })
httpApp.get('/b', function(req, res) { res.sendFile('b.html', { root: __dirname }) })
httpApp.use('/assets', express.static(__dirname + '/assets'))
httpApp.get('*', function(req, res) { res.redirect('/') })
httpApp.listen(80, function() { console.log('http server listening') })