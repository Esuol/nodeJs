/**
 *
 * @param {*} err
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  switch(req.accepts(['html', 'json'])) {
    case 'html':
      res.render('error', { error: err })
      break
    default:
      res.send('500 Internal Server Error')
  }
}

module.exports = {
  errorHandler
}