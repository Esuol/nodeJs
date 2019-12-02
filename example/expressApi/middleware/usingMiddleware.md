## Using middleware

Express是一个本身功能最少的路由和中间件web框架:Express应用程序本质上是一系列中间件功能调用。

中间件函数是能够访问请求对象(req)、响应对象(res)和应用程序请求-响应周期中的下一个中间件函数的函数。下一个中间件函数通常由一个名为next的变量表示。

### 中间件功能可以执行以下任务：

执行任何代码。

更改请求和响应对象。

结束请求-响应周期。

调用堆栈中的下一个中间件函数。

### notice

如果当前中间件函数没有结束请求-响应周期，则必须调用next()将控制权传递给下一个中间件函数。否则，请求将被挂起。

### Express应用程序可以使用以下类型的中间件：

#### 应用层中间件 Application-level middleware

通过使用app.use()和app.METHOD()函数将应用程序级中间件绑定到app对象的一个实例，其中方法是中间件函数处理的请求的HTTP方法(例如GET、PUT或POST)的小写形式。

这个例子显示了一个没有挂载路径的中间件函数。该函数在应用程序每次接收到请求时执行。

```js
var app = express()

app.use(function (req, res, next) {
  console.log('Time:', Date.now())
  next()
})

```
此示例显示了安装在/ user /：id路径上的中间件功能。 该函数在/ user /：id路径上针对任何类型的HTTP请求执行。

```js
app.use('/user/:id', function (req, res, next) {
  console.log('Request Type:', req.method)
  next()
})
```

此示例显示了路由及其处理程序功能（中间件系统）。 该函数处理对/ user /：id路径的GET请求。

```js
app.get('/user/:id', function (req, res, next) {
  res.send('USER')
})
```

这是在具有安装路径的安装点加载一系列中间件功能的示例。 它说明了一个中间件子栈，该子栈将任何类型的HTTP请求的请求信息打印到/ user /：id路径。

```js
app.use('/user/:id', function (req, res, next) {
  console.log('Request URL:', req.originalUrl)
  next()
}, function (req, res, next) {
  console.log('Request Type:', req.method)
  next()
})
```

路由处理程序允许您为一个路径定义多个路由。下面的示例定义了到/user/:id路径的GET请求的两条路由。第二个路由不会引起任何问题，但是它永远不会被调用，因为第一个路由结束了请求-响应周期。

```js
app.get('/user/:id', function (req, res, next) {
  console.log('ID:', req.params.id)
  next()
}, function (req, res, next) {
  res.send('User Info')
})

// handler for the /user/:id path, which prints the user ID
app.get('/user/:id', function (req, res, next) {
  res.end(req.params.id)
})
```

要跳过来自路由器中间件堆栈的其余中间件功能，请调用next('route')将控制权传递给下一个路由。注意:next('route')只适用于通过使用app.METHOD()或router.METHOD()函数加载的中间件函数。
这个示例显示了一个中间件子堆栈，它处理到/user/:id路径的GET请求。

```js
app.get('/user/:id', function (req, res, next) {
  // if the user ID is 0, skip to the next route
  if (req.params.id === '0') next('route')
  // otherwise pass the control to the next middleware function in this stack
  else next()
}, function (req, res, next) {
  // send a regular response
  res.send('regular')
})

// handler for the /user/:id path, which sends a special response
app.get('/user/:id', function (req, res, next) {
  res.send('special')
})
```

为了可重用性，还可以在数组中声明中间件。

此示例显示了一个带有中间件子堆栈的数组，该子堆栈处理对/ user /：id路径的GET请求

```js
function logOriginalUrl (req, res, next) {
  console.log('Request URL:', req.originalUrl)
  next()
}

function logMethod (req, res, next) {
  console.log('Request Type:', req.method)
  next()
}

var logStuff = [logOriginalUrl, logMethod]
app.get('/user/:id', logStuff, function (req, res, next) {
  res.send('User Info')
})
```

#### 路由器级中间件 Router-level middleware

路由器级中间件的工作方式与应用程序级中间件相同，只是它绑定到express.Router()的一个实例。

```js
var router = express.Router()
```

使用router.use（）和router.METHOD（）函数加载路由器级中间件。

以下示例代码通过使用路由器级中间件来复制上面显示的用于应用程序级中间件的中间件系统：

