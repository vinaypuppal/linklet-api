const User = require('../models/user')
const querystring = require('qs')

const redirectWithQueryString = (res, data, appRedirectUrl) => {
  const location = `${appRedirectUrl}?${querystring.stringify(data)}`
  res.redirect(302, location)
}

const authenticate = (req, res, next) => {
  let { loginToken, appRedirectUrl } = req.query
  if (!loginToken) {
    loginToken = req.header('x-auth')
  }
  User
    .findByToken(loginToken)
    .then(user => {
      if (!user) {
        return Promise.reject(new Error())
      }
      req.user = user
      req.loginToken = loginToken
      next()
    })
    .catch(() => {
      if (appRedirectUrl) {
        redirectWithQueryString(res, { error: 'No user found' }, appRedirectUrl)
      } else {
        res.status(400).send({message: 'x-auth token not found'})
      }
    })
}

module.exports = authenticate
