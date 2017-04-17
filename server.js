require('./config')
require('./mongoose')
require('now-logs')('linklet-api')
const Link = require('./models/link')
const User = require('./models/user')
const Notification = require('./models/notification')
const authenticate = require('./middlewares/authenticate')

const http = require('http')
const urlParser = require('url')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const RateLimit = require('express-rate-limit')

const addDays = require('date-fns/add_days')
const urlRegex = require('url-regex')
const escapeStringRegexp = require('escape-string-regexp')
const domainParser = require('domain-name-parser')
const isPorn = require('is-porn')
const uid = require('uid-promise')
const axios = require('axios')
const querystring = require('qs')
const _ = require('lodash')
const { scrapeUrl } = require('metascraper')

const expletives = require('./expletives.json')

var apiLimiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  delayMs: 0 // disabled
})

app.use(bodyParser.json())

app.use('/api/', apiLimiter)

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
    Link.find({ $text: { $search: search } }).count().then(count => {
      Link.find({ $text: { $search: search } })
        .populate('_creator')
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
        .populate('_creator')
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
    Link.find({
      timestamp: { $gt: start, $lte: end },
      $text: { $search: search }
    })
      .count()
      .then(count => {
        Link.find({
          timestamp: { $gt: start, $lte: end },
          $text: { $search: search }
        })
          .populate('_creator')
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
        .populate('_creator')
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

function wordInString (s, word) {
  return new RegExp('\\b' + escapeStringRegexp(word) + '\\b', 'i').test(s)
}

app.get('/api/metadata/', (req, res) => {
  let { url } = req.query
  if (!url) {
    return res.status(400).send({
      message: 'Please Provide URL!...'
    })
  }
  if (url && !/^https?:\/\//i.test(url)) {
    url = 'http://' + url
  }
  if (!urlRegex().test(url)) {
    return res.status(400).send({
      message: 'Please Provide Valid URL!...'
    })
  }
  const urlHostName = urlParser.parse(url).hostname
  try {
    const domain = domainParser(urlHostName).domainName
    console.log(domain)
    isPorn(domain, function (error, status) {
      if (error) return res.status(500).send({ message: 'Request Timeout' })
      console.log('status', status)
      if (!status) {
        console.log('Fetching Data')
        scrapeUrl(url)
          .then(data => {
            const { title, description } = data
            if (
              title && !expletives.every(word => !wordInString(title, word))
            ) {
              console.log('title')
              return res.status(400).send({
                message: 'Explicit content warning!. Only educational content allowed.'
              })
            }
            if (
              description &&
              !expletives.every(word => !wordInString(description, word))
            ) {
              console.log('desc')
              return res.status(400).send({
                message: 'Explicit content warning!. Only educational content allowed.'
              })
            }
            res.send(Object.assign({}, data, { url }))
          })
          .catch(e => {
            console.log(e)
            res.status(400).send({
              message: `Scraping the open graph data from ${url} failed.`,
              suggestion: 'Make sure your URL is correct and the webpage has open graph data, meta tags or twitter card data.'
            })
          })
      } else {
        res.status(400).send({
          message: 'Explicit content warning!. Only educational content allowed.'
        })
      }
    })
  } catch (e) {
    res.status(400).send({ message: 'Invalid Domain' })
  }
})

app.get('/api/proxy/:imgUrl(*)', (proxyReq, proxyResp) => {
  const { imgUrl } = proxyReq.params
  const destParams = urlParser.parse(imgUrl)

  const reqOptions = {
    host: destParams.host,
    port: 80,
    path: destParams.path,
    method: 'GET'
  }

  var req = http.request(reqOptions, res => {
    var headers = res.headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Headers'] = 'X-Requested-With'
    proxyResp.writeHead(200, headers)

    res.on('data', chunk => {
      proxyResp.write(chunk)
    })

    res.on('end', () => {
      proxyResp.end()
    })
  })

  req.on('error', e => {
    console.log('problem with request: ' + e.message)
    proxyResp.writeHead(503)
    proxyResp.write('An error happened!')
    proxyResp.end()
  })
  req.end()
})

/****************
  Auth Routes
****************/
const states = []
const githubUrl = 'github.com'

const loginUser = async accessToken => {
  const { data } = await axios.get(
    `https://api.${githubUrl}/user?access_token=${accessToken}`
  )
  const { email, login, name, avatar_url, id } = data
  const existingUser = await User.findOne({ githubId: id })
  if (existingUser) {
    return existingUser.generateAuthToken()
  }
  const user = new User({
    email,
    name,
    username: login,
    avatarUrl: avatar_url,
    githubId: id
  })
  return user.save().then(() => user.generateAuthToken())
}

const redirectWithQueryString = (
  res,
  data,
  appRedirectUrl = 'https://linklet.ml'
) => {
  const urlData = urlParser.parse(appRedirectUrl, true)
  if (!_.isEmpty(urlData.query) && urlData.query.next) {
    data.next = urlData.query.next
    appRedirectUrl = `${appRedirectUrl.split('?')[0]}?${querystring.stringify(data)}`
  } else {
    appRedirectUrl = `${appRedirectUrl}?${querystring.stringify(data)}`
  }
  const location = appRedirectUrl
  res.redirect(302, location)
}

app.get('/api/login/github', async (req, res) => {
  const { appRedirectUrl } = req.query
  const state = await uid(20)
  states.push({ state, appRedirectUrl })
  res.redirect(
    302,
    `https://${githubUrl}/login/oauth/authorize?scope=user:email&client_id=${process.env.GH_CLIENT_ID}&state=${state}`
  )
})

app.get('/api/github/callback', async (req, res) => {
  const { state, code } = req.query
  let appRedirectUrl
  let actualState
  res.header('Content-Type', 'text/html')
  console.log(state, code)
  if (!code && !state) {
    redirectWithQueryString(res, {
      error: 'Provide code and state query param'
    })
  } else if (!states.filter(item => item.state === state)[0]) {
    actualState = states.filter(item => item.state === state)
    appRedirectUrl = actualState[0].appRedirectUrl
    redirectWithQueryString(res, { error: 'Unknown state' }, appRedirectUrl)
  } else {
    actualState = states.filter(item => item.state === state)
    appRedirectUrl = actualState[0].appRedirectUrl
    _.remove(states, actualState)
    try {
      const { status, data } = await axios({
        method: 'POST',
        url: `https://${githubUrl}/login/oauth/access_token`,
        responseType: 'json',
        data: {
          client_id: process.env.GH_CLIENT_ID,
          client_secret: process.env.GH_CLIENT_SECRET,
          code
        }
      })

      if (status === 200) {
        const qs = querystring.parse(data)
        if (qs.error) {
          redirectWithQueryString(
            res,
            { error: qs.error_description },
            appRedirectUrl
          )
        } else {
          const loginToken = await loginUser(qs.access_token)
          redirectWithQueryString(
            res,
            { loginToken: loginToken },
            appRedirectUrl
          )
        }
      } else {
        redirectWithQueryString(
          res,
          { error: 'GitHub server error.' },
          appRedirectUrl
        )
      }
    } catch (err) {
      console.log(err)
      redirectWithQueryString(
        res,
        {
          error: 'Please provide GH_CLIENT_ID and GH_CLIENT_SECRET as,  environment variables. (or GitHub might be down)'
        },
        appRedirectUrl
      )
    }
  }
})

app.get('/api/logout', authenticate, async (req, res) => {
  const { appRedirectUrl } = req.query
  const token = req.loginToken
  const user = req.user
  try {
    await user.removeToken(token)
    redirectWithQueryString(res, {}, appRedirectUrl)
  } catch (e) {
    console.log(e)
    redirectWithQueryString(
      res,
      { error: 'Some internal server error' },
      appRedirectUrl
    )
  }
})

app.get('/api/users/me', authenticate, (req, res) => {
  res.send(req.user)
})

app.get('/api/links/me/all', authenticate, (req, res) => {
  const user = req.user
  const { page = 1, sort = -1, search } = req.query
  const perPage = 12
  if (search) {
    Link.find({ _creator: user._id, $text: { $search: search } })
      .count()
      .then(count => {
        Link.find({ _creator: user._id, $text: { $search: search } })
          .populate('_creator')
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
    Link.find({ _creator: user._id }).count().then(count => {
      Link.find({ _creator: user._id })
        .populate('_creator')
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

app.get('/api/links/me/filter', authenticate, (req, res) => {
  const user = req.user
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
    Link.find({
      timestamp: { $gt: start, $lte: end },
      $text: { $search: search },
      _creator: user._id
    })
      .count()
      .then(count => {
        Link.find({
          timestamp: { $gt: start, $lte: end },
          $text: { $search: search },
          _creator: user._id
        })
          .populate('_creator')
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
    Link.find({ timestamp: { $gt: start, $lte: end }, _creator: user._id })
      .count()
      .then(count => {
        Link.find({ timestamp: { $gt: start, $lte: end }, _creator: user._id })
          .populate('_creator')
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

app.post('/api/links', authenticate, (req, res) => {
  const { _id } = req.user
  console.log(req.body)
  let data = _.pick(req.body, [
    'url',
    'author',
    'date',
    'description',
    'image',
    'title',
    'publisher'
  ])
  console.log(data)
  data = Object.assign({}, data, {
    timestamp: new Date().getTime(),
    _creator: _id
  })
  const link = new Link(data)
  link
    .save()
    .then(doc => res.send(doc))
    .catch(err => res.status(400).send(err))
})

/*
  **** Notification Routes ****
*/
app.post('/api/subscriptions', (req, res) => {
  const { subscription, subscriptionId } = req.body
  const notification = new Notification({subscription, subscriptionId})
  notification.save(function (err, users) {
    if (err) {
      return res.json({ Error: err })
    } else {
      return res.status(201).json({ success: true, message: 'Subscribed successfully.' })
    }
  })
})

app.delete('/api/subscriptions/:subscriptionId', (req, res) => {
  const { subscriptionId } = req.params
  User.remove({subscriptionId})
    .then(() => {
      res.json({success: true, message: 'Delete Successful'})
    })
    .catch(() => {
      res.status(404).json({success: false, message: 'User Details Not Found'})
    })
})

app.listen(3000, err => {
  if (err) return console.log(err)
  console.log('> App running at port 3000')
})
