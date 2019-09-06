# node.js 网络操作

不了解网络编程的程序员不是好前端，而NodeJS恰好提供了一扇了解网络编程的窗口。通过NodeJS，除了可以编写一些服务端程序来协助前端开发和测试外，还能够学习一些HTTP协议与Socket协议的相关知识，这些知识在优化前端性能和排查前端故障时说不定能派上用场。本章将介绍与之相关的NodeJS内置模块。

## 开门红

NodeJS本来的用途是编写高性能Web服务器。我们首先在这里重复一下官方文档里的例子，使用NodeJS内置的http模块简单实现一个HTTP服务器。

```js
const http = require('http')

http.createServer((res, rep) => {
  res.writeHead(200, { 'Content-Type': 'text-plain' })
  response.end('Hello World\n')
}).listen(8124)
```

以上程序创建了一个HTTP服务器并监听8124端口，打开浏览器访问该端口http://127.0.0.1:8124/就能够看到效果。

豆知识： 在Linux系统下，监听1024以下端口需要root权限。因此，如果想监听80或443端口的话，需要使用sudo命令启动程序。

## API走马观花

### 'http'模块提供两种使用方式：

1. 作为服务端使用时，创建一个HTTP服务器，监听HTTP客户端请求并返回响应。

2. 作为客户端使用时，发起一个HTTP客户端请求，获取服务端响应。

