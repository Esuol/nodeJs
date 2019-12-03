## request

## properties

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

### req.route

包含当前匹配的路由，一个字符串。例如

```js
app.get('/user/:id?', function userIdHandler (req, res) {
  console.log(req.route)
  res.send('GET')
})

//  { path: '/user/:id?',
//   stack:
//    [ { handle: [Function: userIdHandler],
//        name: 'userIdHandler',
//        params: undefined,
//        path: undefined,
//        keys: [],
//        regexp: /^\/?$/i,
//        method: 'get' } ],
//   methods: { get: true } }
```

### req.secure

```js
console.dir(req.protocol === 'https')
```

### req.signedCookies

使用cookie解析器中间件时，此属性包含请求发送的已签名的cookie，未签名且可以使用。 已签名的cookie位于另一个对象中，以显示开发人员的意图。 否则，可能会对req.cookie值（很容易欺骗）进行恶意攻击。 请注意，对cookie进行签名不会使其“隐藏”或加密。 但只是防止篡改（因为用于签名的秘密是私有的）。

如果没有发送签名的cookie，则属性默认为{}。

```js
// Cookie: user=tobi.CP7AWaXDfAKIRfH49dQzKJx7sKzzSoPq7/AcBBRVwlI3
console.dir(req.signedCookies.user)
// => 'tobi'
```

### req.stale

指示请求是否过时，是否与req.fresh相反。

```js
console.dir(req.stale)
// => true
```

### req.subdomains

请求域名中的子域数组。

```js
// Host: "tobi.ferrets.example.com"
console.dir(req.subdomains)
// => ['ferrets', 'tobi']
```

### req.xhr

如果请求的X-Requested-With头字段是XMLHttpRequest，则该属性为真，表示请求是由客户机库(如jQuery)发出的。

```js
console.dir(req.xhr)
// => true
```

## methods

### req.accepts(types)

根据请求的Accept HTTP头字段检查指定的内容类型是否可接受。该方法返回最佳匹配，或者如果指定的内容类型都不可接受，则返回false(在这种情况下，应用程序应以406“不可接受”响应)。

类型值可以是单个MIME类型字符串(如“application/json”)、扩展名(如“json”)、逗号分隔的列表或数组。对于列表或数组，该方法返回最佳匹配(如果有的话)。

```js
// Accept: text/html
req.accepts('html')
// => "html"

// Accept: text/*, application/json
req.accepts('html')
// => "html"
req.accepts('text/html')
// => "text/html"
req.accepts(['json', 'text'])
// => "json"
req.accepts('application/json')
// => "application/json"

// Accept: text/*, application/json
req.accepts('image/png')
req.accepts('png')
// => undefined

// Accept: text/*;q=.5, application/json
req.accepts(['html', 'json'])
// => "json"
```

### req.acceptsCharsets(charset [, ...])

基于请求s Accept-Charset HTTP头字段返回指定字符集的第一个可接受的字符集。如果不接受指定的字符集，则返回false。

### req.acceptsEncodings(encoding [, ...])

根据请求的Accept-Encoding HTTP标头字段，返回指定编码中的第一个接受的编码。 如果不接受任何指定的编码，则返回false。

### req.acceptsLanguages(lang [, ...])

基于请求s接受语言HTTP头字段返回指定语言的第一种可接受语言。如果不接受指定的语言，则返回false。

### req.get(field)

返回指定的HTTP请求头字段(大小写不敏感的匹配)。引用和引用字段是可互换的。

```js
req.get('Content-Type')
// => "text/plain"

req.get('content-type')
// => "text/plain"

req.get('Something')
// => undefined
```

### req.is(type)

如果传入请求的内容类型HTTP头字段与类型参数指定的MIME类型匹配，则返回匹配的内容类型。如果请求没有正文，则返回null。否则返回false。

```js
// With Content-Type: text/html; charset=utf-8
req.is('html')
// => 'html'
req.is('text/html')
// => 'text/html'
req.is('text/*')
// => 'text/*'

// When Content-Type is application/json
req.is('json')
// => 'json'
req.is('application/json')
// => 'application/json'
req.is('application/*')
// => 'application/*'

req.is('html')
// => false
```

### req.param(name [, defaultValue])

弃用。使用要求。参数要求。身体或要求。查询,如适用。

```js
// ?name=tobi
req.param('name')
// => "tobi"

// POST name=tobi
req.param('name')
// => "tobi"

// /user/tobi for /user/:name
req.param('name')
// => "tobi"
```
查找按以下顺序执行

req.params

req.body

req.query

### req.range(size[, options])

size参数是资源的最大大小。

options参数是一个可以具有以下属性的对象。

将返回范围数组或负数，指示错误解析。

-2表示格式错误的标题字符串

-1表示范围无法满足

```js
// parse header from request
var range = req.range(1000)

// the type of the range
if (range.type === 'bytes') {
  // the ranges
  range.forEach(function (r) {
    // do something with r.start and r.end
  })
}
```