```js
var app = express()
var router = express.Router()

// 没有挂载路径的中间件功能。这段代码对每一个到路由器的请求执行
router.use(function (req, res, next) {
  console.log('Time:', Date.now())
  next()
})

// 中间件子堆栈显示对/ user /：id路径的任何类型的HTTP请求的请求信息
router.use('/user/:id', function (req, res, next) {
  console.log('Request URL:', req.originalUrl)
  next()
}, function (req, res, next) {
  console.log('Request Type:', req.method)
  next()
})

// 一个处理到/ user /：id路径的GET请求的中间件子堆栈
router.get('/user/:id', function (req, res, next) {
  // if the user ID is 0, skip to the next router
  if (req.params.id === '0') next('route')
  // otherwise pass control to the next middleware function in this stack
  else next()
}, function (req, res, next) {
  // render a regular page
  res.render('regular')
})

// 一个处理到/ user /：id路径的GET请求的中间件子堆栈
router.get('/user/:id', function (req, res, next) {
  console.log(req.params.id)
  res.render('special')
})
/// 将路由器安装到应用程序上
app.use('/', router)
```

要跳过路由器的其余中间件功能，请调用next(“router”)将控制权从路由器实例中传递回来。

这个示例显示了一个中间件子堆栈，它处理到/user/:id路径的GET请求。

```js
var app = express()
var router = express.Router()

// 使用检查对路由器进行断言，并在需要时退出
router.use(function (req, res, next) {
  if (!req.headers['x-auth']) return next('router')
  next()
})

router.get('/', function (req, res) {
  res.send('hello, user!')
})

//使用路由器和401任何掉进去的东西
app.use('/admin', router, function (req, res) {
  res.sendStatus(401)
})
```

#### 错误处理中间件 Error-handling middleware

> **WARNING**: 错误处理中间件始终采用四个参数。 您必须提供四个参数以将其标识为错误处理中间件函数。 即使您不需要使用下一个对象，也必须指定它来维护签名。 否则，下一个对象将被解释为常规中间件，并且将无法处理错误。

以与其他中间件功能相同的方式定义错误处理中间件功能，除了使用四个参数而不是三个，特别是使用签名(err、req、res、next))

```js
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
```

发生在路由处理程序和中间件中的同步代码中的错误不需要额外的工作。如果同步代码抛出错误，那么Express将捕获并处理它。例如

```js
app.get('/', function (req, res) {
  throw new Error('BROKEN') // Express will catch this on its own.
})
```

对于由路由处理程序和中间件调用的异步函数返回的错误，必须将它们传递给next()函数，Express将在该函数中捕获并处理它们。例如

```js
app.get('/', function (req, res, next) {
  fs.readFile('/file-does-not-exist', function (err, data) {
    if (err) {
      next(err) // Pass errors to Express.
    } else {
      res.send(data)
    }
  })
})
```

如果将任何内容传递给next()函数(字符串“route”除外)，Express将把当前请求视为一个错误，并将跳过其余的非错误处理路由和中间件函数。

如果序列中的回调不提供数据，只提供错误，则可以按以下方式简化此代码

```js
app.get('/', [
  function (req, res, next) {
    fs.writeFile('/inaccessible-path', 'data', next)
  },
  function (req, res) {
    res.send('OK')
  }
])
```

在上面的示例中，next作为fs的回调提供。writeFile，它被调用时带有或不带有错误。如果没有错误，则执行第二个处理程序，否则将捕获并处理错误。

您必须捕获由路由处理程序或中间件调用的异步代码中发生的错误，并将它们传递给Express进行处理。例如

```js
app.get('/', function (req, res, next) {
  setTimeout(function () {
    try {
      throw new Error('BROKEN')
    } catch (err) {
      next(err)
    }
  }, 100)
})
```

上面的例子使用了一个try…catch块捕获异步代码中的错误并将其传递给Express。如果尝试……catch块被省略，Express将不会捕获错误，因为它不是同步处理程序代码的一部分。

使用承诺来避免尝试的开销。catch块或使用返回Promise的函数时。例如

```js
app.get('/', function (req, res, next) {
  Promise.resolve().then(function () {
    throw new Error('BROKEN')
  }).catch(next) // Errors will be passed to Express.
})
```

因为会自动捕获同步错误和拒绝的promise，所以您可以简单地将next作为最终的catch处理程序，Express将捕获错误，因为catch处理程序的第一个参数是错误。

您还可以使用处理程序链来依赖于同步错误捕获，方法是将异步代码简化为一些无关紧要的内容。例如

