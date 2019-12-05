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
