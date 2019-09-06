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

首先我们来看看服务端模式下如何工作。如开门红中的例子所示，首先需要使用.createServer方法创建一个服务器，然后调用.listen方法监听端口。之后，每当来了一个客户端请求，创建服务器时传入的回调函数就被调用一次。可以看出，这是一种事件机制。

HTTP请求本质上是一个数据流，由请求头（headers）和请求体（body）组成。例如以下是一个完整的HTTP请求数据内容。

```txt
POST / HTTP/1.1
User-Agent: curl/7.26.0
Host: localhost
Accept: */*
Content-Length: 11
Content-Type: application/x-www-form-urlencoded

Hello World
```

可以看到，空行之上是请求头，之下是请求体。HTTP请求在发送给服务器时，可以认为是按照从头到尾的顺序一个字节一个字节地以数据流方式发送的。而http模块创建的HTTP服务器在接收到完整的请求头后，就会调用回调函数。在回调函数中，除了可以使用request对象访问请求头数据外，还能把request对象当作一个只读数据流来访问请求体数据。以下是一个例子。

```js
http.createServer((req, res) => {
  var body = {}

  console.log(req.method)
  console.log(req.headers)

  req.on('data', (chunk) => {
    body.push(chunk)
  })

  req.on('end', () => {
    body = Buffer.concat(body)
    console.log(body.toString())
  })
}).listen(80)

------------------------------------

POST
{ 'user-agent': 'curl/7.26.0',
  host: 'localhost',
  accept: '*/*',
  'content-length': '11',
  'content-type': 'application/x-www-form-urlencoded' }
Hello World

```

HTTP响应本质上也是一个数据流，同样由响应头（headers）和响应体（body）组成。例如以下是一个完整的HTTP请求数据内容。

```txt
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 11
Date: Tue, 05 Nov 2013 05:31:38 GMT
Connection: keep-alive

Hello World
```

在回调函数中，除了可以使用response对象来写入响应头数据外，还能把response对象当作一个只写数据流来写入响应体数据。例如在以下例子中，服务端原样将客户端请求的请求体数据返回给客户端。

```js
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })

  req.on('data', (chunk) => {
    res.write(chunk)
  })

  req.on('end', () => {
    res.end()
  })
}).listen(80)
```

接下来我们看看客户端模式下如何工作。为了发起一个客户端HTTP请求，我们需要指定目标服务器的位置并发送请求头和请求体，以下示例演示了具体做法。

```js
var options = {
  hostname: 'www.example.com',
  port: 80,
  path: '/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}

var request = http.request(options, (res) => {})

request.write('hello world')

request.end()
```

可以看到，.request方法创建了一个客户端，并指定请求目标和请求头数据。之后，就可以把request对象当作一个只写数据流来写入请求体数据和结束请求。另外，由于HTTP请求中GET请求是最常见的一种，并且不需要请求体，因此http模块也提供了以下便捷API。

```js
http.get('http://www.example.com/', function (response) {});
```

当客户端发送请求并接收到完整的服务端响应头时，就会调用回调函数。在回调函数中，除了可以使用response对象访问响应头数据外，还能把response对象当作一个只读数据流来访问响应体数据。以下是一个例子。

```js
http.get('http://www.example.com', (res) => {
  var body = []

  console.log(res.statusCode)
  console.log(res.headers)

  res.on('data', (chunk) => {
    body.push(chunk)
  })

  res.on('end', () => {
    body = Buffer.concat(body)
    console.log(body.toString())
  })
})

------------------------------------
200
{ 'content-type': 'text/html',
  server: 'Apache',
  'content-length': '801',
  date: 'Tue, 05 Nov 2013 06:08:41 GMT',
  connection: 'keep-alive' }
<!DOCTYPE html>

```

## https

https模块与http模块极为类似，区别在于https模块需要额外处理SSL证书。

在服务端模式下，创建一个HTTPS服务器的示例如下。

```js
var options = {
  key: fs.readFileSync('./ssl/default.key'),
  cert: fs.readFileSync('./ssl/default.cer')
}

var server = https.createServer(options, (req, res) => {

})
```

可以看到，与创建HTTP服务器相比，多了一个options对象，通过key和cert字段指定了HTTPS服务器使用的私钥和公钥。

另外，NodeJS支持SNI技术，可以根据HTTPS客户端请求使用的域名动态使用不同的证书，因此同一个HTTPS服务器可以使用多个域名提供服务。接着上例，可以使用以下方法为HTTPS服务器添加多组证书。

```js
server.addContext('foo.com', {
  key: fs.readFileSync('./ssl/foo.com.key'),
  cert: fs.readFileSync('./ssl/foo.com.cert)
})

server.addContext('bar.com', {
  key: fs.readFileSync('./ssl/bar.com.key'),
  cert: fs.readFileSync('./ssl/bar.com.cert)
})
```

在客户端模式下，发起一个HTTPS客户端请求与http模块几乎相同，示例如下。

```js
const options = {
  hostname: 'www.example.com',
  port: 443,
  path: '/',
  method: 'GET'
}

var request = https.request(options, (res) => {})

request.end()
```

但如果目标服务器使用的SSL证书是自制的，不是从颁发机构购买的，默认情况下https模块会拒绝连接，提示说有证书安全问题。在options里加入rejectUnauthorized: false字段可以禁用对证书有效性的检查，从而允许https模块请求开发环境下使用自制证书的HTTPS服务器。

