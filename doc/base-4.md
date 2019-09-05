# node.js 文件操作

让前端觉得如获神器的不是NodeJS能做网络编程，而是NodeJS能够操作文件。小至文件查找，大至代码编译，几乎没有一个前端工具不操作文件。换个角度讲，几乎也只需要一些数据处理逻辑，再加上一些文件操作，就能够编写出大多数前端工具。本章将介绍与之相关的NodeJS内置模块。

## 开门红

NodeJS提供了基本的文件操作API，但是像文件拷贝这种高级功能就没有提供，因此我们先拿文件拷贝程序练手。与copy命令类似，我们的程序需要能接受源文件路径与目标文件路径两个参数。

### 小文件拷贝

我们使用NodeJS内置的fs模块简单实现这个程序如下。

```js
const fs = require('fs')

function copy (src, dst) {
  fs.writeFileSync(dst, fs.readFileSync(src))
}

function main (argv) {
  copy(argv[0], argv[1])
}

main(process.argv.slice(2))
```

以上程序使用fs.readFileSync从源路径读取文件内容，并使用fs.writeFileSync将文件内容写入目标路径。

豆知识： process是一个全局变量，《可通过process.argv获得命令行参》《由于argv[0]固定等于NodeJS执行程序的绝对路径》，《argv[1]固定等于主模块的绝对路径》，因此第一个命令行参数从argv[2]这个位置开始。

### 大文件拷贝

上边的程序拷贝一些小文件没啥问题，但这种一次性把所有文件内容都读取到内存中后再一次性写入磁盘的方式不适合拷贝大文件，内存会爆仓。对于大文件，我们只能读一点写一点，直到完成拷贝。因此上边的程序需要改造如下。

```js
const fs = require('fs')

function copy(src, dst) {
  fs.createReadStream(src).pipe(fs.createWriteStream(dst))
}

function main (argv) {
  copy(aegv[0], argv[1])
}

main(process.argv.slice(2))
```

以上程序使用fs.createReadStream创建了一个源文件的只读数据流，并使用fs.createWriteStream创建了一个目标文件的只写数据流，并且用pipe方法把两个数据流连接了起来。连接起来后发生的事情，说得抽象点的话，水顺着水管从一个桶流到了另一个桶。

### API走马观花

我们先大致看看NodeJS提供了哪些和文件操作有关的API。这里并不逐一介绍每个API的使用方法，官方文档已经做得很好了。

JS语言自身只有字符串数据类型，没有二进制数据类型，因此NodeJS提供了一个与String对等的全局构造函数Buffer来提供对二进制数据的操作。除了可以读取文件得到Buffer的实例外，还能够直接构造，例如：

```js
var bin = new Buffer([ 0x68, 0x65, 0x6c, 0x6c, 0x6f ]);
```

Buffer与字符串类似，除了可以用.length属性得到字节长度外，还可以用[index]方式读取指定位置的字节，例如：

```js
bin[0]; // => 0x68;
```

Buffer与字符串能够互相转化，例如可以使用指定编码将二进制数据转化为字符串：

```js
var str = bin.toString('utf-8'); // => "hello"
```

或者反过来，将字符串转换为指定编码下的二进制数据：

```js
var bin = new Buffer('hello', 'utf-8'); // => <Buffer 68 65 6c 6c 6f>
```

Buffer与字符串有一个重要区别。字符串是只读的，并且对字符串的任何修改得到的都是一个新字符串，原字符串保持不变。至于Buffer，更像是可以做指针操作的C语言数组。例如，可以用[index]方式直接修改某个位置的字节。

```js
bin[0] = 0x48;
```

而.slice方法也不是返回一个新的Buffer，而更像是返回了指向原Buffer中间的某个位置的指针，如下所示。

```js
[ 0x68, 0x65, 0x6c, 0x6c, 0x6f ]
    ^           ^
    |           |
   bin     bin.slice(2)
```

因此对.slice方法返回的Buffer的修改会作用于原Buffer，例如：

```js
var bin = new Buffer([ 0x68, 0x65, 0x6c, 0x6c, 0x6f ]);
var sub = bin.slice(2);

sub[0] = 0x65;
console.log(bin); // => <Buffer 68 65 65 6c 6f>
```

也因此，如果想要拷贝一份Buffer，得首先创建一个新的Buffer，并通过.copy方法把原Buffer中的数据复制过去。这个类似于申请一块新的内存，并把已有内存中的数据复制过去。以下是一个例子。

```js
var bin = new Buffer([ 0x68, 0x65, 0x6c, 0x6c, 0x6f ]);

var dup = new Buffer(bin.length)

bin.copy(dup)
dup[0] = 0x48
console.log(bin); // => <Buffer 68 65 6c 6c 6f>
console.log(dup); // => <Buffer 48 65 65 6c 6f>
```

总之，Buffer将JS的数据处理能力从字符串扩展到了任意二进制数据。

## Stream

当内存中无法一次装下需要处理的数据时，或者一边读取一边处理更加高效时，我们就需要用到数据流。NodeJS中通过各种Stream来提供对数据流的操作。

以上边的大文件拷贝程序为例，我们可以为数据来源创建一个只读数据流，示例如下：

```js
var rs = fs.createReadStream(pathname)

rs.on('data', (chunk) => {
  dosomething(chunk)
})

rs.on('end', () => {
  cleanUp()
})
```

豆知识： Stream基于事件机制工作，所有Stream的实例都继承于NodeJS提供的EventEmitter。

上边的代码中data事件会源源不断地被触发，不管doSomething函数是否处理得过来。代码可以继续做如下改造，以解决这个问题。

```js
var rs = fs.createReadStream(src)

rs.on('data', (chunk) => {
  rs.pause()
  dosomething(chunk, () => {
    re.resume()
  })
})

rs.on('end', () => {
  cleanUp()
})
```

以上代码给doSomething函数加上了回调，因此我们可以在处理数据前暂停数据读取，并在处理数据后继续读取数据。

此外，我们也可以为数据目标创建一个只写数据流，示例如下：









