# Stream && Buffer

## 为何要“一点一点”的？

你去视频网站看电影，去下载比较大的软件安装包，或者上传电影、软件包到云盘，这些文件都是动辄几个 G 大小，对吧？然而，我们的内存、网络、硬盘读写都是有速度或者大小的限制的，不可能随便的“生吞活剥”任何大文件，于是不得不“一点一点”的。

就像我们吃东西。我们牙齿的咀嚼食物的速度是有限制的，食道和食管也是有限制的，这种情况下，我们吃任何大小的东西，都得“一点一点”的来，无论是大馒头还是小包子。

专业一点说：一次性读取、操作大文件，内存和网络是“吃不消”的。

## 如何才能“一点一点”的？

```js
req.on('data', function (chunk) {
    // “一点一点”接收内容
    data += chunk.toString()
})
req.on('end', function () {

})
```

如上代码，我们已经知道了on是监听事件的触发，分别监听data和end两个事件。顾名思义，data就是有数据传递过来的事件，end就是结束的事件。那就可以通过这段代码回答这个问题。

如何做到“一点一点”的？—— 有数据传递过来就触发data事件，接收到这段数据，暂存下来，最后待数据全部传递完了触发end事件。为何要在上一节先把事件机制给讲了？因为这儿就是一句事件机制才能实现。

## stream

上面说的这种“一点一点”的操作方式，就是“流”，Stream 。它并不是 nodejs 独有的，而是系统级别的，linux 命令的|就是 Stream ，因此所有 server 端语言都应该实现 Stream 的 API 。

我们用桶和水来做比喻还算比较恰当（其实计算机中的概念，都是数学概念，都是抽象的，都无法完全用现实事务做比喻），如下图。数据从原来的 source 流向 dest ，要向水一样，慢慢的一点一点的通过一个管道流过去。

上图是一个完整的流程，对于流的操作，不一定非得必须完整。如上文的代码，我们仅仅实现了 source 的出口部分，管道和 dest 都没有实现。即，我们通过data和end事件能监听数据的流出或者来源，然后拿到流出的数据我们做了其他处理。

### 从哪里来

上文和上图都说，数据从一个地方“流”向另一个地方，那先看看数据的来源。大家先想一下，作为一个 server 端的程序，我们一般能从哪些地方能接受到数据，或者数据能从哪些地方“流”出来？（我想了一下，就想到下面三个常用的，如果有其他的后面再补充吧）

http 请求，上文代码的req

控制台，标准输入 stdin

文件，读取文件内容

其实，所有的数据来源，都可以用 Stream 来实现。下面挨个看一下，体会一下 Stream 是怎么参与进来的：

#### http req

再次回顾上文代码，看 Stream 是如何“一点一点”获取 req 数据的

```js
req.on('data', function(chunk) {
  //  “一点一点”接收内容
  data += chunk.toString()
})

req.on('end', function() {

})
```

#### 控制台输入

nodejs 作为 web server ，基本不会用到控制台输入的功能，但是为了验证 Stream 的使用，这里就简单弄个 demo 演示一下：

```js
process.stdin.on('data', function(chunk) {
   console.log(chunk.toString())
})
```

自己去运行一下看看结果，每输入一行就会输出相同内容。这就证明每次输入之后，都会触发data事件，用到了 Stream 。

#### 读取文件

为何使用 Stream 的道理，上文讲的很清楚了，因此在读取文件中就直接使用了，不再解释。

```js
const fs = require('fs')
const readStream = fs.createReadStream('./file.txt')

var length = 0
readStream.on('data', function (chunk) {
    length += chunk.toString().length
})
readStream.on('end', function () {
    console.log(length)
})
```

如上代码，要用 Stream 那就肯定不能直接使用fs.readFile了，而是使用fs.createReadStream 。它返回的是一个 Stream 对象，通过监听其data和end来处理相关操作。

##### Readable Stream

以上提到的所有能产出数据的 Stream 对象，都叫做 Readable Stream ，即可以从中读取数据的 Stream 对象。Readable Stream 对象可以监听data end事件，还有一个pipe API（下文会重点介绍）。你可以通过 构造函数 来实现一个自定义的 Readable Stream （上文三个也不过是继承、实现了这个构造函数而已）。不过一般情况下，我们无需这么做，因此这里了解一下即可。