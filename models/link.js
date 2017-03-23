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
  title: String
})

const Link = mongoose.model('Link', linkSchema)

module.exports = Link
