# node.js benchmark 怎么写

有一个字符串 var number = '100'，我们要将它转换成 Number 类型的 100。

目前有三个选项：+, parseInt, Number

请测试哪个方法更快。

首先去弄个 benchmark 库

## 实现

```ts
let int1: (str: string) => number = function(str) {
  return +str
}

let int2 = <T>(str: T) => number = function(str) {
  return parseInt(str, 10);
}

interface Int3 {
  <T>(str: T): number
}

let int3: Int3

int3 = function<T>(str: T) {
  return Number(str)
}
```

然后照着官方的模板写 benchmark suite：

```js
var number = '100';

// 添加测试
suite
.add('+', function() {
  int1(number);
})
.add('parseInt', function() {
  int2(number);
})
.add('Number', function () {
  int3(number);
})
// 每个测试跑完后，输出信息
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
// 这里的 async 不是 mocha 测试那个 async 的意思，这个选项与它的时间计算有关，默认勾上就好了。
.run({ 'async': true });
```

可以看到，parseInt 是最快的。