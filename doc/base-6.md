# node.js 进程管理模块

NodeJS可以感知和控制自身进程的运行环境和状态，也可以创建子进程并与其协同工作，这使得NodeJS可以把多个程序组合在一起共同完成某项工作，并在其中充当胶水和调度器的作用。本章除了介绍与之相关的NodeJS内置模块外，还会重点介绍典型的使用场景。

## 开门红

我们已经知道了NodeJS自带的fs模块比较基础，把一个目录里的所有文件和子目录都拷贝到另一个目录里需要写不少代码。另外我们也知道，终端下的cp命令比较好用，一条cp -r source/* target命令就能搞定目录拷贝。那我们首先看看如何使用NodeJS调用终端命令来简化目录拷贝，示例代码如下：

```js
var child_process = require('child_process')
var util = require('util')

function copy(source, target, callback) {
  child_process.exec(
    util.format('cp -r %s/* %s', source, target),
    callback
  )
}

copy('a', 'b', (err) => {

})
```

从以上代码中可以看到，子进程是异步运行的，通过回调函数返回执行结果。

## API走马观花

我们先大致看看NodeJS提供了哪些和进程管理有关的API。这里并不逐一介绍每个API的使用方法，官方文档已经做得很好了。

### process

任何一个进程都有启动进程时使用的命令行参数，有标准输入标准输出，有运行权限，有运行环境和运行状态。在NodeJS中，可以通过process对象感知和控制NodeJS自身进程的方方面面。另外需要注意的是，process不是内置模块，而是一个全局对象，因此在任何地方都可以直接使用。

### child_process



