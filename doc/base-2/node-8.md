# node.js 浏览器端测试：mocha，chai，phantomjs

## 目标

此函数的定义为 int fibonacci(int n)

当 n === 0 时，返回 0；n === 1时，返回 1;

n > 1 时，返回 fibonacci(n) === fibonacci(n-1) + fibonacci(n-2)，如 fibonacci(10) === 55;

## 前端脚本单元测试

出于应用健壮性的考量，针对前端 js 脚本的单元测试也非常重要。而前后端通吃，也是 mocha 的一大特点。

首先，前端脚本的单元测试主要有两个困难需要解决。

1. 运行环境应当在浏览器中，可以操纵浏览器的DOM对象，且可以随意定义执行时的 html 上下文。

2. 测试结果应当可以直接反馈给 mocha，判断测试是否通过。

### 浏览器环境执行

我们首先搭建一个测试原型，用 mocha 自带的脚手架可以自动生成。

```bash
cd vendor            # 进入我们的项目文件夹
npm i -g mocha       # 安装全局的 mocha 命令行工具
mocha init .         # 生成脚手架
```

mocha就会自动帮我们生成一个简单的测试原型, 目录结构如下

```bash
.
├── index.html       # 这是前端单元测试的入口
├── mocha.css
├── mocha.js
└── tests.js         # 我们的单元测试代码将在这里编写
```

其中 index.html 是单元测试的入口，tests.js 是我们的测试用例文件。

我们直接在 index.html 插入上述示例的 fibonacci 函数以及断言库 chaijs。

```html
<div id="mocha"></div>
<script src='https://cdn.rawgit.com/chaijs/chai/master/chai.js'></script>
<script>
  var fibonacci = function (n) {
    if (n === 0) {
      return 0;
    }
    if (n === 1) {
      return 1;
    }
    return fibonacci(n-1) + fibonacci(n-2);
  };
</script>
```

然后在tests.js中写入对应测试用例

```js
var should = chai.should();
describe('simple test', function () {
  it('should equal 0 when n === 0', function () {
    window.fibonacci(0).should.equal(0);
  });
});
```

### 测试反馈

mocha没有提供一个命令行的前端脚本测试环境(因为我们的脚本文件需要运行在浏览器环境中)，因此我们使用phantomjs帮助我们搭建一个模拟环境。不重复制造轮子，这里直接使用mocha-phantomjs帮助我们在命令行运行测试。

首先安装mocha-phantomjs

```bash
npm i -g mocha-phantomjs
```

然后在 index.html 的页面下加上这段兼容代码

```html
<script>mocha.run()</script>
```

改为

```html
<script>
  if (window.initMochaPhantomJS && window.location.search.indexOf('skip') === -1) {
    initMochaPhantomJS()
  }
  mocha.ui('bdd');
  expect = chai.expect;

  mocha.run();
</script>
```

这时候, 我们在命令行中运行

```js
mocha-phantomjs index.html --ssl-protocol=any --ignore-ssl-errors=true
```

结果展现是不是和后端代码测试很类似 😄

更进一步，我们可以直接在 package.json 的 scripts 中添加 (package.json 通过 npm init 生成，这里不再赘述)

```json
"scripts": {
  "test": "mocha-phantomjs index.html --ssl-protocol=any --ignore-ssl-errors=true"
},
```

将mocha-phantomjs作为依赖

```bash
npm i mocha-phantomjs --save-dev
```

直接运行

```bash
npm test
```

至此,我们实现了前端脚本的单元测试，基于 phanatomjs 你几乎可以调用所有的浏览器方法，而 mocha-phanatomjs 也可以很便捷地将测试结果反馈到 mocha，便于后续的持续集成。