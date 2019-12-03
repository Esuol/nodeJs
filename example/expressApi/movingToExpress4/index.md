## Moving to Express 4

### Overview

Express4比Express3快得多。这意味着现有的Express 3应用程序将无法工作，如果你更新了Express版本的依赖关系。

#### 本文介绍：

Express 4中的更改。

将Express 3应用迁移到Express 4的示例。

升级到Express 4应用程序生成器。

#### Express 4中的更改

##### Express 4有几项重大更改：

Express核心和中间件系统的更改。 删除了对Connect和内置中间件的依赖，因此您必须自己添加中间件。

更改路由系统。

其他各种变化。

##### 也可以看看

4.x中的新功能。

从3.x迁移到4.x。

#### Express核心和中间件系统的更改

Express 4不再依赖于Connect，并从其核心中删除了除Express之外的所有内置中间件。静态函数。这意味着Express现在是一个独立的路由和中间件web框架，Express版本控制和发布不受中间件更新的影响。

##### 如果没有内置的中间件，您必须显式地添加运行应用程序所需的所有中间件

安装模块：npm install --save <模块名称>

在您的应用中，需要模块：require（'module-name'）

根据其文档使用模块：app.use（...）

#### 下表列出了Express 3中间件及其在Express 4中的副本。
----------------------------------------------------
Express 3	            |   Express 4

express.bodyParser	  |   body-parser + multer

express.compress	    |   compression

express.cookieSession	|   cookie-session

express.cookieParser	|   cookie-parser

express.logger	      |   morgan

express.session	      |   express-session

express.favicon	      |   serve-favicon

express.responseTime	|   response-time

express.errorHandler	|   errorhandler

express.methodOverride|	  method-override

express.timeout	      |   connect-timeout

express.vhost	        |   vhost

express.csrf	        |   csurf

express.directory	    |   serve-index

express.static	      |   serve-static

------------------------------------------------------

#### app.use accepts parameters

在版本4中，您可以使用一个变量参数来定义加载中间件函数的路径，然后从route处理程序中读取参数的值。例如

```js
app.use('/book/:id', function (req, res, next) {
  console.log('ID:', req.params.id)
  next()
})
```

### The routing system

应用程序现在隐式地加载路由中间件，因此您不再需要担心中间件与路由器中间件的加载顺序。

定义路由的方式没有改变，但是路由系统有两个新特性来帮助组织路由:

一个新方法app.route()，用于为路由路径创建可链接的路由处理程序。

一个新类，express。路由器，以创建模块化的可挂载路由处理程序。

#### app.route() method

新的app.route()方法允许您为路由路径创建可链接的路由处理程序。因为路径是在单一位置指定的，所以创建模块化路由很有帮助，因为这样可以减少冗余和打印错误。有关路由的更多信息，请参见Router()文档。

下面是使用app.route()函数定义的链式路由处理程序的一个示例。

```js
app.route('/book')
  .get(function (req, res) {
    res.send('Get a random book')
  })
  .post(function (req, res) {
    res.send('Add a book')
  })
  .put(function (req, res) {
    res.send('Update the book')
  })
```

#### express.Router class

另一个有助于组织路由的特性是一个新类express。路由器，您可以使用它来创建模块化的可挂载路由处理程序。路由器实例是一个完整的中间件和路由系统;因此，它通常被称为迷你应用程序。

以下示例将路由器创建为模块，在其中加载中间件，定义一些路由，并将其安装在主应用程序的路径上。

例如，在app目录中创建一个名为birds.js的路由器文件，其内容如下

```js
var express = require('express')
var router = express.Router()

// middleware specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.get('/', function (req, res) {
  res.send('Birds home page')
})
// define the about route
router.get('/about', function (req, res) {
  res.send('About birds')
})

module.exports = router
```

然后，在应用程序中加载路由器模块

```js
var birds = require('./birds')

// ...

app.use('/birds', birds)
```

该应用程序现在将能够处理对/ birds和/ birds / about路径的请求，并将调用特定于该路线的timeLog中间件。

### process

通过安装Express 4应用程序所需的中间件，并使用以下命令将Express和Pug更新到各自的最新版本，开始迁移过程

```sh
$ npm install serve-favicon morgan method-override express-session body-parser multer errorhandler express@latest pug@latest --save
```

对app.js进行以下更改:

内置的Express中间件功能express.favicon，express.logger，express.methodOverride，express.session，express.bodyParser和express.errorHandler在Express对象上不再可用。 您必须手动安装其替代方案并将其加载到应用程序中。

