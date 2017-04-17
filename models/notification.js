const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NotificationSchema = new Schema({
  subscriptionId: { type: String, required: true, unique: true },
  subscription: {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      auth: { type: String, required: true, unique: true },
      p256dh: { type: String, required: true, unique: true }
    }
  },
  registeredOn: { type: Date, default: Date.now }
})

const Notification = mongoose.model('Notification', NotificationSchema)

module.exports = Notification
