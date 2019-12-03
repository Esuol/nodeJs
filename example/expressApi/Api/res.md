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