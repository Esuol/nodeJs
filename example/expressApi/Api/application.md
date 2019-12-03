## Application

app对象通常表示Express应用程序。通过调用express模块导出的顶级express()函数来创建它

```js
var express = require('express')
var app = express()

app.get('/', function (req, res) {
  res.send('hello world')
})

app.listen(3000)
```

### app对象有方法

路由HTTP请求;例如，请参见app.METHOD和app.param。

配置中间件;看到app.route。

渲染HTML视图;看到app.render。

注册模板引擎;看到app.engine。

> **SUCCESS** Express应用程序对象可以从请求对象和响应对象中引用为req。分别是app和res.app。

### app.locals

局部对象的属性是应用程序中的局部变量。

```js
console.dir(app.locals.title)
// => 'My App'

console.dir(app.locals.email)
// => 'me@myapp.com'
```

设置后，app.locals属性的值将在应用程序的整个生命周期中保持不变，而res.locals属性仅在请求的生命周期内有效。

您可以在应用程序内呈现的模板中访问局部变量。 这对于为模板以及应用程序级数据提供帮助功能很有用。 本地变量可通过req.app.locals在中间件中使用（请参阅req.app）

```js
var admin = express()

admin.get('/', function (req, res) {
  console.dir(admin.mountpath) // [ '/adm*n', '/manager' ]
  res.send('Admin Homepage')
})

var secret = express()
secret.get('/', function (req, res) {
  console.log(secret.mountpath) // /secr*t
  res.send('Admin Secret')
})

admin.use('/secr*t', secret) // load the 'secret' router on '/secr*t', on the 'admin' sub app
app.use(['/adm*n', '/manager'], admin) // load the 'admin' router on '/adm*n' and '/manager', on the parent app
```

### app.on('mount', callback(parent))

挂载事件在挂载到父应用程序时在子应用程序上触发。父应用程序被传递给回调函数。

注意

子应用程序将：

不继承具有默认值的设置的值。 您必须在子应用程序中设置值。

继承设置的值，没有默认值。

```js
var admin = express()

admin.on('mount', function (parent) {
  console.log('Admin Mounted')
  console.log(parent) // refers to the parent app
})

admin.get('/', function (req, res) {
  res.send('Admin Homepage')
})

app.use('/admin', admin)
```

### app.all(path, callback [, callback ...])

这个方法类似于标准的app.METHOD()方法，只是它匹配所有HTTP动词。

### app.delete(path, callback [, callback ...])

```js
app.all('/secret', function (req, res, next) {
  console.log('Accessing the secret section ...')
  next() // pass control to the next handler
})
```

使用指定的回调函数将HTTP删除请求路由到指定的路径。有关更多信息，请参见路由指南。

```js
app.delete('/', function (req, res) {
  res.send('DELETE request to homepage')
})
```

### app.disable(name)

将布尔设置名设置为false，其中name是app settings表中的一个属性。为一个布尔属性调用app.set('foo'， false)和调用app.disable('foo')是一样的。例如

```js
app.disable('trust proxy')
app.get('trust proxy')
// => false
```

### app.disabled(name)

如果禁用布尔设置名(false)，则返回true，其中name是app settings表中的一个属性。

```js
app.disabled('trust proxy')
// => true

app.enable('trust proxy')
app.disabled('trust proxy')
// => false
```

### app.enable(name)

将布尔设置名设置为true，其中name是app settings表中的一个属性。为一个布尔属性调用app.set('foo'， true)和调用app.enable('foo')是一样的。

```js
app.enable('trust proxy')
app.get('trust proxy')
// => true
```

### app.enabled(name)

如果设置名已启用(true)，则返回true，其中name是app settings表中的一个属性。

```js
app.enabled('trust proxy')
// => false

app.enable('trust proxy')
app.enabled('trust proxy')
// => true
```

### app.engine(ext, callback)

将给定的模板引擎回调注册为ext.在默认情况下，Express将需要()基于文件扩展名的引擎。

例如，如果您试图呈现一个foo。在随后的调用中缓存require()以提高性能

```js
app.engine('pug', require('pug').__express)
```

对于不提供. express开箱即用的引擎，或者您希望将不同的扩展“映射”到模板引擎，请使用此方法。

例如，将EJS模板引擎映射到“”。html文件:

```js
app.engine('html', require('ejs').renderFile)
```

### app.get(name)

get(name)返回name应用程序设置的值，其中name是app settings表中的一个字符串。例如

```js
app.get('title')
// => undefined

app.set('title', 'My Site')
app.get('title')
// => "My Site"
```

### app.get(path, callback [, callback ...])

使用指定的回调函数将HTTP GET请求路由到指定的路径。

```js
app.get('/', function (req, res) {
  res.send('GET request to homepage')
})
```

### app.listen(path, [callback])

启动UNIX套接字并侦听给定路径上的连接。此方法与节点s http.Server.listen()相同。

```js
var express = require('express')
var app = express()
app.listen(3000)
```

实际上，express（）返回的应用程序是JavaScript函数，旨在将其作为处理请求的回调传递给Node的HTTP服务器。 这使为应用程序的HTTP和HTTPS版本提供相同的代码库变得容易，因为该应用程序不继承自这些代码（它只是一个回调）：

```js
var express = require('express')
var https = require('https')
var http = require('http')
var app = express()

http.createServer(app).listen(80)
https.createServer(options, app).listen(443)
```

listen()方法返回一个http。Server对象和(对于HTTP)是以下内容的方便方法

```js
app.listen = function () {
  var server = http.createServer(this)
  return server.listen.apply(server, arguments)
}
```

### app.METHOD(path, callback [, callback ...])

