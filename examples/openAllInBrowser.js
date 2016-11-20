var express = require('express')
var CaptivePortal = require('../index').CaptivePortal
var SafariIosClient = require('../index').SafariIosClient
var BrowserAndroidClient = require('../index').BrowserAndroidClient
CaptivePortal.clientClasses = [SafariIosClient, BrowserAndroidClient]

var app = express()
var captivePortal = new CaptivePortal()

app.use(captivePortal.handler)

app.get('/', function(req, res) { res.sendFile('home.html', { root: __dirname }) })
app.get('/a', function(req, res) { res.sendFile('a.html', { root: __dirname }) })
app.get('/b', function(req, res) { res.sendFile('b.html', { root: __dirname }) })

app.use('/assets', express.static(__dirname + '/assets'))

app.get('*', function(req, res) { res.redirect('/') })

app.listen(80)