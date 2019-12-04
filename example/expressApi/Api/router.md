## Router

路由器对象是中间件和路由的隔离实例。 您可以将其视为“微型应用程序”，仅能够执行中间件和路由功能。 每个Express应用程序都有一个内置的应用路由器。

路由器的行为类似于中间件本身，因此您可以将其用作app.use（）的参数或用作另一台路由器的use（）方法的参数。

顶级express对象具有一个Router（）方法，该方法创建一个新的路由器对象。

创建路由器对象后，您可以像应用程序一样向其添加中间件和HTTP方法路由（例如get，put，post等）。 例如：

```js
// invoked for any requests passed to this router
router.use(function (req, res, next) {
  // .. some logic here .. like any other middleware
  next()
})

// will handle any request that ends in /events
// depends on where the router is "use()'d"
router.get('/events', function (req, res, next) {
  // ..
})
```

然后，您可以使用一个特定的根URL路由器，以这种方式将您的路由分隔到文件甚至迷你应用程序中。

```js
// only requests to /calendar/* will be sent to our "router"
app.use('/calendar', router)
```

## Methods

### router.all(path, [callback, ...] callback)

该方法类似于router.METHOD（）方法，但它与所有HTTP方法（动词）匹配。

该方法对于映射“全局”逻辑以获得特定的路径前缀或任意匹配项非常有用。 例如，如果将以下路由放在所有其他路由定义的顶部，则将要求从该点开始的所有路由都需要身份验证，并自动加载用户。 请记住，这些回调不必充当端点。 loadUser可以执行任务，然后调用next（）继续匹配后续路由。

```js
router.all('*', requireAuthentication, loadUser)
```

Or the equivalent:

```js
router.all('*', requireAuthentication)
router.all('*', loadUser)
```

另一个例子是列入白名单的“全局”功能。 这里的示例与以前非常相似，但是只限制了以“ / api”为前缀的路径：

```js
router.all('/api/*', requireAuthentication)
```

### router.METHOD(path, [callback, ...] callback)

router.METHOD（）方法提供Express中的路由功能，其中METHOD是HTTP方法之一，例如小写的GET，PUT，POST等。 因此，实际的方法是router.get（），router.post（），router.put（）等。

如果在router.get()之前的路径没有调用router.head()，那么除了GET方法之外，还会自动调用router.get()函数来调用HTTP头方法。

您可以提供多个回调，并且所有回调都被同等对待，并且其行为与中间件相同，只是这些回调可以调用next（'route'）绕过其余的路由回调。 您可以使用此机制在路由上执行前提条件，然后在没有理由继续进行匹配的路由时将控制权传递给后续路由。

以下代码段说明了最简单的路由定义。 Express将路径字符串转换为正则表达式，以在内部用于匹配传入的请求。 执行这些匹配时不考虑查询字符串，例如“ GET /”将匹配以下路由，“ GET /？name = tobi”也将匹配。

```js
router.get('/', function (req, res) {
  res.send('hello world')
})
```

您也可以使用正则表达式-如果您有非常特定的约束，则很有用，例如，以下内容将匹配“ GET / commits / 71dbb9c”和“ GET /commits/71dbb9c..4c084f9”。

```js
router.get(/^\/commits\/(\w+)(?:\.\.(\w+))?$/, function (req, res) {
  var from = req.params[0]
  var to = req.params[1] || 'HEAD'
  res.send('commit range ' + from + '..' + to)
})
```

### router.param(name, callback)

将回调触发器添加到路由参数，其中name是参数的名称，callback是回调函数。虽然名称在技术上是可选的，但是从Express v4.11.0开始不建议使用此方法(请参阅下面的内容)。

回调函数的参数为​​：

req，请求对象。

res，响应对象。

接下来，指示下一个中间件功能。

名称参数的值。

参数的名称。

例如，当：user存在于路径路径中时，您可以映射用户加载逻辑以自动将req.user提供给路径，或对参数输入执行验证。

```js
router.param('user', function (req, res, next, id) {
  // try to get the user details from the User model and attach it to the request object
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

参数回调函数对于定义它们的路由器是本地的。 它们不会被已安装的应用程序或路由器继承。 因此，路由器上定义的参数回调将仅由路由器路由上定义的路由参数触发。

即使参数在多个路由中匹配，在请求-响应周期中也仅会调用一次参数回调，如以下示例所示。

```js
router.param('id', function (req, res, next, id) {
  console.log('CALLED ONLY ONCE')
  next()
})

router.get('/user/:id', function (req, res, next) {
  console.log('although this matches')
  next()
})

router.get('/user/:id', function (req, res) {
  console.log('and this matches too')
  res.end()
})

// CALLED ONLY ONCE
// although this matches
// and this matches too
```

可以仅通过将一个函数传递给router.param（）来完全改变router.param（name，callback）方法的行为。 此函数是router.param（name，callback）的行为的自定义实现-接受两个参数，并且必须返回中间件。

该函数的第一个参数是应捕获的URL参数的名称，第二个参数可以是可用于返回中间件实现的任何JavaScript对象。

函数返回的中间件决定了捕获URL参数时所发生的行为。

在此示例中，将router.param（name，callback）签名修改为router.param（name，accessId）。 router.param（）现在将接受名称和数字，而不是接受名称和回调。

```js
var express = require('express')
var app = express()
var router = express.Router()

