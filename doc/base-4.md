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



