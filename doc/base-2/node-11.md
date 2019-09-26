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