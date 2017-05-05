module.exports = sort => {
  sort = Number(sort)
  let by
  if (sort === 1 || sort === -1) {
    by = { timestamp: sort }
  }
  if (sort === 2) {
    by = { views: 1, timestamp: -1 }
  }
  if (sort === -2) {
    by = { views: -1, timestamp: -1 }
  }
  if (sort === 3) {
    by = { bookmarksCount: 1, timestamp: -1 }
  }
  if (sort === -3) {
    by = { bookmarksCount: -1, timestamp: -1 }
  }
  return by
}
