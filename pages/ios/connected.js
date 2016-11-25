var xhr = require("xhr")

xhr({
    body: someJSONString,
    uri: "/foo",
    headers: {
        "Content-Type": "application/json"
    }
}, function (err, resp, body) {
    // check resp.statusCode
})

  var a = document.getElementById('closeCNA')
  a.onclick = function(event) {
    xhr 
    ['x-node-captive-portal'] = 'done'
  }