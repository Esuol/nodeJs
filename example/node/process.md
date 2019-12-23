# 进程

JS 是单线程执行的，但是我们可以启动多个进程来执行，nodejs 中子进程管理以及进程守候是非常重要的知识点。

## 线程 vs 进程

进程（Process） 是具有一定独立功能的程序关于某个数据集合上的一次运行活动，进程是系统进行资源分配和调度的一个独立单位。 线程（Thread） 是进程的一个实体，是 CPU 调度和分派的基本单位，它是比进程更小的能独立运行的基本单位。线程自己不拥有系统资源，它与同属一个进程的其他的线程共享进程所拥有的全部资源。

线程是进程中更小的单位，我们无法通过工具直观的看到。一个进程至少启动一个线程，或者启动若干个线程（多线程）。JS 是单线程运行的，我们无法通过 JS 代码新启动一个线程（java 就可以），但是可以新启动一个进程。

注意，新启动一个进程是比较耗费资源的，不应频繁启动。如果遇到需要频繁启动新进程的需求，应该考虑其他的解决方案（我曾经就遇到过，差点入坑）。

## 为何要启用多进程

1 现在的服务器都是多核 CPU ，启动多进程可以有效提高 CPU 利用率，否则 CPU 资源就白白浪费了。一般会根据 CPU 的核数，启动数量相同的进程数。

2 v8 引擎的垃圾回收算法的限制，nodejs 能使用的系统内存是受限制的（64 位最多使用 1.4GB ，32 位最多使用 0.7GB）。如何突破这种限制呢？—— 多进程。因为每个进程都是一个新的 v8 实例，都有权利重新分配、调度资源。

## child_process

child_process 提供了创建子进程的方法

```js
var cp = require('child_process')
cp.spawn('node', ['worker.js'])
cp.exec('node worker.js', function (err, stdout, stderr) {
    // todo
})
cp.execFile('worker.js', function (err, stdout, stderr) {
    // todo
})
cp.fork('./worker.js')
```

进程之间的通讯，代码如下。跟前端WebWorker类似，使用on监听（此前讲过的自定义事件），使用send发送。

```js
// parent.js
var cp = require('child_process')
var n = cp.for('./sub.js')
n.on('message', function (m) {
    console.log('PARENT got message: ' + m)
})
n.send({hello: 'workd'})

// sub.js
process.on('message', function (m) {
    console.log('CHILD got message: ' + m)
})
process.send({foo: 'bar'})
```

## cluster

cluster 模块允许设立一个主进程和若干个 worker 进程，由主进程监控和协调 worker 进程的运行。worker 之间采用进程间通信交换消息，cluster模块内置一个负载均衡器，采用 Round-robin 算法协调各个 worker 进程之间的负载。运行时，所有新建立的链接都由主进程完成，然后主进程再把 TCP 连接分配给指定的 worker 进程。

```js
const cluster = require('cluster')
const os = require('os')
const http = require('http')

if (cluster.isMaster) {
    console.log('是主进程')
    const cpus = os.cpus() // cpu 信息
    const cpusLength = cpus.length  // cpu 核数
    for (let i = 0; i < cpusLength; i++) {
        // fork() 方法用于新建一个 worker 进程，上下文都复制主进程。只有主进程才能调用这个方法
        // 该方法返回一个 worker 对象。
        cluster.fork()
    }
} else {
    console.log('不是主进程')
    // 运行该 demo 之后，可以运行 top 命令看下 node 的进程数量
    // 如果电脑是 4 核 CPU ，会生成 4 个子进程，另外还有 1 个主进程，一共 5 个 node 进程
    // 其中， 4 个子进程受理 http-server
    http.createServer((req, res) => {
        res.writeHead(200)
        res.end('hello world')
    }).listen(8000)  // 注意，这里就不会有端口冲突的问题了！！！
}
```

维护进程健壮性，通过 Cluster 能监听到进程退出，然后自动重启，即自动容错，这就是进程守候。

```js
if (cluster.isMaster) {
    const num = os.cpus().length
    console.log('Master cluster setting up ' + num + ' workers...')
    for (let i = 0; i < num; i++) {
        // 按照 CPU 核数，创建 N 个子进程
        cluster.fork()
    }
    cluster.on('online', worker => {
        // 监听 workder 进程上线（启动）
        console.log('worker ' + worker.process.pid + ' is online')
    })
    cluster.on('exit', (worker, code, signal) => {
        // 兼容 workder 进程退出
        console.log('worker ' + worker.process.pid + ' exited with code: ' + code + ' and signal: ' + signal)
        // 退出一个，即可立即重启一个
        console.log('starting a new workder')
        cluster.fork()
    })
}
```

总要明白线程和进程的区别、联系，以及为何使用多进程，后面的 API 用法相对比较简单。




