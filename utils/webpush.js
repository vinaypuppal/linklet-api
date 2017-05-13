const webpush = require('web-push')

const vapidKeys = webpush.generateVAPIDKeys()
webpush.setGCMAPIKey(process.env.FCM_API_KEY)
webpush.setVapidDetails(
  'mailto:dev@vinaypuppal.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

module.exports = webpush
