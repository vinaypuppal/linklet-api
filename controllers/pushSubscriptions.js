const Notification = require('../models/notification')
const webpush = require('../utils/webpush')

exports.saveSubscription = (req, res) => {
  const { subscription, subscriptionId } = req.body
  const notification = new Notification({ subscription, subscriptionId })
  notification
    .save()
    .then(() =>
      res
        .status(201)
        .send({ success: true, message: 'Subscribed successfully.' }))
    .catch(err => res.status(400).send(err))
}

exports.deleteSubscription = (req, res) => {
  const { subscriptionId } = req.params
  Notification.remove({ subscriptionId })
    .then(() => res.send({ success: true, message: 'Delete Successful' }))
    .catch(err => res.status(404).send(err))
}

exports.notifyUsers = (req, res) => {
  const { title, body } = req.body
  const payLoad = {
    title,
    body
  }
  Notification.find({}).then(docs => {
    docs.forEach(doc => {
      webpush
        .sendNotification(doc.subscription, JSON.stringify(payLoad))
        .then(() => {
          console.log('sent')
        })
        .catch(e => {
          console.log(e)
        })
    })
    res.send({ success: true })
  })
}
