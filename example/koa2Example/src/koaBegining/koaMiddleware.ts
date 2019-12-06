import { Context } from "vm";

// koa中间件开发和使用

// koa v1和v2中使用到的中间件的开发和使用
// generator 中间件开发在koa v1和v2中使用
// async await 中间件开发和只能在koa v2中使用

// generator中间件开发

// generator中间件返回的应该是function * () 函数

function log(ctx: any) {
  console.log(ctx.method, ctx.header.host + ctx.url)
}

function logMid () {
  return function * (this: any, next: () => void) {
    // 执行中间件的操作
    log(this)
    if ( next ) {
      yield next
    }
  }
}

// use in koa@1  generator中间件在koa@1中的使用

const koa = require('koa')
const app = new koa()

app.use(logMid)

app.use(function *(this: any) {
  this.body = 'hello world'
})

app.listen(3000)
console.log('the server is starting at port 3000')

// use in koa@2  generator中间件在koa@2中的使用

const convert = require('koa-convert')

app.use(convert(logMid))
app.use((ctx: Context) => {
  ctx.body = 'hello world'
})
app.listen(3001)
console.log('the server is starting at port 3000')

// ===========================================================================

// async 中间件开发

function logger(ctx: Context) {
  console.log(ctx.method, ctx.header.host + ctx.url)
}

function loggerMiddleware() {
  return async function(ctx: Context, next: () => void) {
    logger(ctx)
    await next
  }
}

// used in koa@2

// async 中间件只能在koa2中使用

app.use(loggerMiddleware)
app.use((ctx: Context) => {
  ctx.body =  'hello world'
})
app.listen(3000)
console.log('the server is starting at port 3000')



