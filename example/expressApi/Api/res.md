## response

### res.app

### res.headersSent

布尔属性，指示应用程序是否发送响应的HTTP头信息。

```js
app.get('/', function (req, res) {
  console.dir(res.headersSent) // false
  res.send('OK')
  console.dir(res.headersSent) // true
})
```

### res.locals

包含响应局部变量的对象，该局部变量的范围仅限于该请求，因此仅可用于在该请求/响应周期（如果有）中呈现的视图。 否则，此属性与app.locals相同。

此属性对于公开请求级别的信息很有用，例如请求路径名，经过身份验证的用户，用户设置等。

```js
app.use(function (req, res, next) {
  res.locals.user = req.user
  res.locals.authenticated = !req.user.anonymous
  next()
})
```

## methods

### res.append(field [, value])

将指定的值附加到HTTP响应头字段。如果尚未设置标头，则使用指定的值创建标头。值参数可以是字符串或数组。

注意:在res.append()之后调用res.set()将重置以前设置的标题值。

```js
res.append('Link', ['<http://localhost/>', '<http://localhost:3000/>'])
res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly')
res.append('Warning', '199 Miscellaneous warning')
```

### res.attachment([filename])

将HTTP响应的Content-Disposition标头字段设置为“ attachment”。 如果提供了文件名，则它通过res.type（）基于扩展名设置Content-Type，并设置Content-Disposition“ filename =”参数。

```js
res.attachment()
// Content-Disposition: attachment

res.attachment('path/to/logo.png')
// Content-Disposition: attachment; filename="logo.png"
// Content-Type: image/png
```

### res.cookie(name, value [, options])

设置cookie名称为value。value参数可以是一个转换为JSON的字符串或对象。

options参数是一个具有以下属性的对象。

```js
res.cookie('name', 'tobi', { domain: '.example.com', path: '/admin', secure: true })
res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true })
```

例如，您可以通过多次调用res.cookie来在一个响应中设置多个cookie

```js
res
  .status(201)
  .cookie('access_token', 'Bearer ' + token, {
    expires: new Date(Date.now() + 8 * 3600000) // cookie will be removed after 8 hours
  })
  .cookie('test', 'test')
  .redirect(301, '/admin')
```

encode选项允许您选择用于cookie值编码的函数。 不支持异步功能。

用例示例：您需要为组织中的另一个站点设置域范围的cookie。 此其他站点（不受您的管理控制）不使用URI编码的cookie值。

```js
// Default encoding
res.cookie('some_cross_domain_cookie', 'http://mysubdomain.example.com', { domain: 'example.com' })
// Result: 'some_cross_domain_cookie=http%3A%2F%2Fmysubdomain.example.com; Domain=example.com; Path=/'

// Custom encoding
res.cookie('some_cross_domain_cookie', 'http://mysubdomain.example.com', { domain: 'example.com', encode: String })
// Result: 'some_cross_domain_cookie=http://mysubdomain.example.com; Domain=example.com; Path=/;'
```

maxAge选项是一个方便的选项，用于设置“expires”相对于当前时间(以毫秒为单位)。下面的例子相当于上面的第二个例子。

```js
res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true })
```

可以将对象作为值参数传递;然后它被序列化为JSON，并由bodyParser()中间件解析。

```js
res.cookie('cart', { items: [1, 2, 3] })
res.cookie('cart', { items: [1, 2, 3] }, { maxAge: 900000 })
```

在使用cookie解析器中间件时，此方法还支持签名cookie。只需将带符号的选项设置为true即可。然后res.cookie()将使用传递给cookieParser(secret)的秘密对值进行签名。

```js
res.cookie('name', 'tobi', { signed: true })
```

### res.clearCookie(name [, options])

清除按名称指定的cookie。

### res.download(path [, filename] [, options] [, fn])

以附件的形式在路径上传输文件。通常，浏览器会提示用户下载。默认情况下，内容配置头filename= parameter是path(通常出现在浏览器对话框中)。使用filename参数覆盖此默认值。

当错误发生或传输完成时，该方法调用可选的回调函数fn。此方法使用res.sendFile()传输文件。

可选选项参数传递到底层的res.sendFile()调用，并接受完全相同的参数。

```js
res.download('/report-12345.pdf')

res.download('/report-12345.pdf', 'report.pdf')

res.download('/report-12345.pdf', 'report.pdf', function (err) {
  if (err) {
    // Handle error, but keep in mind the response may be partially-sent
    // so check res.headersSent
  } else {
    // decrement a download credit, etc.
  }
})
```

### res.end([data] [, encoding])

结束响应过程。这个方法实际上来自Node core，特别是http.ServerResponse的response.end()方法。

用于在没有任何数据的情况下快速结束响应。如果需要使用数据进行响应，那么应该使用res.send()和res.json()等方法。

```js
res.end()
res.status(404).end()
```

### res.format(object)

在出现请求对象时，对Accept HTTP标头执行内容协商。它使用req.accept()根据质量值排序的可接受类型为请求选择处理程序。如果未指定标头，将调用第一个回调。当没有找到匹配项时，服务器将使用406表示不可接受，或者调用默认的回调。