您不再需要加载app.router函数。 它不是有效的Express 4应用程序对象，因此请删除app.use（app.router）。

确保以正确的顺序加载中间件功能-在加载应用程序路由后加载errorHandler。

### Version 4 app

#### package.json

```json
{
  "name": "application-name",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "body-parser": "^1.5.2",
    "errorhandler": "^1.1.1",
    "express": "^4.8.0",
    "express-session": "^1.7.2",
    "pug": "^2.0.0",
    "method-override": "^2.1.2",
    "morgan": "^1.2.2",
    "multer": "^0.1.3",
    "serve-favicon": "^2.0.1"
  }
}
```

#### app.js

然后，删除无效代码，加载所需的中间件，并根据需要进行其他更改。js文件看起来是这样的

```js
var http = require('http')
var express = require('express')
var routes = require('./routes')
var user = require('./routes/user')
var path = require('path')

var favicon = require('serve-favicon')
var logger = require('morgan')
var methodOverride = require('method-override')
var session = require('express-session')
var bodyParser = require('body-parser')
var multer = require('multer')
var errorHandler = require('errorhandler')

var app = express()

// all environments
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(favicon(path.join(__dirname, '/public/favicon.ico')))
app.use(logger('dev'))
app.use(methodOverride())
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'uwotm8'
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(multer())
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', routes.index)
app.get('/users', user.list)

// error handling middleware should be loaded after the loading the routes
if (app.get('env') === 'development') {
  app.use(errorHandler())
}

var server = http.createServer(app)
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})
```

> **SUCCESS** 除非你需要直接使用http模块(socket.io/SPDY/HTTPS)，否则不需要加载它，应用程序可以这样简单地启动:

```js
app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})
```

### Run the app

迁移过程已经完成，应用程序现在是Express 4应用程序。要确认，请使用以下命令启动应用程序

```sh
node .
```

#### 升级到Express 4应用程序生成器

生成Express应用程序的命令行工具仍然是Express，但是要升级到新版本，必须卸载Express 3应用程序生成器，然后安装新的Express -generator。

#### installing

如果你的系统上已经安装了Express 3应用程序生成器，你必须卸载它

```sh
$ npm uninstall -g express
```

根据文件和目录特权的配置方式，可能需要使用sudo运行此命令。现在安装新生成器

```sh
npm install -g express-generator
```

根据文件和目录特权的配置方式，可能需要使用sudo运行此命令。现在，系统上的express命令被更新到express 4生成器。

#### 对app生成器的更改

命令选项和用法在很大程度上保持不变，但以下情况除外：

删除了--sessions选项。

删除了--jshtml选项。

添加了--hogan选项以支持Hogan.js。

##### example

执行以下命令创建Express 4应用程序

```sh
express app4
```

如果查看app4 / app.js文件的内容，则会注意到该应用程序所需的所有中间件功能（express.static除外）均作为独立模块加载，并且路由器中间件不再显式加载。 在应用程序中。

您还会注意到，app.js文件现在是一个Node.js模块，而不是由旧的生成器生成的独立应用程序。

安装依赖项后，使用以下命令启动应用程序

```sh
npm start
```

如果查看package.json文件中的npm start脚本，您会注意到启动应用程序的实际命令是node ./bin/www，在Express 3中曾经是nodeapp.js。

由于Express 4生成器生成的app.js文件现在是Node.js模块，因此无法再作为应用程序独立启动（除非您修改代码）。 该模块必须加载到Node.js文件中，并通过Node.js文件启动。 在这种情况下，Node.js文件为./bin/www。

创建Express应用程序或启动该应用程序时，bin目录和无扩展名的www文件都不是必需的。 它们只是生成器提出的建议，因此可以随时对其进行修改以满足您的需求。

为了摆脱www目录并保持“Express 3 way”，删除“module”这一行。出口=应用;在app.js文件的末尾，粘贴以下代码:

```js
app.set('port', process.env.PORT || 3000)

var server = app.listen(app.get('port'), function () {
  debug('Express server listening on port ' + server.address().port)
})
```

确保使用以下代码在app.js文件的顶部加载调试模块

```js
var debug = require('debug')('app4')
```

接下来，将package.json文件中的“ start”：“ node ./bin/www”更改为“ start”：“ node app.js”。

现在，您已经将./bin/www的功能移回了app.js。 不建议进行此更改，但本练习可帮助您了解./bin/www文件的工作方式以及为何app.js文件不再自行启动。




