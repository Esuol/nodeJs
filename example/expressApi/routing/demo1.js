/**
 * @function app.all
 * @argument path
 * 用于在所有HTTP请求方法的路径上加载中间件函数。例如，无论使用GET、POST、PUT、DELETE还是HTTP模块中支持的任何其他HTTP请求方法，会对路由“/secret”的请求执行以下处理程序。
 */

 const express = require('express')
 const app = express()

 app.all('/secret', (req, res) => {
   console.log('i am secret')
   next()
 })

 /**
  * 以下是一些基于字符串的路由路径示例。
  * 此路由路径会将请求与根路由/匹配。
  */

app.get('/', function (req, res) {
  res.send('root')
})

app.get('/about', function (req, res) {
  res.send('about')
})

app.get('/random.text', function (req, res) {
  res.send('random.text')
})


/**
 * 下面是一些基于字符串模式的路由路径示例。
 * 此路径将匹配acd和abcd。
 */
app.get('/ab?cd', function (req, res) {
  res.send('ab?cd')
})

// 此路由路径将匹配abcd、abbcd、abbbcd等。
app.get('/ab+cd', function (req, res) {
  res.send('ab+cd')
})

// 此路由路径将匹配abcd、abxcd、abRANDOMcd、ab123cd等
app.get('/ab*cd', function (req, res) {
  res.send('ab*cd')
})

// 此路由路径将匹配/ abe和/ abcde。
app.get('/ab(cd)?e', function (req, res) {
  res.send('ab(cd)?e')
})

// 基于正则表达式的路由路径示例:此路由路径将匹配其中包含a的任何内容。
app.get(/a/, function (req, res) {
  res.send('/a/')
})

// 这条路线将匹配蝴蝶和蜻蜓，但不蝴蝶，蜻蜓，等等。
app.get(/.*fly$/, function (req, res) {
  res.send('/.*fly$/')
})


// ————————————————————————————————————————————————————————————————————————————————————————————————————

// Route parameters

// 要定义带有路由参数的路由，只需在路由的路径中指定路由参数，如下所示。

/**
 * Route path: /users/:userId/books/:bookId
 * Request URL: http://localhost:3000/users/34/books/8989
 * req.params: { "userId": "34", "bookId": "8989" }
 */

app.get('/users/:userId/books/:bookId', function (req, res) {
  res.send(req.params)
})


/**
 * 由于连字符（-）和点（。）是按字面解释的，因此可以将它们与路由参数一起使用，以达到有用的目的。
 *
 * ===========================================================
 * Route path: /flights/:from-:to
 * Request URL: http://localhost:3000/flights/LAX-SFO
 * req.params: { "from": "LAX", "to": "SFO" }
 *
 * ===========================================================
 * Route path: /plantae/:genus.:species
 * Request URL: http://localhost:3000/plantae/Prunus.persica
 * req.params: { "genus": "Prunus", "species": "persica" }
 *
 * =======================================================正则
 * Route path: /user/:userId(\d+)
 * Request URL: http://localhost:3000/user/42
 * req.params: {"userId": "42"}
 */


// ————————————————————————————————————————————————————————————————————————————————————————————————————

// Route handlers

// 您可以提供行为类似于中间件的多个回调函数来处理请求。 唯一的例外是这些回调可能会调用next（'route'）绕过其余的路由回调。
// 您可以使用此机制在路由上施加先决条件，然后在没有理由继续使用当前路由的情况下将控制权传递给后续路由。

// 路由处理程序可以采用函数，函数数组或二者组合的形式，如以下示例所示。

// 一个回调函数可以处理一个路由。例如
 app.get('/example/a', function (req, res) {
  res.send('Hello from A!')
})

// 多个回调函数可以处理一个路由(确保指定下一个对象)。例如
app.get('/example/b', function (req, res, next) {
  console.log('the response will be sent by the next function ...')
  next()
}, function (req, res) {
  res.send('Hello from B!')
})

// 一个回调函数数组可以处理一个路由。例如
var cb0 = function (req, res, next) {
  console.log('CB0')
  next()
}

var cb1 = function (req, res, next) {
  console.log('CB1')
  next()
}

var cb2 = function (req, res) {
  res.send('Hello from C!')
}

app.get('/example/c', [cb0, cb1, cb2])

// 独立函数和函数数组的组合可以处理路由。例如
var cb0 = function (req, res, next) {
  console.log('CB0')
  next()
}

var cb1 = function (req, res, next) {
  console.log('CB1')
  next()
}

app.get('/example/d', [cb0, cb1], function (req, res, next) {
  console.log('the response will be sent by the next function ...')
  next()
}, function (req, res) {
  res.send('Hello from D!')
})

// ————————————————————————————————————————————————————————————————————————————————————————————————————

// Response methods

// 下表中响应对象(res)上的方法可以向客户机发送响应，并终止请求-响应周期。如果这些方法都没有从路由处理程序调用，客户端请求将保持挂起状态。

