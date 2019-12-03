## request

### req.app

此属性保存对使用中间件的Express应用程序实例的引用。

如果遵循创建仅导出中间件功能并将其在主文件中需要的函数的模块的模式，则中间件可以通过req.app访问Express实例。

```js
// index.js
app.get('/viewdirectory', require('./mymiddleware.js'))
// mymiddleware.js
module.exports = function (req, res) {
  res.send('The views directory is ' + req.app.get('views'))
}
```

### req.baseUrl

安装路由器实例的URL路径。

req.baseUrl属性类似于app对象的mountpath属性，不同之处在于app.mountpath返回匹配的路径模式。

```js
var greet = express.Router()

greet.get('/jp', function (req, res) {
  console.log(req.baseUrl) // /greet
  res.send('Konichiwa!')
})

app.use('/greet', greet) // load the router on '/greet'
```

即使使用路径模式或一组路径模式来加载路由器，baseUrl属性也会返回匹配的字符串，而不是模式。在下面的例子中，greet路由器以两种路径模式加载。

```js
app.use(['/gre+t', '/hel{2}o'], greet) // load the router on '/gre+t' and '/hel{2}o'
```

### req.body

包含在请求体中提交的数据的键值对。默认情况下，它是未定义的，并且在您使用诸如express.json()或express.urlencoded()之类的身体解析中间件时填充它。

下面的示例展示了如何使用主体解析中间件来填充req.body。

```js
var express = require('express')

var app = express()

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/profile', function (req, res, next) {
  console.log(req.body)
  res.json(req.body)
})
```

### req.cookies

当使用cookie解析器中间件时，此属性是一个包含请求发送的cookie的对象。如果请求不包含cookie，则默认为{}。

```js
// Cookie: name=tj
console.dir(req.cookies.name)
// => 'tj'
```

如果cookie已经签名，则必须使用req.signedCookies。

有关更多信息，问题或疑虑，请参阅cookie分析器。

### req.fresh

指示请求是否为fresh。它与req.stale相反。

如果缓存控制请求标头中没有no-cache指令，并且以下任一条件成立，则为true：

指定了if-modified-since请求标头，并且上次修改的请求标头等于或早于修改后的响应标头。

if-none-match请求标头为*。

如果将if-none-match请求标头解析为伪指令，则与etag响应标头不匹配。

```js
console.dir(req.fresh)
// => true
```

### req.hostname

包含从Host HTTP标头派生的主机名。

如果信任代理设置的评估结果不为false，则此属性将从X-Forwarded-Host标头字段获取值。 此标头可以由客户端或代理设置。

如果请求中有多个X-Forwarded-Host标头，则使用第一个标头的值。 这包括具有逗号分隔值的单个标头，其中使用了第一个值。

```js
// Host: "example.com:3000"
console.dir(req.hostname)
// => 'example.com'
```

### req.ip

### req.ips

### req.method

Contains a string corresponding to the HTTP method of the request: GET, POST, PUT, and so on.

### req.originalUrl

这个属性很像req.url;但是，它保留了原始的请求URL，允许您重写req。免费的url内部路由的目的。例如，app.use()的挂载特性将重写req。url以剥离挂载poin

```js
// GET /search?q=something
console.dir(req.originalUrl)
// => '/search?q=something'
```

在中间件功能中，req.originalUrl是req.baseUrl和req.path的组合，如以下示例所示。

```js
app.use('/admin', function (req, res, next) { // GET 'http://www.example.com/admin/new'
  console.dir(req.originalUrl) // '/admin/new'
  console.dir(req.baseUrl) // '/admin'
  console.dir(req.path) // '/new'
  next()
})
```

### req.params

此属性是一个对象，其中包含映射到指定路由“参数”的属性。例如，如果您有route /user/:name，那么“name”属性可以作为req.params.name使用。该对象默认为{}。

```js
// GET /user/tj
console.dir(req.params.name)
// => 'tj'
```

### req.path

包含请求URL的路径部分。

```js
// example.com/users?sort=desc
console.dir(req.path)
// => '/users'
```

### req.protocol

```js
console.dir(req.protocol)
// => 'http'
```

### req.query

此属性是一个对象，其中包含路由中的每个查询字符串参数的属性。如果没有查询字符串，它就是空对象{}。

```js
// GET /search?q=tobi+ferret
console.dir(req.query.q)
// => 'tobi ferret'

// GET /shoes?order=desc&shoe[color]=blue&shoe[type]=converse
console.dir(req.query.order)
// => 'desc'

console.dir(req.query.shoe.color)
// => 'blue'

console.dir(req.query.shoe.type)
// => 'converse'

// GET /shoes?color[]=blue&color[]=black&color[]=red
console.dir(req.query.color)
// => ['blue', 'black', 'red']s
```