当选择回调时设置内容类型的响应标头。但是，您可以在回调中使用res.set()或res.type()等方法来更改它。

```js
res.format({
  'text/plain': function () {
    res.send('hey')
  },

  'text/html': function () {
    res.send('<p>hey</p>')
  },

  'application/json': function () {
    res.send({ message: 'hey' })
  },

  'default': function () {
    // log the request and respond with 406
    res.status(406).send('Not Acceptable')
  }
})
```

除了规范化的MIME类型之外，您还可以使用映射到这些类型的扩展名来实现稍微简洁的实现

```js
res.format({
  text: function () {
    res.send('hey')
  },

  html: function () {
    res.send('<p>hey</p>')
  },

  json: function () {
    res.send({ message: 'hey' })
  }
})
```

### res.get(field)

返回字段指定的HTTP响应头。匹配不区分大小写

```js
res.get('Content-Type')
// => "text/plain"
```

### res.json([body])

发送一个JSON响应。此方法发送一个响应(带有正确的内容类型)，该响应是使用JSON.stringify()转换为JSON字符串的参数。

参数可以是任何JSON类型，包括对象、数组、字符串、布尔值、数字或null，还可以使用它将其他值转换为JSON。

```js
res.json(null)
res.json({ user: 'tobi' })
res.status(500).json({ error: 'message' })
```

### res.jsonp([body])

发送一个支持JSONP的JSON响应。这个方法与res.json()相同，只是它选择了JSONP回调支持。

```js
res.jsonp(null)
// => callback(null)

res.jsonp({ user: 'tobi' })
// => callback({ "user": "tobi" })

res.status(500).jsonp({ error: 'message' })
// => callback({ "error": "message" })
```
默认情况下，JSONP回调名称只是回调。 使用jsonp回调名称设置覆盖此设置。

以下是使用相同代码的JSONP响应的一些示例：

```js
// ?callback=foo
res.jsonp({ user: 'tobi' })
// => foo({ "user": "tobi" })

app.set('jsonp callback name', 'cb')

// ?cb=foo
res.status(500).jsonp({ error: 'message' })
// => foo({ "error": "message" })
```

### res.links(links)

连接作为参数属性提供的链接，以填充响应s链接HTTP头字段。

```js
res.links({
  next: 'http://api.example.com/users?page=2',
  last: 'http://api.example.com/users?page=5'
})
```

产生以下结果

```html
Link: <http://api.example.com/users?page=2>; rel="next",
      <http://api.example.com/users?page=5>; rel="last"
```

### res.location(path)

将响应位置HTTP标头设置为指定的路径参数。

```js
res.location('/foo/bar')
res.location('http://example.com')
res.location('back')
```

路径值“ back”具有特殊含义，它引用请求的Referer标头中指定的URL。 如果未指定Referer标头，则它引用“ /”。

### res.redirect([status,] path)

重定向到从指定路径派生的URL，该路径具有指定的状态(对应于HTTP状态码的正整数)。如果没有指定，状态默认为302 Found。

```js
res.redirect('/foo/bar')
res.redirect('http://example.com')
res.redirect(301, 'http://example.com')
res.redirect('../login')
```

重定向可以是一个完全限定的URL，用于重定向到不同的站点

```js
res.redirect('http://google.com')
```

重定向可以相对于主机名的根。例如，如果应用程序位于http://example.com/admin/post/new上，则以下内容将重定向到URL http://example.com/admin:

```js
res.redirect('/admin')
```

重定向可以相对于当前URL。例如，从http://example.com/blog/admin/(注意后面的斜杠)可以重定向到URL http://example.com/blog/admin/post/new。

```js
res.redirect('post/new')
```

从http://example.com/blog/admin重定向到post / new（不带斜杠），将重定向到http://example.com/blog/post/new。

如果您发现上面的行为令人困惑，可以将路径段看作目录(带有斜杠)和文件，这将开始变得有意义。

相对路径重定向也是可能的。 如果您使用的是http://example.com/admin/post/new，则以下内容将重定向到http://example.com/admin/post：

```js
res.redirect('..')
```

反向重定向将请求重定向回引用方，默认为/当引用方缺失时。

```js
res.redirect('back')
```

### res.render(view [, locals] [, callback])

呈现视图并将呈现的HTML字符串发送给客户端。可选参数:

局部变量，其属性为视图定义局部变量的对象。

回调，一个回调函数。如果提供了，该方法将返回可能的错误和呈现的字符串，但不执行自动响应。当发生错误时，该方法在内部调用next(err)。

view参数是一个字符串，它是要呈现的视图文件的文件路径。 这可以是绝对路径，也可以是相对于视图设置的路径。 如果路径不包含文件扩展名，则视图引擎设置将确定文件扩展名。 如果路径中确实包含文件扩展名，则Express将为指定的模板引擎加载模块（通过require（）），并使用加载的模块的__express函数进行呈现。

有关更多信息，请参阅在Express中使用模板引擎。

