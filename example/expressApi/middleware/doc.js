// Writing middleware for use in Express apps

// 中间件函数是可以访问请求对象(req)、响应对象(res)和应用程序请求-响应周期中的下一个函数的函数。下一个函数是Express路由器中的一个函数，当调用该函数时，它将接替当前中间件执行中间件。

/**
 * 中间件功能可以执行以下任务
 * 执行任何代码。
 * 对请求和响应对象进行更改。
 * 结束请求-响应周期。
 * 调用堆栈中的下一个中间件。
 */

 // 如果当前中间件函数没有结束请求-响应周期，则必须调用next()将控制权传递给下一个中间件函数。否则，请求将被挂起。

 // Example

 // 定义并向应用程序添加两个中间件函数:一个名为myLogger的函数打印简单的日志消息，另一个名为requestTime的函数显示HTTP请求的时间戳。

 const express = require('express')
 const app = express()

 app.get('/', (req, res) => {
   res.send('hello world')
 })

// 下面是一个名为myLogger的中间件函数的简单示例。当应用程序的请求通过该函数时，该函数将打印日志。中间件函数被分配给一个名为myLogger的变量。
const myLogger = (req, res, next) => {
  console.log('LOGGED')
  next()
}

/**
 * Tip
 * 注意上面对next（）的调用。 调用此函数将调用应用程序中的下一个中间件函数。
 * next（）函数不是Node.js或Express API的一部分，而是传递给中间件函数的第三个参数。
 * next（）函数可以命名为任何名称，但按照惯例，它始终命名为“ next”。 为避免混淆，请始终使用此约定。
 */

 // 要加载中间件函数，请调用app.use（）并指定中间件函数。 例如，以下代码在路由到根路径（/）之前加载myLogger中间件函数。

const express = require('express')
const app = express()

const myLogger = function (req, res, next) {
  console.log('LOGGED')
  next()
}

app.use(myLogger)

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3000)

// 每当应用程序收到请求时，它都会将记录的消息打印到终端。

// 中间件加载的顺序很重要:首先加载的中间件功能也首先执行。

// 如果myLogger是在到达根路径的路由之后加载的，则该请求永远不会到达它，并且该应用不会显示“ LOGGED”，因为根路径的路由处理程序会终止请求-响应周期。

// 中间件函数myLogger只是打印一条消息，然后通过调用next()函数将请求传递给堆栈中的下一个中间件函数。

// RequestTime

// 接下来，我们将创建一个名为requestTime的中间件函数，并将一个名为requestTime的属性添加到请求对象。

const requestTime = (req, res, next) => {
  req.requestTime = Date.now()
  next()
}

// 该应用程序现在使用requestTime中间件功能。另外，根路径路由的回调函数使用中间件函数添加到req(请求对象)的属性。

var express = require('express')
var app = express()

var requestTime = function (req, res, next) {
  req.requestTime = Date.now()
  next()
}

app.use(requestTime)

app.get('/', function (req, res) {
  var responseText = 'Hello World!<br>'
  responseText += '<small>Requested at: ' + req.requestTime + '</small>'
  res.send(responseText)
})

app.listen(3000)

// 当您向应用程序的根发出请求时，应用程序现在会在浏览器中显示您的请求的时间戳。

// 因为您可以访问请求对象、响应对象、堆栈中的下一个中间件函数和整个Node.js API，所以使用中间件函数的可能性是无限的。

// ----------------------------------------------------------------------------------------------------

// Configuraable middleware

// 如果您需要中间件是可配置的，那么导出一个接受options对象或其他参数的函数，然后根据输入参数返回中间件实现。

// my-middleware.js

module.exports = function (options) {
  return function (req, res, next) {
    // Implement the middleware function based on the options object
    next()
  }
}

// 现在可以使用中间件，如下所示。

var mw = require('./my-middleware.js')

app.use(mw({ option1: '1', option2: '2' }))
