var express = require('express')
var CaptivePortal = require('../index').CaptivePortal
var CnaIosClient = require('../index').CnaIosClient
var CnaAndroidClient = require('../index').CnaAndroidClient
CaptivePortal.clientClasses = [CnaAndroidClient, CnaIosClient]

var app = express()
var captivePortal = new CaptivePortal({ ifCna: 'cna' })

app.use(captivePortal.handler)

app.get('/', function(req, res) { res.sendFile('home.html', { root: __dirname }) })
app.get('/a', function(req, res) { res.sendFile('a.html', { root: __dirname }) })
app.get('/b', function(req, res) { res.sendFile('b.html', { root: __dirname }) })

app.use('/assets', express.static(__dirname + '/assets'))

app.get('*', function(req, res) { res.redirect('/') })

app.listen(8000)