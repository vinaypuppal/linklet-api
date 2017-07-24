const addDays = require('date-fns/add_days')
const _ = require('lodash')
const Link = require('../models/link')
const findLinks = require('../utils/findLinks')
const perPage = process.env.PER_PAGE

exports.sendAllLinks = (req, res) => {
  const createdBy = req.user ? req.user._id : null
  const { page = 1, sort = -1, search } = req.query
  let allLinks
  if (search) {
    allLinks = findLinks({ page, sort, perPage, search, createdBy })
  } else if (createdBy) {
    allLinks = findLinks({ page, perPage, sort, createdBy })
  } else {
    allLinks = findLinks({ all: true, page, perPage, sort })
  }
  allLinks
    .then(({ links, count }) => {
      res.send({
        linksCount: links.length,
        page: +page,
        perPage: +perPage,
        totalLinks: count,
        isLastPage: perPage * page >= count,
        links
      })
    })
    .catch(err => res.status(400).send(err))
}

exports.sendFilteredLinks = (req, res) => {
  const createdBy = req.user ? req.user._id : null
  const today = new Date()
  const last7thDay = addDays(today, -7)
  const {
    start = last7thDay.getTime(),
    end = today.getTime(),
    page = 1,
    sort = -1,
    search
  } = req.query
  const time = [start, end]
  findLinks({ page, sort, search, time, createdBy, perPage })
    .then(({ links, count }) => {
      res.send({
        linksCount: links.length,
        page: +page,
        perPage: +perPage,
        totalLinks: count,
        isLastPage: perPage * page >= count,
        links
      })
    })
    .catch(err => res.status(400).send(err))
}

exports.sendAllBookmarkedLinks = (req, res) => {
  const bookmarkedBy = req.user ? req.user._id : null
  const { page = 1, sort = -1, search } = req.query
  let allLinks
  if (search) {
    allLinks = findLinks({ page, sort, perPage, search, bookmarkedBy })
  } else if (bookmarkedBy) {
    allLinks = findLinks({ page, perPage, sort, bookmarkedBy })
  } else {
    allLinks = findLinks({ all: true, page, perPage, sort })
  }
  allLinks
    .then(({ links, count }) => {
      res.send({
        page: +page,
        perPage,
        totalLinks: count,
        isLastPage: perPage * page >= count,
        links
      })
    })
    .catch(err => res.status(400).send(err))
}

exports.sendFilteredBookmarkedLinks = (req, res) => {
  const bookmarkedBy = req.user ? req.user._id : null
  const today = new Date()
  const last7thDay = addDays(today, -7)
  const {
    start = last7thDay.getTime(),
    end = today.getTime(),
    page = 1,
    sort = -1,
    search
  } = req.query
  const time = [start, end]
  findLinks({ page, sort, search, time, bookmarkedBy, perPage })
    .then(({ links, count }) => {
      res.send({
        page: +page,
        perPage,
        totalLinks: count,
        isLastPage: perPage * page >= count,
        links
      })
    })
    .catch(err => res.status(400).send(err))
}

exports.saveLink = (req, res) => {
  const { _id } = req.user
  let data = _.pick(req.body, ['url', 'description', 'image', 'title'])
  data = Object.assign({}, data, {
    timestamp: new Date().getTime(),
    _creator: _id
  })
  const link = new Link(data)
  link.save().then(doc => res.send(doc)).catch(err => res.status(400).send(err))
}

exports.incrementView = (req, res) => {
  const linkId = req.params.id
  Link.findByIdAndUpdate(linkId, { $inc: { views: 1 } }, { new: true })
    .then(doc => {
      res.send(doc)
    })
    .catch(err => {
      console.log(err)
      res.status(400).send(err)
    })
}

exports.bookmarkLink = (req, res) => {
  const { _id } = req.user
  const linkId = req.params.id
  Link.findById(linkId)
    .then(doc => {
      if (~doc.bookmarkedBy.indexOf(_id)) {
        doc.bookmarkedBy.pull(_id)
        doc.bookmarksCount = doc.bookmarkedBy.length
      } else {
        doc.bookmarkedBy.push(_id)
        doc.bookmarksCount = doc.bookmarkedBy.length
      }
      return doc.save()
    })
    .then(doc => {
      res.send(doc)
    })
    .catch(err => {
      console.log(err)
      res.status(400).send(err)
    })
}
