const Link = require('../models/link')
const sortBy = require('./sortBy')

module.exports = (
  { all, search, time, createdBy, bookmarkedBy, page, sort, perPage }
) => {
  let cursor
  let countCursor
  if (all) {
    cursor = Link.find({})
    countCursor = Link.find({}).count()
  }
  if (search) {
    cursor = Link.find({ $text: { $search: search } })
    countCursor = Link.find({ $text: { $search: search } }).count()
  }
  if (time) {
    cursor = Link.find({ timestamp: { $gt: time[0], $lte: time[1] } })
    countCursor = Link.find({
      timestamp: { $gt: time[0], $lte: time[1] }
    }).count()
  }
  if (search && time) {
    cursor = Link.find({
      timestamp: { $gt: time[0], $lte: time[1] },
      $text: { $search: search }
    })
    countCursor = Link.find({
      timestamp: { $gt: time[0], $lte: time[1] },
      $text: { $search: search }
    }).count()
  }
  if (createdBy) {
    cursor = Link.find({ _creator: createdBy })
    countCursor = Link.find({ _creator: createdBy }).count()
  }
  if (createdBy && search) {
    cursor = Link.find({ _creator: createdBy, $text: { $search: search } })
    countCursor = Link.find({
      _creator: createdBy,
      $text: { $search: search }
    }).count()
  }
  if (createdBy && time) {
    cursor = Link.find({
      timestamp: { $gt: time[0], $lte: time[1] },
      _creator: createdBy
    })
    countCursor = Link.find({
      timestamp: { $gt: time[0], $lte: time[1] },
      _creator: createdBy
    }).count()
  }
  if (createdBy && time && search) {
    cursor = Link.find({
      timestamp: { $gt: time[0], $lte: time[1] },
      $text: { $search: search },
      _creator: createdBy
    })
    countCursor = Link.find({
      timestamp: { $gt: time[0], $lte: time[1] },
      $text: { $search: search },
      _creator: createdBy
    }).count()
  }
  if (bookmarkedBy) {
    cursor = Link.find({ bookmarkedBy })
    countCursor = Link.find({ bookmarkedBy }).count()
  }
  if (bookmarkedBy && search) {
    cursor = Link.find({ bookmarkedBy, $text: { $search: search } })
    countCursor = Link.find({
      bookmarkedBy,
      $text: { $search: search }
    }).count()
  }
  if (bookmarkedBy && time) {
    cursor = Link.find({
      timestamp: { $gt: time[0], $lte: time[1] },
      bookmarkedBy
    })
    countCursor = Link.find({
      timestamp: { $gt: time[0], $lte: time[1] },
      bookmarkedBy
    }).count()
  }
  if (bookmarkedBy && time && search) {
    cursor = Link.find({
      timestamp: { $gt: time[0], $lte: time[1] },
      $text: { $search: search },
      bookmarkedBy
    })
    countCursor = Link.find({
      timestamp: { $gt: time[0], $lte: time[1] },
      $text: { $search: search },
      bookmarkedBy
    }).count()
  }
  return countCursor.then(count => {
    console.log(perPage)
    return cursor
      .populate('_creator')
      .skip(+perPage * (page - 1))
      .limit(+perPage)
      .sort(sortBy(sort))
      .then(links => ({ links, count }))
  })
}
