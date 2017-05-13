require('./config')
require('./mongoose')

const {
  sendAllLinks,
  sendFilteredLinks,
  sendAllBookmarkedLinks,
  sendFilteredBookmarkedLinks,
  saveLink,
  incrementView,
  bookmarkLink
} = require('./controllers/links')

const {
  loginWithGithub,
  loginWithGithubAccessToken,
  logout,
  handelGithubOAuth
} = require('./controllers/auth')

const { sendMetaData } = require('./controllers/metadata')

const {
  saveSubscription,
  deleteSubscription,
  notifyUsers
} = require('./controllers/pushSubscriptions')

const authenticate = require('./middlewares/authenticate')

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const RateLimit = require('express-rate-limit')
const cors = require('cors')

var apiLimiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  delayMs: 0 // disabled
})

app.use(cors())
console.log('cors enabled')
app.use(bodyParser.json())

app.use('/api/', apiLimiter)

app.get('/', (req, res) => res.status(404).send('Not Found'))

/*
/links/all?page=2&search=keyword
*/
app.get('/api/links/all/', sendAllLinks)

/*
/links/filter?start=738687637186&end=6327653668716&page=2&search=keyword
*/
app.get('/api/links/filter/', sendFilteredLinks)

app.get('/api/metadata/', sendMetaData)

/****************
  Auth Routes
****************/

app.get('/api/login', loginWithGithubAccessToken)

app.get('/api/login/github', loginWithGithub)

app.get('/api/github/callback', handelGithubOAuth)

app.get('/api/logout', authenticate, logout)

app.get('/api/users/me', authenticate, (req, res) => {
  res.send(req.user)
})

app.get('/api/links/me/all', authenticate, sendAllLinks)

app.get('/api/links/me/filter', authenticate, sendFilteredLinks)

app.get('/api/bookmarks/me/all', authenticate, sendAllBookmarkedLinks)

app.get('/api/bookmarks/me/filter', authenticate, sendFilteredBookmarkedLinks)

app.post('/api/links', authenticate, saveLink)

/*
  **** Link Update Routes ****
*/

app.patch('/api/links/:id/views', incrementView)

app.patch('/api/links/:id/bookmark', authenticate, bookmarkLink)

/*
  **** Notification Routes ****
*/
app.post('/api/subscriptions', saveSubscription)

app.delete('/api/subscriptions/:subscriptionId', deleteSubscription)

app.post('/api/notify', notifyUsers)

app.listen(process.env.PORT || 4000, err => {
  if (err) return console.log(err)
  console.log('> App running at port', process.env.PORT || 4000)
})
