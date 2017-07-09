const mongoose = require('mongoose')
const Schema = mongoose.Schema
const axios = require('axios')
const apicache = require('apicache')

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
  views: { type: Number, default: 0 },
  bookmarkedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  bookmarksCount: { type: Number, default: 0 },
  _creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

linkSchema.index({ description: 'text', title: 'text', url: 'text' })

linkSchema.pre('save', function (next) {
  this.wasNew = this.isNew
  next()
})

linkSchema.post('save', function (doc) {
  console.log('post save....')
  apicache.clear()
  if (!this.wasNew) {
    return
  }
  console.log('sending push notification...')
  mongoose.model('User').findOne({ _id: doc._creator }).then(user => {
    const payLoad = {
      title: `${user.username} posted a new link.`,
      body: doc.url
    }
    axios
      .post('https://linklet-notify.now.sh', payLoad)
      .then(({ data }) => console.log(data))
      .catch(console.log)
  })
})

const Link = mongoose.model('Link', linkSchema)

module.exports = Link
