# node.js 测试用例：supertest

fibonacci 函数的定义为 int fibonacci(int n)，调用函数的路径是 '/fib?n=10'，然后这个接口会返回 '55'。函数的行为定义如下：

1. 当 n === 0 时，返回 0；n === 1时，返回 1;

2. n > 1 时，返回 fibonacci(n) === fibonacci(n-1) + fibonacci(n-2)，如 fibonacci(10) === 55;

3. n 不可大于10，否则抛错，http status 500，因为 Node.js 的计算性能没那么强。

4. n 也不可小于 0，否则抛错，500，因为没意义。

5. n 不为数字时，抛错，500。

test/main.test.js: 对 app 的接口进行测试，覆盖以上所有情况。

为什么说 supertest 是 superagent 的孪生库呢，因为他们的 API 是一模一样的。superagent 是用来抓取页面用的，而 supertest，是专门用来配合 express （准确来说是所有兼容 connect 的 web 框架）进行集成测试的。

假使你有一个 app: var app = express();，想对它的 get 啊，post 接口啊之类的进行测试，那么只要把它传给 supertest：var request = require('supertest')(app)。之后调用 requset.get('/path') 时，就可以对 app 的 path 路径进行访问了

## Example

我们来新建一个项目

```bash
 npm init # ..一阵乱填
```

然后安装我们的依赖（记得去弄清楚 npm i --save 与 npm i --save-dev 的区别）：

```json
 "devDependencies": {
    "mocha": "^1.21.4",
    "should": "^4.0.4",
    "supertest": "^0.14.0"
  },
  "dependencies": {
    "express": "^4.9.6"
  }
```

接着，编写 app.js

```js
var express = require('express');

// 与之前一样
var fibonacci = function (n) {
  // typeof NaN === 'number' 是成立的，所以要判断 NaN
  if (typeof n !== 'number' || isNaN(n)) {
    throw new Error('n should be a Number');
  }
  if (n < 0) {
    throw new Error('n should >= 0')
  }
  if (n > 10) {
    throw new Error('n should <= 10');
  }
  if (n === 0) {
    return 0;
  }
  if (n === 1) {
    return 1;
  }

  return fibonacci(n-1) + fibonacci(n-2);
};
// END 与之前一样

var app = express();

app.get('/fib', function (req, res) {
  // http 传来的东西默认都是没有类型的，都是 String，所以我们要手动转换类型
  var n = Number(req.query.n);
  try {
    // 为何使用 String 做类型转换，是因为如果你直接给个数字给 res.send 的话，
    // 它会当成是你给了它一个 http 状态码，所以我们明确给 String
    res.send(String(fibonacci(n)));
  } catch (e) {
    // 如果 fibonacci 抛错的话，错误信息会记录在 err 对象的 .message 属性中。
    // 拓展阅读：https://www.joyent.com/developers/node/design/errors
    res
      .status(500)
      .send(e.message);
  }
});

// 暴露 app 出去。module.exports 与 exports 的区别请看《深入浅出 Node.js》
module.exports = app;

app.listen(3000, function () {
  console.log('app is listening at port 3000');
});
```

```bash
npm i -g nodemon
```

这个库是专门调试时候使用的，它会自动检测 node.js 代码的改动，然后帮你自动重启应用。在调试时可以完全用 nodemon 命令代替 node 命令。