const env = process.env.NODE_ENV || 'development'

if (env === 'development') {
  process.env.MONGO_URL = 'mongodb://localhost/links'
} else if (env === 'test') {
  process.env.MONGO_URL = 'mongodb://localhost/links-test'
}

console.log(`**** Running in ${env} environment!. ****`)
