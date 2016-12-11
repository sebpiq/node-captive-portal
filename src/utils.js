"use strict";
var arpParse = exports.arpParse = function(str) {
  var clients = {}
  str.split('\n').forEach(function(line) {
    var resultIp = line.match(exports.ipRegexp)
    var resultMac
    if (resultIp) {
      resultMac = line.match(exports.macRegexp)
      if (resultMac)
        clients[resultMac[2].toUpperCase()] = resultIp[0]
    }    
  })
  return clients
}

var iwinfoParse = exports.iwinfoParse = function(str) {
  var macList = []
  str.split('\n').forEach(function(line) {
    var result = line.match(exports.macRegexp)
    if (result) macList.push(result[2].toUpperCase())
  })
  return macList
}

// ref : http://stackoverflow.com/questions/19673544/javascript-regular-expression-on-mac-address
exports.macRegexp = /(\s|^)(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2})(\s|$)/

exports.ipRegexp = require('ip-regex').v4()