// customizing the behavior of router.param()
router.param(function (param, option) {
  return function (req, res, next, val) {
    if (val === option) {
      next()
    } else {
      res.sendStatus(403)
    }
  }
})

// using the customized router.param()
router.param('id', '1337')

// route to trigger the capture
router.get('/user/:id', function (req, res) {
  res.send('OK')
})

app.use(router)

app.listen(3000, function () {
  console.log('Ready')
})]
```

在这个例子中，路由器。param(名称、回调)签名保持不变，但是定义了一个自定义数据类型检查函数来验证用户id的数据类型，而不是中间件回调。

```js
router.param(function (param, validator) {
  return function (req, res, next, val) {
    if (validator(val)) {
      next()
    } else {
      res.sendStatus(403)
    }
  }
})

router.param('id', function (candidate) {
  return !isNaN(parseFloat(candidate)) && isFinite(candidate)
})
```

### router.route(path)

返回单个路由的实例，然后您可以使用该路由使用可选的中间件来处理HTTP动词。 使用router.route（）避免重复的路由命名，从而避免键入错误。

以下代码建立在上面的router.param（）示例的基础上，显示了如何使用router.route（）指定各种HTTP方法处理程序。

```js
var router = express.Router()

router.param('user_id', function (req, res, next, id) {
  // sample user, would actually fetch from DB, etc...
  req.user = {
    id: id,
    name: 'TJ'
  }
  next()
})

router.route('/users/:user_id')
  .all(function (req, res, next) {
    // runs for all HTTP verbs first
    // think of it as route specific middleware!
    next()
  })
  .get(function (req, res, next) {
    res.json(req.user)
  })
  .put(function (req, res, next) {
    // just an example of maybe updating the user
    req.user.name = req.params.name
    // save user ... etc
    res.json(req.user)
  })
  .post(function (req, res, next) {
    next(new Error('not implemented'))
  })
  .delete(function (req, res, next) {
    next(new Error('not implemented'))
  })
  ```

  此方法重用单个/users/:user_id路径，并为各种HTTP方法添加处理程序。

  注意:当您使用router.route()时，中间件的排序基于何时创建路由，而不是何时将方法处理程序添加到路由。为此，您可以认为方法处理程序属于添加它们的路由。

### router.use([path], [function, ...] function)

使用指定的中间件函数或函数，可选的安装路径路径，默认为“/”。

这个方法类似于app.use()。下面描述了一个简单的示例和用例。有关更多信息，请参见app.use()。

中间件就像一个管道:请求从定义的第一个中间件函数开始，然后在它们匹配的每个路径上“向下”处理中间件堆栈。

```js
var express = require('express')
var app = express()
var router = express.Router()

// simple logger for this router's requests
// all requests to this router will first hit this middleware
router.use(function (req, res, next) {
  console.log('%s %s %s', req.method, req.url, req.path)
  next()
})

// this will only be invoked if the path starts with /bar from the mount point
router.use('/bar', function (req, res, next) {
  // ... maybe some additional /bar logging ...
  next()
})

// always invoked  总是调用
router.use(function (req, res, next) {
  res.send('Hello World')
})

app.use('/foo', router)

app.listen(3000)
```
“安装”路径已剥离，并且对中间件功能不可见。 此功能的主要作用是，无论其“前缀”路径名如何，安装的中间件功能都可以在不更改代码的情况下运行。

使用router.use（）定义中间件的顺序非常重要。 它们被顺序调用，因此顺序定义了中间件优先级。 例如，通常记录器是您要使用的第一个中间件，因此每个请求都会被记录。

```js
var logger = require('morgan')
var path = require('path')

router.use(logger())
router.use(express.static(path.join(__dirname, 'public')))
router.use(function (req, res) {
  res.send('Hello')
})
```

现在假设您要忽略对静态文件的日志记录请求，但是继续记录在logger（）之后定义的路由和中间件。 在添加记录器中间件之前，您只需将对express.static（）的调用移到顶部即可：

```js
router.use(express.static(path.join(__dirname, 'public')))
router.use(logger())
router.use(function (req, res) {
  res.send('Hello')
})
```

另一个例子是为多个目录中的文件提供服务，将优先级赋给“。/public“在其他方面:

```js
router.use(express.static(path.join(__dirname, 'public')))
router.use(express.static(path.join(__dirname, 'files')))
router.use(express.static(path.join(__dirname, 'uploads')))
```

router.use（）方法还支持命名参数，以便其他路由器的安装点可以受益于使用命名参数的预加载。

注意：尽管这些中间件功能是通过特定的路由器添加的，但是它们的运行时间是由它们附加到的路径（不是路由器）定义的。 因此，如果一个路由器添加的中间件的路由匹配，则可以为其他路由器运行。 例如，此代码显示了安装在同一路径上的两个不同的路由器：

```js
var authRouter = express.Router()
var openRouter = express.Router()

authRouter.use(require('./authenticate').basic(usersdb))

authRouter.get('/:user_id/edit', function (req, res, next) {
  // ... Edit user UI
})
openRouter.get('/', function (req, res, next) {
  // ... List users
})
openRouter.get('/:user_id', function (req, res, next) {
  // ... View user
})

app.use('/users', authRouter)
app.use('/users', openRouter)
```

即使身份验证中间件是通过authRouter添加的，它也会在openRouter定义的路由上运行，因为这两个路由器都安装在/users上。为了避免这种行为，每个路由器使用不同的路径。




