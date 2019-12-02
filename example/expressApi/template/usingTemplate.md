## Using template engines with Express

模板引擎允许您在应用程序中使用静态模板文件。在运行时，模板引擎用实际的值替换模板文件中的变量，并将模板转换为发送给客户机的HTML文件。这种方法使设计HTML页面变得更容易。

与Express一起工作的一些流行的模板引擎是Pug、Mustache和EJS。Express应用程序生成器使用Jade作为其默认值，但它还支持其他一些工具。

有关可以与Express一起使用的模板引擎列表，请参见模板引擎(Express wiki)。参见比较JavaScript模板引擎:Jade、Mustache、Dust等。

> **WARNING** 注:Jade已改名为Pug。你可以继续在你的应用程序中使用Jade，它会工作得很好。然而，如果你想要模板引擎的最新更新，你必须在你的应用程序中用Pug替换Jade。

### 要渲染模板文件，请设置以下应用程序设置属性，并在生成器创建的默认应用程序的app.js中进行设置：

视图，即模板文件所在的目录。 例如：app.set（'views'，'./views'）。 这默认为应用程序根目录中的views目录。

查看引擎，要使用的模板引擎。 例如，要使用Pug模板引擎：app.set（'view engine'，'pug'）。

然后安装相应的模板引擎npm包;例如安装Pug:

```sh
 npm install pug --save
```
> **WARNING** 与express兼容的模板引擎(如Jade和Pug)导出一个名为express的函数(filePath、选项、回调)，该函数由res.render()函数调用以呈现模板代码
> **WARNING** 一些模板引擎不遵循这个约定。js库遵循了这个惯例，它映射了所有流行的Node.js模板引擎，因此可以在Express中无缝工作。

设置好视图引擎后，你不必指定引擎或在app中加载模板引擎模块;Express在内部加载模块，如下所示(对于上面的示例)。

```js
app.set('view engine', 'pug')
```

创建一个名为index的Pug模板文件。视图目录中的pug，包含以下内容

```pug
html
  head
    title= title
  body
    h1= message
```

然后创建一个路由来呈现索引。pug文件。如果未设置视图引擎属性，则必须指定视图文件的扩展名。否则，您可以忽略它。

```js
app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!' })
})
```

当您向主页发出请求时，索引。pug文件将呈现为HTML格式。

注意:视图引擎缓存不缓存模板输出的内容，只缓存底层模板本身。

即使在缓存打开的情况下，视图仍然在每次请求时重新呈现。

要了解更多关于模板引擎如何在Express中工作的信息，请参见:为Express开发模板引擎。

### Developing template engines for Express 为Express开发模板引擎

使用app.engine(ext，回调)方法创建自己的模板引擎。ext指的是文件扩展名，回调是模板引擎函数，它接受下列作为参数的项:文件的位置、options对象和回调函数。

下面的代码是实现用于呈现.ntl文件的非常简单的模板引擎的示例。

```js
var fs = require('fs') // this engine requires the fs module
app.engine('ntl', function (filePath, options, callback) { // define the template engine
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(err)
    // this is an extremely simple template engine
    var rendered = content.toString()
      .replace('#title#', '<title>' + options.title + '</title>')
      .replace('#message#', '<h1>' + options.message + '</h1>')
    return callback(null, rendered)
  })
})
app.set('views', './views') // specify the views directory
app.set('view engine', 'ntl') // register the template engine
```

你的应用现在可以渲染 .ntl文件了。创建一个名为index的文件。包含以下内容的视图目录中的ntl。#标题

```ntl
#title#
#message#
```

然后，在您的应用程序中创建以下路由。

```js
app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!' })
})
```





