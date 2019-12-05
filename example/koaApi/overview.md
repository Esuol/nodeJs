## Koa

### introduction

Koa是Express团队设计的一个新的web框架，它的目标是为web应用程序和api提供一个更小、更富表现力、更健壮的基础。通过利用异步函数，Koa允许您放弃回调并大大增加错误处理。Koa在其核心中不捆绑任何中间件，并且它提供了一套优雅的方法，使编写服务器变得快速和令人愉快。

### installation

Koa要求节点v7.6.0或更高版本才能支持ES2015和异步功能。

您可以使用喜欢的版本管理器快速安装受支持的节点版本：

```sh
$ nvm install 7
$ npm i koa
$ node my-koa-app.js
```
### aapplication

Koa应用程序是一个对象，其中包含一系列中间件功能，这些中间件功能可应要求以类似栈的方式组成和执行。 Koa与您可能遇到的许多其他中间件系统类似，例如Ruby的Rack，Connect等-但是做出了一项关键设计决策，决定在其他较低层的中间件层提供高层“糖”。 这提高了互操作性，鲁棒性，并使编写中间件更加有趣。

这包括用于常见任务的方法，例如内容协商，缓存新鲜度，代理支持以及重定向。 尽管提供了大量有用的方法，但由于没有捆绑中间件，所以Koa占用的资源很少。

强制性的hello world应用程序：

```js
const Koa = require('koa', 2.11.0)
const app = new Koa()

app.use(async ctx => {
  ctx.body = 'hello world'
})

app.listen(3000)
```

### cascading

Koa中间件以一种您可能已经习惯使用类似工具的更传统的方式进行级联-以前这很难使用户易于使用节点的回调。 但是，使用异步功能，我们可以实现“真正的”中间件。 与Connect的实现相反，该实现仅通过一系列功能传递控制权直到一个返回，Koa调用“下游”，然后控制流向“上游”。

以下示例以“ Hello World”响应，但是首先请求流经x响应时间并记录中间件以标记请求何时开始，然后继续通过响应中间件产生控制权。 当中间件调用next（）时，函数将挂起并将控制权传递给所定义的下一个中间件。 在没有更多的中间件要在下游执行时，堆栈将解散，并且每个中间件都将恢复执行其上游行为。

```js
const Koa = require('koa')
const app = new Koa()

// logger

app.use(async (ctx, next) => {
  await next()
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
})

// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// response

app.use(async ctx => {
  ctx.body = 'hello world'
})

app.listen(3000)
```

### settings

应用程序设置是应用程序实例上的属性，目前支持以下设置

app.env默认设置为NODE_ENV或“development”

当真正的代理报头字段将被信任时

subdomainoffset .subdomains忽略[2]的偏移量

#### app.listen(...)

Koa应用程序不是HTTP服务器的一对一表示。 可以将一个或多个Koa应用程序安装在一起，以使用单个HTTP服务器形成更大的应用程序。

创建并返回一个HTTP服务器，将给定的参数传递给Server＃listen（）。 这些参数记录在nodejs.org上。 以下是绑定到端口3000的无用的Koa应用程序：

```js
const koa = require('koa')
const app = new koa()
app.listen(3000)
```
这个app.listen(…)方法只是为下面的内容添加了一些修饰

```js
const http = require('http')
const koa = require('koa')
const app = new koa()
http.createServer(app.callback()).listen(3000)
```

这意味着您可以启动与HTTP和HTTPS相同的应用程序，也可以在多个地址上启动：

```js
const http = require('http');
const https = require('https');
const Koa = require('koa');
const app = new Koa();
http.createServer(app.callback()).listen(3000);
https.createServer(app.callback()).listen(3001);
```

#### app.callback()

返回适合于http.createServer（）方法的回调函数来处理请求。 您也可以使用此回调函数将Koa应用程序安装在Connect / Express应用程序中。

#### app.use(function)

将给定的中间件功能添加到此应用程序

#### app.keys=

Set signed cookie keys.

这些被传递给KeyGrip，但是你也可以传递你自己的KeyGrip实例。例如，以下内容是可以接受的

```js
app.keys = ['im a newer secret', 'i like turtle'];
app.keys = new KeyGrip(['im a newer secret', 'i like turtle'], 'sha256');
```

这些键可以旋转，并在使用{signed: true}选项签署cookie时使用

```js
ctx.cookies.set('name', 'tobi', { signed: true })
```

#### app.context

app.context是从中创建ctx的原型。 您可以通过编辑app.context向ctx添加其他属性。 这对于在ctx中添加要在整个应用程序中使用的属性或方法很有用，这可能会更高效（不需要中间件）和/或更容易（需要更少的require（）），但会更多地依赖于ctx，这可能是 被认为是反模式。

例如，从ctx向数据库添加引用

```js
app.context.db  =  db()
app.use(async ctx => {
  console.log(ctx.db)
})
```
ctx上的许多属性都是使用getter、setter和Object.defineProperty()来定义的。您只能通过在app.context上使用Object.defineProperty()来编辑这些属性(不推荐)。见https://github.com/koajs/koa/issues/652。

安装的应用程序目前使用父类的ctx和设置。因此，挂载的应用程序实际上只是中间件组。

#### Error Handling

默认情况下，将所有错误输出到stderr，除非app.silent为真。默认的错误处理程序在出错时也不会输出错误。状态是404或err。公开是正确的。要执行自定义错误处理逻辑(如集中式日志记录)，可以添加一个“错误”事件监听器

```js
app.on('error', err => {
  log.error('server error', err)
})
```

如果错误发生在req/res循环中，无法响应客户端，也会传递上下文实例:

```js
app.on('error', (err, ctx) => {
  log.error('server error', err, ctx)
});
```

当发生错误并且仍然有可能响应客户端（即没有数据写入套接字）时，Koa会以500“内部服务器错误”进行适当响应。 在任何一种情况下，都会出于记录目的发出应用程序级别的“错误”。

### context

Koa上下文将节点的请求和响应对象封装到一个对象中，该对象为编写web应用程序和api提供了许多有用的方法。这些操作在HTTP服务器开发中使用得如此频繁，以至于它们被添加到这个级别，而不是一个更高级别的框架，这将迫使中间件重新实现这个公共功能。

每个请求都创建一个上下文，并在中间件中作为接收者或ctx标识符进行引用，如下面的代码片段所示

```js
app.use(async ctx => {
  ctx; // is the Context
  ctx.request; // is a koa request
  ctx.response; // is a koa response
})
```

许多上下文的访问器和方法只是委托给它们的ctx。请求或ctx。响应等价于方便，其他方面是相同的。例如ctx。类型和ctx。长度委托给响应对象，ctx。路径和ctx。方法委托给请求。

### Api

特定于上下文的方法和访问器。

