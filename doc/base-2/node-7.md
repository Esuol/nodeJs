# node.js 测试用例：mocha，should，istanbul

此函数的定义为 int fibonacci(int n)

当 n === 0 时，返回 0；n === 1时，返回 1;

n > 1 时，返回 fibonacci(n) === fibonacci(n-1) + fibonacci(n-2)，如 fibonacci(10) === 55;

n 不可大于10，否则抛错，因为 Node.js 的计算性能没那么强。

n 也不可小于 0，否则抛错，因为没意义。

n 不为数字时，抛错。

test/main.test.js: 对 main 函数进行测试，并使行覆盖率和分支覆盖率都达到 100%。

## 建立我们的 main.js 文件，编写 fibonacci 函数。

```js
var fibonacci = function (n) {
  if (n === 0) {
    return 0;
  }
  if (n === 1) {
    return 1;
  }
  return fibonacci(n-1) + fibonacci(n-2);
};

if (require.main === module) {
  // 如果是直接执行 main.js，则进入此处
  // 如果 main.js 被其他文件 require，则此处不会执行。
  var n = Number(process.argv[2]);
  console.log('fibonacci(' + n + ') is', fibonacci(n));
}
```

先得把 main.js 里面的 fibonacci 暴露出来，这个简单。加一句

exports.fibonacci = fibonacci;（要是看不懂这句就去补补 Node.js 的基础知识吧）

然后我们在 test/main.test.js 中引用我们的 main.js，并开始一个简单的测试。

```js
// file: test/main.test.js
var main = require('../main');
var should = require('should');

describe('test/main.test.js', function () {
  it('should equal 55 when n === 10', function () {
    main.fibonacci(10).should.equal(55);
  });
});
```

装个全局的 mocha: $ npm install mocha -g。

 与 非-g 的区别，就是安装位置的区别，g 是 global 的意思。如果不加的话，则安装 mocha 在你的项目目录下面；如果加了，则这个 mocha 是安装在全局的，如果 mocha 有可执行命令的话，那么这个命令也会自动加入到你系统 $PATH 中的某个地方（在我的系统中，是这里 /Users/alsotang/.nvm/v0.10.29/bin）

$ mocha

那么，代码中的 describe 和 it 是什么意思呢？其实就是 BDD 中的那些意思，把它们当做语法来记就好了。

大家来看看 nodeclub 中，关于 topicController 的测试文件：

describe 中的字符串，用来描述你要测的主体是什么；it 当中，描述具体的 case 内容。

而引入的那个 should 模块，是个断言库。玩过 ruby 的同学应该知道 rspec，rspec 它把测试框架和断言库的事情一起做了，而在 Node.js 中，这两样东西的作用分别是 mocha 和 should 在协作完成。

should 在 js 的 Object “基类”上注入了一个 #should 属性，这个属性中，又有着许许多多的属性可以被访问

比如测试一个数是不是大于3，则是 (5).should.above(3)；测试一个字符串是否有着特定前缀：'foobar'.should.startWith('foo');。