```js
app.get('/', [
  function (req, res, next) {
    fs.readFile('/maybe-valid-file', 'utf-8', function (err, data) {
      res.locals.data = data
      next(err)
    })
  },
  function (req, res) {
    res.locals.data = res.locals.data.split(',')[1]
    res.send(res.locals.data)
  }
])
```

##### The default error handler
Express自带一个内置的错误处理程序，可以处理应用程序中可能遇到的任何错误。这个默认的错误处理中间件功能添加在中间件功能堆栈的末尾。

如果您将错误传递给next()，并且没有在自定义错误处理程序中处理它，那么它将由内置的错误处理程序处理;错误将通过堆栈跟踪写入客户端。生产环境中不包括堆栈跟踪。

>**SUCCESS**: 将环境变量NODE ENV设置为production，以生产模式运行app。

如果在开始编写响应之后使用错误调用next()(例如，如果在将响应传递给客户机时遇到错误)，Express默认错误处理程序将关闭连接并使请求失败。

因此，当您添加自定义错误处理程序时，您必须将其委派给默认的Express错误处理程序，而此时标头已经发送到客户端

```js
function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
}
```

注意，如果在代码中不止一次调用带有错误的next()，就会触发默认的错误处理程序，即使定制的错误处理中间件已经就位。

##### Writing error handlers

以与其他中间件函数相同的方式定义错误处理中间件函数，但是错误处理函数有四个参数，而不是三个参数:(err、req、res、next)。例如

```js
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
```

在其他app.use()和路由调用之后，最后定义错误处理中间件;例如

```js
var bodyParser = require('body-parser')
var methodOverride = require('method-override')

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(methodOverride())
app.use(function (err, req, res, next) {
    // logic
})
```

来自中间件函数的响应可以是任何格式，比如HTML错误页面、简单消息或JSON字符串。

出于组织(和更高级的框架)目的，您可以定义几个错误处理中间件功能，就像您定义常规中间件功能一样。例如，为使用和不使用XHR的请求定义错误处理程序

```js
var bodyParser = require('body-parser')
var methodOverride = require('method-override')

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(methodOverride())
app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)
```

例如，在这个例子中，一般的错误分析可能会将请求和错误信息写入stderr

```js
function logErrors (err, req, res, next) {
  console.error(err.stack)
  next(err)
}
```

在本例中，clientErrorHandler的定义如下;

在本例中，错误被显式地传递给下一个。注意，当不调用错误处理函数中的next时，您要负责编写(和结束)响应。否则，这些请求将挂起，不适合进行垃圾收集。

```js
function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}
```

按照以下方式实现全部捕获的errorHandler函数(例如)

```js
function errorHandler (err, req, res, next) {
  res.status(500)
  res.render('error', { error: err })
}
```

如果您有一个具有多个回调函数的路由处理程序，则可以使用route参数跳到下一个路由处理程序。例如

```js
app.get('/a_route_behind_paywall',
  function checkIfPaidSubscriber (req, res, next) {
    if (!req.user.hasPaid) {
      // continue handling this request
      next('route')
    } else {
      next()
    }
  }, function getPaidContent (req, res, next) {
    PaidContent.find(function (err, doc) {
      if (err) return next(err)
      res.json(doc)
    })
  })
```

在此示例中，将跳过getPaidContent处理程序，但应用程序中/ a_route_behind_paywall的所有其余处理程序将继续执行。

< **SUCCESS**: 调用next（）和next（err）表示当前处理程序已完成并且处于什么状态。 next（err）将跳过该链中所有剩余的处理程序，除了如上所述设置为处理错误的那些处理程序。


#### 内置中间件

从版本4开始。x, Express不再依赖Connect。以前包含在Express中的中间件功能现在位于单独的模块中;参见中间件功能列表。

##### Express具有以下内置的中间件功能：

express.static提供静态资源，例如HTML文件，图像等。

express.json使用JSON负载解析传入的请求。 注意：Express 4.16.0+中可用

express.urlencoded使用URL编码的有效内容解析传入的请求。 注意：Express 4.16.0+中可用

#### 第三方中间件

使用第三方中间件添加功能来表达应用程序。

为所需的功能安装Node.js模块，然后在应用程序级或路由器级加载它。

下面的示例演示了如何安装和加载cookie解析中间件函数cookie解析器。

```sh
$ npm install cookie-parser
```

```js
var express = require('express')
var app = express()
var cookieParser = require('cookie-parser')

// load the cookie-parsing middleware
app.use(cookieParser())
```