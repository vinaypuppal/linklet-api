const env = process.env.NODE_ENV || 'development'

if (env === 'development') {
  require('dotenv').config()
  process.env.NODE_ENV = 'development'
  process.env.MONGO_URL = 'mongodb://localhost/fcc-hyd-links'
} else if (env === 'test') {
  require('dotenv').config()
  process.env.MONGO_URL = 'mongodb://localhost/links-test'
}

process.env.PER_PAGE = 12

console.log(`**** Running in ${env} environment!. ****`)
