    xhr.send('/')
    headers['x-node-captive-portal'] = 'connected'

      // force the CNA to instantly resend a CaptiveNetworkSupport request
      window.location.reload(true)
