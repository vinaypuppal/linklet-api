const User = require('../models/user')
const uid = require('uid-promise')
const urlParser = require('url')
const _ = require('lodash')
const axios = require('axios')
const querystring = require('qs')

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

exports.loginWithGithub = async (req, res) => {
  const { appRedirectUrl } = req.query
  const state = await uid(20)
  states.push({ state, appRedirectUrl })
  res.redirect(
    302,
    `https://${githubUrl}/login/oauth/authorize?scope=user:email&client_id=${process.env.GH_CLIENT_ID}&state=${state}`
  )
}

exports.handelGithubOAuth = async (req, res) => {
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
}

exports.logout = async (req, res) => {
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
}

exports.loginWithGithubAccessToken = async (req, res) => {
  const accessToken = req.query.access_token
  if (!accessToken) {
    res.status(400).send({message: 'access_token query param required'})
  }
  try {
    const loginToken = await loginUser(accessToken)
    const user = await User.findByToken(loginToken)
    res.send({loginToken, user})
  } catch (e) {
    res.status(400).send(e)
  }
}