注意：view参数执行文件系统操作，例如从磁盘读取文件并评估Node.js模块，因此出于安全原因，不应包含最终用户的输入。

局部变量缓存启用视图缓存。 将其设置为true，以在开发期间缓存视图； 默认情况下，生产中启用了视图缓存。

```js
// send the rendered view to the client
res.render('index')

// if a callback is specified, the rendered HTML string has to be sent explicitly
res.render('index', function (err, html) {
  res.send(html)
})

// pass a local variable to the view
res.render('user', { name: 'Tobi' }, function (err, html) {
  // ...
})
```

### res.send([body])

发送HTTP响应。

body参数可以是Buffer对象，String，对象或Array。 例如：

```js
res.send(Buffer.from('whoop'))
res.send({ some: 'json' })
res.send('<p>some html</p>')
res.status(404).send('Sorry, we cannot find that!')
res.status(500).send({ error: 'something blew up' })
```

该方法为简单的非流式响应执行许多有用的任务:例如，它自动分配内容长度的HTTP响应报头字段(除非以前定义过)，并提供自动头和HTTP缓存新鲜度支持。

当参数为缓冲区对象时，该方法将Content-Type response头字段设置为“application/octet-stream”，除非前面定义如下:

```js
res.set('Content-Type', 'text/html')
res.send(Buffer.from('<p>some html</p>'))
```

当参数为String时，该方法将Content-Type设置为“ text / html”：

```js
res.send('<p>some html</p>')
```

当参数是数组或对象时，Express使用JSON表示进行响应

```js
res.send({ user: 'tobi' })
res.send([1, 2, 3])
```

### res.sendFile(path [, options] [, fn])

从Express v4.8.0开始支持res.sendFile()。

按指定路径传输文件。基于文件名扩展名设置内容类型响应HTTP头字段。除非在options对象中设置了根选项，否则path必须是文件的绝对路径。

这个API提供了对正在运行的文件系统上的数据的访问。确保(a)如果路径参数包含用户输入，则其构造为绝对路径的方式是安全的;(b)将根选项设置为目录的绝对路径，以包含访问权限。

当提供根选项时，path参数可以是一个相对路径，包括包含…Express将验证作为path提供的相对路径将在给定根选项中解析。

传输完成或发生错误时，该方法将调用回调函数fn（err）。 如果指定了回调函数并且发生错误，则回调函数必须通过结束请求-响应周期或将控制权传递给下一条路由来显式处理响应过程。

这是使用res.sendFile及其所有参数的示例。

原文

```js
app.get('/file/:name', function (req, res, next) {
  var options = {
    root: path.join(__dirname, 'public'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }

  var fileName = req.params.name
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err)
    } else {
      console.log('Sent:', fileName)
    }
  })
})
```
以下示例说明了如何使用res.sendFile为服务文件提供细粒度的支持：

```js
app.get('/user/:uid/photos/:file', function (req, res) {
  var uid = req.params.uid
  var file = req.params.file

  req.user.mayViewFilesFrom(uid, function (yes) {
    if (yes) {
      res.sendFile('/uploads/' + uid + '/' + file)
    } else {
      res.status(403).send("Sorry! You can't see that.")
    }
  })
})
```

### res.sendStatus(statusCode)

将响应HTTP状态代码设置为statusCode，并将其字符串表示形式作为响应主体发送。

```js
res.sendStatus(200) // equivalent to res.status(200).send('OK')
res.sendStatus(403) // equivalent to res.status(403).send('Forbidden')
res.sendStatus(404) // equivalent to res.status(404).send('Not Found')
res.sendStatus(500) // equivalent to res.status(500).send('Internal Server Error')
```

如果指定了不受支持的状态代码，HTTP状态仍然设置为statusCode，并将代码的字符串版本作为响应体发送。

当res.statusCode被设置为无效的HTTP状态码(范围在100到599之间)时，某些版本的Node.js会抛出。有关正在使用的Node.js版本，请参阅HTTP服务器文档。

```js
res.sendStatus(9999) // equivalent to res.status(9999).send('9999')
```

### res.set(field [, value])

将响应的HTTP头字段设置为值。若要同时设置多个字段，请传递一个对象作为参数。

```js
res.set('Content-Type', 'text/plain')

res.set({
  'Content-Type': 'text/plain',
  'Content-Length': '123',
  'ETag': '12345'
})
```

### res.status(code)

设置响应的HTTP状态。它是Node的response.statusCode的一个可链别名。

```js
res.status(403).end()
res.status(400).send('Bad Request')
res.status(404).sendFile('/absolute/path/to/404.png')
```

### res.type(type)

将内容类型HTTP头设置为MIME类型，由指定类型的MIME .lookup()确定。如果type包含“/”字符，则将内容类型设置为type。

```js
res.type('.html')
// => 'text/html'
res.type('html')
// => 'text/html'
res.type('json')
// => 'application/json'
res.type('application/json')
// => 'application/json'
res.type('png')
// => 'image/png'
```

### res.vary(field)

将字段添加到Vary响应标头(如果它还不存在)。

```js
res.vary('User-Agent').render('docs')
```








