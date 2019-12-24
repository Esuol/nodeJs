# koa 中间件机制详解

在我眼中，koa的确是比express轻量的多，koa给我的感觉更像是一个中间件框架，koa只是一个基础的架子，需要用到的相应的功能时，用相应的中间件来实现就好，诸如路由系统等。一个更好的点在于，express是基于回调来处理，至于回调到底有多么的不好，大家可以自行搜索来看。koa1基于的co库，所以koa1利用Generator来代替回调，而koa2由于node对async/await的支持，所以koa2利用的是async/await

## koa1的中间件

koa1主要利用的是Generator来实现，一般来说，koa1的一个中间件大概是长这个样子的：

```js
app.use(function *(next){
    console.log(1);
    yield next;
    console.log(5);
});
app.use(function *(next){
    console.log(2);
    yield next;
    console.log(4);
});
app.use(function *(){
    console.log(3);
});
```

这样的输出会是1, 2, 3, 4, 5，koa的中间件的实现主要依靠的是koa-compose：

```js
function compose(middleware){
  return function *(next){
    if (!next) next = noop();

    var i = middleware.length;
    // 组合中间件
    while (i--) {
      next = middleware[i].call(this, next);
    }

    return yield *next;
  }
}
function *noop(){}
```

源码非常的简单，实现的功能就是将所有的中间件串联起来，首先给倒数第一个中间件传入一个noop作为其next，再将这个整理后的倒数第一个中间作为next传入倒数第二个中间件，最终得到的next就是整理后的第一个中间件。

实现的效果如同上图，与redux需要实现的目标类似，只要遇到了yield next就去执行下一个中间件，利用co库很容易将这个流程串联起来，下面来简单模拟下，中间件完整的实现：

```js
const middlewares = [];

const getTestMiddWare = (loggerA, loggerB) => {
    return function *(next) {
        console.log(loggerA);
        yield next;
        console.log(loggerB);
    }
};
const mid1 = getTestMiddWare(1, 4),
    mid2 = getTestMiddWare(2, 3);

const getData = new Promise((resolve, reject) => {
    setTimeout(() => resolve('数据已经取出'), 1000);
});

function *response(next) {
    // 模拟异步读取数据库数据
    const data = yield getData;
    console.log(data);
}

middlewares.push(mid1, mid2, response);
// 简单模拟co库
function co(gen) {
    const ctx = this,
        args = Array.prototype.slice.call(arguments, 1);
    return new Promise((reslove, reject) => {
        if (typeof gen === 'function') gen = gen.apply(ctx, args);
        if (!gen || typeof gen.next !== 'function') return resolve(gen);

        const baseHandle = handle => res => {
            let ret;
            try {
                ret = gen[handle](res);
            } catch(e) {
                reject(e);
            }
            next(ret);
        };
        const onFulfilled = baseHandle('next'),
            onRejected = baseHandle('throw');

        onFulfilled();
        function next(ret) {
            if (ret.done) return reslove(ret.value);
            // 将yield的返回值转换为Proimse
            let value = null;
            if (typeof ret.value.then !== 'function') {
                value = co(ret.value);
            } else {
                value = ret.value;
            }
            if (value) return value.then(onFulfilled, onRejected);
            return onRejected(new TypeError('yield type error'));
        }
      });
}
// 调用方式
const gen = compose(middlewares);
co(gen);
```

## koa2 中间件

随着node对于async/await的支持，貌似不需要再借助于co这种工具库了，直接利用原生的就好，于是koa也做出了改变，来看目前的koa-compose：

```js
function compose (middleware) {
  // 参数检验
  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      // 最后一个中间件的调用
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      // 用Promise包裹中间件，方便await调用
      try {
        return Promise.resolve(fn(context, function next () {
          return dispatch(i + 1)
        }))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

koa-compose利用了Promise，koa2的中间件的参数也有一个变为了两个，而且执行下一个的中间件利用的是await next()，要达到与上面的示例代码的相同效果，需要更改中间件的写法：

```js
const middlewares = [];
const getTestMiddWare = (loggerA, loggerB) => async (ctx, next) => {
    console.log(loggerA);
    await next();
    console.log(loggerB);
};

const mid1 = getTestMiddWare(1, 4),
    mid2 = getTestMiddWare(2, 3);
const response = async () => {
    // 模拟异步读取数据库数据
    const data = await getData();
    console.log(data);
};
const getData = () => new Promise((resolve, reject) => {
    setTimeout(() => resolve('数据已经取出'), 1000);
});
middlewares.push(mid1, mid2);

// 调用方式
compose(middlewares)(null, response);
```