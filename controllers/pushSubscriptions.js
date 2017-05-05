const Notification = require('../models/notification')

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
