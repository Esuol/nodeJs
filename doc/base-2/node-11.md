# node.js 作用域与闭包：this，var，(function () {})

## var 作用域

```js
var parent = function () {
  var name = "parent_name";
  var age = 13;

  var child = function () {
    var name = "child_name";
    var childAge = 0.3;

    // => child_name 13 0.3
    console.log(name, age, childAge);
  };

  child();

  // will throw Error
  // ReferenceError: childAge is not defined
  console.log(name, age, childAge);
};

parent();
```

直觉地，内部函数可以访问外部函数的变量，外部不能访问内部函数的变量。上面的例子中内部函数 child 可以访问变量 age，而外部函数 parent 不可以访问 child 中的变量 childAge，因此会抛出没有定义变量的异常。

有个重要的事，如果忘记var，那么变量就被声明为全局变量了。

```js
function foo() {
  value = "hello";
}
foo();
console.log(value); // 输出hello
console.log(global.value) // 输出hello
```

这个例子可以很正常的输出 hello，是因为 value 变量在定义时，没有使用 var 关键词，所以被定义成了全局变量。在 Node 中，全局变量会被定义在 global 对象下；在浏览器中，全局变量会被定义在 window 对象下。

如果你确实要定义一个全局变量的话，请显示地定义在 global 或者 window 对象上。

这类不小心定义全局变量的问题可以被 jshint 检测出来，如果你使用 sublime 编辑器的话，记得装一个 SublimeLinter 插件，这是插件支持多语言的语法错误检测，js 的检测是原生支持的。

JavaScript 中，变量的局部作用域是函数级别的。不同于 C 语言，在 C 语言中，作用域是块级别的。 JavaScript 中没有块级作用域。

js 中，函数中声明的变量在整个函数中都有定义。比如如下代码段，变量 i 和 value 虽然是在 for 循环代码块中被定义，但在代码块外仍可以访问 i 和 value。

```js
function foo() {
  for (var i = 0; i < 10; i++) {
    var value = "hello world";
  }
  console.log(i); //输出10
  console.log(value);//输出hello world
}
foo();
```