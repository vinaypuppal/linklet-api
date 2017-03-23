require('./config')
require('./mongoose')
const Link = require('./models/link')

const express = require('express')
const app = express()

const addDays = require('date-fns/add_days')

app.get('/', (req, res) => {
  res.status(404).send('Not Found')
})

/*
/links/all?page=1
*/
app.get('/links/all/', (req, res) => {
  const { page = 1 } = req.query
  const perPage = 25
  Link.find({}).count().then(count => {
    Link.find({})
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ timestamp: -1 })
      .then(links =>
        res.send({
          page,
          perPage,
          totalLinks: count,
          isLastPage: perPage * page >= count,
          links
        }))
      .catch(err => res.status(400).send(err))
  })
})

/*
/links/filter?start=738687637186&end=6327653668716&page=2
*/
app.get('/links/filter/', (req, res) => {
  const today = new Date()
  const last7thDay = addDays(today, -7)
  const {
    start = last7thDay.getTime(),
    end = today.getTime(),
    page = 1
  } = req.query
  const perPage = 25
  Link.find({ timestamp: { $gte: start, $lte: end } }).count().then(count => {
    Link.find({ timestamp: { $gte: start, $lte: end } })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ timestamp: -1 })
      .then(links =>
        res.send({
          page,
          perPage,
          totalLinks: count,
          isLastPage: perPage * page >= count,
          links
        }))
      .catch(err => res.status(400).send(err))
  })
})

app.listen(3000, err => {
  if (err) return console.log(err)
  console.log('> App running at port 3000')
})
