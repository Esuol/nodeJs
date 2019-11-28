require('dotenv').config()
const express = require('express')
const cuid = require('cuid')

const app = express()
// 请求id 的中间件

const requestId = (req: any, res: any, next: any) => {
  const requestId = cuid()
  req.id = requestId;
  // y延续传递到下一个中间件
  next()
}

app.use(requestId)

app.get('/', (req: any, res: any) => {
  req.send('\n\nHello, world!\n\n')
})

module.exports = app