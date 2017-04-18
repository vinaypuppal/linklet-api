var url = require('url')
var protocols = {
  http: require('follow-redirects').http,
  https: require('follow-redirects').https
}

function getRedirectedUrl (host) {
  console.log('here')
  var opts = url.parse(host)
  var protocol = opts.protocol.replace(':', '')
  return new Promise((resolve, reject) => {
    const req = protocols[protocol].get(opts, function (res) {
      res.on('data', function () {})
      res.on('end', function () {
        console.log(res.responseUrl)
        resolve(res.responseUrl)
      })
      res.on('error', reject)
    })
    req.on('error', reject)
  })
}

module.exports = getRedirectedUrl