路由HTTP请求，其中方法是请求的HTTP方法，如GET、PUT、POST等，小写。因此，实际的方法是app.get()、app.post()、app.put()等。有关完整列表，请参阅下面的路由方法。

### app.param([name], callback)

将回调触发器添加到路由参数，其中name是参数的名称或它们的数组，callback是回调函数。 回调函数的参数依次为请求对象，响应对象，下一个中间件，参数值和参数名称。

如果name是一个数组，则为其声明的每个参数按声明顺序注册回调触发器。 此外，对于除最后一个参数以外的每个已声明参数，在回调内部调用next将调用下一个已声明参数的回调。 对于最后一个参数，对next的调用将在当前正在处理的路由的位置调用下一个中间件，就像name只是一个字符串一样。

例如，当:user出现在路由路径中时，您可以映射用户加载逻辑以自动提供req。或对参数输入执行验证。

```js
app.param('user', function (req, res, next, id) {
  // 尝试从用户模型获取用户详细信息并将其附加到请求对象
  User.find(id, function (err, user) {
    if (err) {
      next(err)
    } else if (user) {
      req.user = user
      next()
    } else {
      next(new Error('failed to load user'))
    }
  })
})
```

Param回调函数是定义它们的路由器的本地函数。它们不会被安装的应用程序或路由器继承。因此，在应用程序上定义的参数回调将仅由在应用程序路由上定义的路由参数触发。

所有param回调将在param所在的任何路由的任何处理程序之前调用，并且在请求-响应周期中，即使参数在多个路由中匹配，也只调用一次，如下面的示例所示。

```js
app.param('id', function (req, res, next, id) {
  console.log('CALLED ONLY ONCE')
  next()
})

app.get('/user/:id', function (req, res, next) {
  console.log('although this matches')
  next()
})

app.get('/user/:id', function (req, res) {
  console.log('and this matches too')
  res.end()
})

// CALLED ONLY ONCE
// although this matches
// and this matches too
```

```js
app.param(['id', 'page'], function (req, res, next, value) {
  console.log('CALLED ONLY ONCE with', value)
  next()
})

app.get('/user/:id/:page', function (req, res, next) {
  console.log('although this matches')
  next()
})

app.get('/user/:id/:page', function (req, res) {
  console.log('and this matches too')
  res.end()
})

// CALLED ONLY ONCE with 42
// CALLED ONLY ONCE with 3
// although this matches
// and this matches too
```

通过只向app.param()传递一个函数，可以完全改变app.param(名称，回调)方法的行为。这个函数是app.param(名称，回调)行为的自定义实现——它接受两个参数，必须返回一个中间件。

该函数的第一个参数是应该捕获的URL参数的名称，第二个参数可以是用于返回中间件实现的任何JavaScript对象。

函数返回的中间件决定捕获URL参数时的行为。

在本例中，app.param(name, callback)签名被修改为app.param(name, accessId)。与接受名称和回调不同，app.param()现在将接受名称和数字。

```js
var express = require('express')
var app = express()

// customizing the behavior of app.param()
app.param(function (param, option) {
  return function (req, res, next, val) {
    if (val === option) {
      next()
    } else {
      next('route')
    }
  }
})

// using the customized app.param()
app.param('id', 1337)

// route to trigger the capture
app.get('/user/:id', function (req, res) {
  res.send('OK')
})

app.listen(3000, function () {
  console.log('Ready')
})
```

在本例中，app.param(名称、回调)签名保持不变，但是定义了一个自定义数据类型检查函数来验证用户id的数据类型，而不是中间件回调。

```js
app.param(function (param, validator) {
  return function (req, res, next, val) {
    if (validator(val)) {
      next()
    } else {
      next('route')
    }
  }
})

app.param('id', function (candidate) {
  return !isNaN(parseFloat(candidate)) && isFinite(candidate)
})
```

### app.path()

返回应用程序的规范路径，一个字符串。

```js
var app = express()
var blog = express()
var blogAdmin = express()

app.use('/blog', blog)
blog.use('/admin', blogAdmin)

console.dir(app.path()) // ''
console.dir(blog.path()) // '/blog'
console.dir(blogAdmin.path()) // '/blog/admin'
```

### app.post(path, callback [, callback ...])

使用指定的回调函数将HTTP POST请求路由到指定的路径。有关更多信息，请参见路由指南。

```js
app.post('/', function (req, res) {
  res.send('POST request to homepage')
})
```

### app.put(path, callback [, callback ...])

### app.render(view, [locals], callback)

通过回调函数返回视图呈现的HTML。它接受一个可选参数，该参数是一个包含视图局部变量的对象。它类似于res.render()，只是它不能自己将呈现的视图发送给客户机。

```js
app.render('email', function (err, html) {
  // ...
})

app.render('email', { name: 'Tobi' }, function (err, html) {
  // ...
})
```

### app.route(path)

返回单个路由的实例，然后可以使用该实例使用可选的中间件处理HTTP谓词。使用app.route()来避免重复的路由名称(从而避免打印错误)。

```js
app.route('/events')
  .all(function (req, res, next) {
    // runs for all HTTP verbs first
    // think of it as route specific middleware!
  })
  .get(function (req, res, next) {
    res.json({})
  })
  .post(function (req, res, next) {
    // maybe add a new event...
  })
```

### app.set(name, value)

将设置名分配给值。您可以存储任何需要的值，但是可以使用某些名称来配置服务器的行为。这些特殊的名称列在app设置表中。

```js
app.set('title', 'My Site')
app.get('title') // "My Site"
```

### app.use([path,] callback [, callback...])

在指定路径上安装指定的中间件功能:当请求的路径的基础与路径匹配时，将执行中间件功能。