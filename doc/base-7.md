# node.js 异步编程

NodeJS最大的卖点——事件机制和异步IO，对开发者并不是透明的。开发者需要按异步方式编写代码才用得上这个卖点，而这一点也遭到了一些NodeJS反对者的抨击。但不管怎样，异步编程确实是NodeJS最大的特点，没有掌握异步编程就不能说是真正学会了NodeJS。本章将介绍与异步编程相关的各种知识。

## 回调

在代码中，异步编程的直接体现就是回调。异步编程依托于回调来实现，但不能说使用了回调后程序就异步化了。我们首先可以看看以下代码。

```js
function heavyCompute(n, callback) {
   var count = 0,
        i, j;

  for(i = n; i > 0; --i) {
    for (j = n; j > 0; --j) {
            count += 1;
      }
  }

   callback(count);
}

heavyCompute(10000, function (count) {
    console.log(count);
});

console.log('hello');

// ---------------------------

100000000
hello
```

可以看到，以上代码中的回调函数仍然先于后续代码执行。JS本身是单线程运行的，不可能在一段代码还未结束运行时去运行别的代码，因此也就不存在异步执行的概念。

但是，如果某个函数做的事情是创建一个别的线程或进程，并与JS主线程并行地做一些事情，并在事情做完后通知JS主线程，那情况又不一样了。我们接着看看以下代码。

```js
setTimeout(function () {
    console.log('world');
}, 1000);

console.log('hello');

-- Console ------------------------------
hello
world
```

这次可以看到，回调函数后于后续代码执行了。如同上边所说，JS本身是单线程的，无法异步执行，因此我们可以认为setTimeout这类JS规范之外的由运行环境提供的特殊函数做的事情是创建一个平行线程后立即返回，让JS主进程可以接着执行后续代码，并在收到平行进程的通知后再执行回调函数。除了setTimeout、setInterval这些常见的，这类函数还包括NodeJS提供的诸如fs.readFile之类的异步API。

另外，我们仍然回到JS是单线程运行的这个事实上，这决定了JS在执行完一段代码之前无法执行包括回调函数在内的别的代码。也就是说，即使平行线程完成工作了，通知JS主线程执行回调函数了，回调函数也要等到JS主线程空闲时才能开始执行。以下就是这么一个例子。

```js
function heavyCompute(n) {
    var count = 0,
        i, j;

    for (i = n; i > 0; --i) {
        for (j = n; j > 0; --j) {
            count += 1;
        }
    }
}

var t = new Date();

setTimeout(function () {
    console.log(new Date() - t);
}, 1000);

heavyCompute(50000);

-- Console ------------------------------
8520
```

可以看到，本来应该在1秒后被调用的回调函数因为JS主线程忙于运行其它代码，实际执行时间被大幅延迟。

## 代码设计模式

异步编程有很多特有的代码设计模式，为了实现同样的功能，使用同步方式和异步方式编写的代码会有很大差异。以下分别介绍一些常见的模式。

### 函数返回值

使用一个函数的输出作为另一个函数的输入是很常见的需求，在同步方式下一般按以下方式编写代码：

```js
var output = fn1(fn2('input'));
// Do something.
```

而在异步方式下，由于函数执行结果不是通过返回值，而是通过回调函数传递，因此一般按以下方式编写代码：

```js
fn2('input', output2 => {
  fn1(output2, output1 => {
     // Do something.
  })
})
```

可以看到，这种方式就是一个回调函数套一个回调函多，套得太多了很容易写出>形状的代码。

### 遍历数组

在遍历数组时，使用某个函数依次对数据成员做一些处理也是常见的需求。如果函数是同步执行的，一般就会写出以下代码：

```js
var len = arr.length,
    i = 0;

for (; i < len; ++i) {
    arr[i] = sync(arr[i]);
}

// All array items have processed.
```

如果函数是异步执行的，以上代码就无法保证循环结束后所有数组成员都处理完毕了。如果数组成员必须一个接一个串行处理，则一般按照以下方式编写异步代码：

```js
(function next(i, len, callbcak) {
  if(i < len) {
    async(arr[i], value => {
      arr[i] = value
      next(i + 1, len, callback);
    })
  } else {
      callback();
  }
})(0, arr.length, () => {

})
```

可以看到，以上代码在异步函数执行一次并返回执行结果后才传入下一个数组成员并开始下一轮执行，直到所有数组成员处理完毕后，通过回调的方式触发后续代码的执行。

如果数组成员可以并行处理，但后续代码仍然需要所有数组成员处理完毕后才能执行的话，则异步代码会调整成以下形式：

```js
(function(i, len, count, callback) {
   for (; i < len; ++i) {
     (function(i) {
       async(arr[i], value => {
        arr[i] = value
        if (++count === len) {
            callback();
        }
       })
     })(i)
   }
})(0, arr.length, 0, (i) => {
  console.log(i)
})
```

