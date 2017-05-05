const urlRegex = require('url-regex')
const escapeStringRegexp = require('escape-string-regexp')
const domainParser = require('domain-name-parser')
const isPorn = require('is-porn')
const { scrapeUrl } = require('metascraper')
const urlParser = require('url')
const expletives = require('../utils/expletives.json')
const getRedirectedUrl = require('../utils/getRedirectedUrl')

function wordInString (s, word) {
  return new RegExp('\\b' + escapeStringRegexp(word) + '\\b', 'i').test(s)
}

exports.sendMetaData = (req, res) => {
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
    isPorn(domain, function (error, status) {
      if (error) return res.status(500).send({ message: 'Request Timeout' })
      if (!status) {
        getRedirectedUrl(url)
          .then(redirectedUrl => {
            scrapeUrl(redirectedUrl)
              .then(data => {
                const { title, description } = data
                if (
                  title && !expletives.every(word => !wordInString(title, word))
                ) {
                  return res.status(400).send({
                    message: 'Explicit content warning!. Only educational content allowed.'
                  })
                }
                if (
                  description &&
                  !expletives.every(word => !wordInString(description, word))
                ) {
                  return res.status(400).send({
                    message: 'Explicit content warning!. Only educational content allowed.'
                  })
                }
                res.send(
                  Object.assign({}, data, {
                    url: redirectedUrl.replace(/\/+$/, '')
                  })
                )
              })
              .catch(e => {
                console.log(e)
                res.status(400).send({
                  message: `Scraping the open graph data from ${url} failed.`,
                  suggestion: 'Make sure your URL is correct and the webpage has open graph data, meta tags or twitter card data.'
                })
              })
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
}
