require('./config')
require('./mongoose')
const Link = require('./models/link')

var http = require('http')
var url = require('url')
const express = require('express')
const app = express()

const addDays = require('date-fns/add_days')

app.get('/', (req, res) => {
  res.status(404).send('Not Found')
})

/*
/links/all?page=2&search=keyword
*/
app.get('/api/links/all/', (req, res) => {
  const { page = 1, sort = -1, search } = req.query
  const perPage = 12
  if (search) {
    Link.find({$text: {$search: search}}).count().then(count => {
      Link.find({$text: {$search: search}})
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ timestamp: sort })
      .then(links =>
        res.send({
          page,
          perPage,
          totalLinks: count,
          isLastPage: perPage * page >= count,
          links
        }))
      .catch(err => res.status(400).send(err))
    })
  } else {
    Link.find({}).count().then(count => {
      Link.find({})
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ timestamp: sort })
      .then(links =>
        res.send({
          page,
          perPage,
          totalLinks: count,
          isLastPage: perPage * page >= count,
          links
        }))
      .catch(err => res.status(400).send(err))
    })
  }
})

/*
/links/filter?start=738687637186&end=6327653668716&page=2&search=keyword
*/
app.get('/api/links/filter/', (req, res) => {
  const today = new Date()
  const last7thDay = addDays(today, -7)
  const {
    start = last7thDay.getTime(),
    end = today.getTime(),
    page = 1,
    sort = -1,
    search
  } = req.query
  const perPage = 12
  if (search) {
    Link.find({ timestamp: { $gt: start, $lte: end }, $text: {$search: search} }).count().then(count => {
      Link.find({ timestamp: { $gt: start, $lte: end }, $text: {$search: search} })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ timestamp: sort })
      .then(links =>
        res.send({
          page,
          perPage,
          totalLinks: count,
          isLastPage: perPage * page >= count,
          links
        }))
      .catch(err => res.status(400).send(err))
    })
  } else {
    Link.find({ timestamp: { $gt: start, $lte: end } }).count().then(count => {
      Link.find({ timestamp: { $gt: start, $lte: end } })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ timestamp: sort })
      .then(links =>
        res.send({
          page,
          perPage,
          totalLinks: count,
          isLastPage: perPage * page >= count,
          links
        }))
      .catch(err => res.status(400).send(err))
    })
  }
})

app.get('/api/proxy/:imgUrl(*)', (proxyReq, proxyResp) => {
  const { imgUrl } = proxyReq.params
  const destParams = url.parse(imgUrl)

  const reqOptions = {
    host: destParams.host,
    port: 80,
    path: destParams.path,
    method: 'GET'
  }

  var req = http.request(reqOptions, function (res) {
    var headers = res.headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Headers'] = 'X-Requested-With'
    proxyResp.writeHead(200, headers)

    res.on('data', function (chunk) {
      proxyResp.write(chunk)
    })

    res.on('end', function () {
      proxyResp.end()
    })
  })

  req.on('error', function (e) {
    console.log('problem with request: ' + e.message)
    proxyResp.writeHead(503)
    proxyResp.write('An error happened!')
    proxyResp.end()
  })
  req.end()
})

app.listen(3000, err => {
  if (err) return console.log(err)
  console.log('> App running at port 3000')
})
