const mongoose = require('mongoose')
const Schema = mongoose.Schema
const webpush = require('web-push')

const vapidKeys = webpush.generateVAPIDKeys()
webpush.setGCMAPIKey(process.env.FCM_API_KEY)
webpush.setVapidDetails(
  'mailto:dev@vinaypuppal.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

const linkSchema = new Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  timestamp: {
    type: Number,
    required: true,
    index: true
  },
  author: String,
  date: String,
  description: String,
  image: String,
  publisher: String,
  title: String,
  _creator: {
    type: Schema.Types.ObjectId, ref: 'User'
  }
})

linkSchema.index({description: 'text', title: 'text', url: 'text'})

linkSchema.post('save', function (doc) {
  mongoose.model('User').findOne({_id: doc._creator})
    .then(user => {
      const payLoad = {
        title: `${user.username} posted a new link.`,
        body: doc.url
      }
      mongoose.model('Notification').find({})
        .then(docs => {
          docs.forEach(doc => {
            webpush.sendNotification(doc.subscription, JSON.stringify(payLoad))
          })
        })
    })
})

const Link = mongoose.model('Link', linkSchema)

module.exports = Link
