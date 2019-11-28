// res.locals 来存储当前用户的信息

const express = require('express')
const app = express()

const locals = (req:any, res: any, next: any) => {
  res.locals.user = req.user
  res.locals.authenticated = !req.user.anonymous
  next()
}

app.use(locals)


export {}