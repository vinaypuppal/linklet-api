const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uid = require('uid-promise')
const _ = require('lodash')

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  avatarUrl: {
    type: String
  },
  name: String,
  email: String,
  githubId: {
    type: Number,
    unique: true,
    required: true,
    index: true
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      },
      access: {
        type: String,
        required: true
      }
    }
  ]
})

// instance methods
UserSchema.methods.generateAuthToken = function () {
  const user = this
  const access = 'auth'
  return uid(20)
    .then(token => {
      user.tokens.push({ access, token })
      return user.save().then(() => token)
    })
}

UserSchema.methods.removeToken = function (token) {
  const user = this
  return user.update({ $pull: { tokens: { token } } })
}

// to overide what sent to client
UserSchema.methods.toJSON = function () {
  const user = this
  // convert user to object
  const userObj = user.toObject()
  return _.pick(userObj, [ '_id', 'username', 'avatarUrl', 'email', 'name' ])
}

// model methods
UserSchema.statics.findByToken = function (token) {
  const User = this
  return User.findOne({
    'tokens.token': token
  })
}

const User = mongoose.model('User', UserSchema)

module.exports = User
