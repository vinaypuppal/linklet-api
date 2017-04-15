const mongoose = require('mongoose')
const Schema = mongoose.Schema

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

const Link = mongoose.model('Link', linkSchema)

module.exports = Link
