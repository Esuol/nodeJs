# node.js 大示例

学习讲究的是学以致用和融会贯通。至此我们已经分别介绍了NodeJS的很多知识点，本章作为最后一章，将完整地介绍一个使用NodeJS开发Web服务器的示例。

## 需求

我们要开发的是一个简单的静态文件合并服务器，该服务器需要支持类似以下格式的JS或CSS文件合并请求。

```txt
http://assets.example.com/foo/??bar.js,baz.js
```

在以上URL中，??是一个分隔符，之前是需要合并的多个文件的URL的公共部分，之后是使用,分隔的差异部分。因此服务器处理这个URL时，返回的是以下两个文件按顺序合并后的内容。

```txt
/foo/bar.js
/foo/baz.js
```

另外，服务器也需要能支持类似以下格式的普通的JS或CSS文件请求。

```txt
http://assets.example.com/foo/bar.js
```

以上就是整个需求。

## 第一次迭代

快速迭代是一种不错的开发方式，因此我们在第一次迭代时先实现服务器的基本功能。

### 设计

简单分析了需求之后，我们大致会得到以下的设计方案。

```txt
           +---------+   +-----------+   +----------+
request -->|  parse  |-->|  combine  |-->|  output  |--> response
           +---------+   +-----------+   +----------+
```

也就是说，服务器会首先分析URL，得到请求的文件的路径和类型（MIME）。然后，服务器会读取请求的文件，并按顺序合并文件内容。最后，服务器返回响应，完成对一次请求的处理。

另外，服务器在读取文件时需要有个根目录，并且服务器监听的HTTP端口最好也不要写死在代码里，因此服务器需要是可配置的。

### 实现

根据以上设计，我们写出了第一版代码如下。

```js
var fs = require('fs'),
    path = require('path'),
    http = require('http');

var MIME = {
    '.css': 'text/css',
    '.js': 'application/javascript'
};

function combineFiles(pathnames, callback) {
    var output = [];

    (function next(i, len) {
        if (i < len) {
            fs.readFile(pathnames[i], function (err, data) {
                if (err) {
                    callback(err);
                } else {
                    output.push(data);
                    next(i + 1, len);
                }
            });
        } else {
            callback(null, Buffer.concat(output));
        }
    }(0, pathnames.length));
}

function main(argv) {
    var config = JSON.parse(fs.readFileSync(argv[0], 'utf-8')),
        root = config.root || '.',
        port = config.port || 80;

    http.createServer(function (request, response) {
        var urlInfo = parseURL(root, request.url);

        combineFiles(urlInfo.pathnames, function (err, data) {
            if (err) {
                response.writeHead(404);
                response.end(err.message);
            } else {
                response.writeHead(200, {
                    'Content-Type': urlInfo.mime
                });
                response.end(data);
            }
        });
    }).listen(port);
}

function parseURL(root, url) {
    var base, pathnames, parts;

    if (url.indexOf('??') === -1) {
        url = url.replace('/', '/??');
    }

    parts = url.split('??');
    base = parts[0];
    pathnames = parts[1].split(',').map(function (value) {
        return path.join(root, base, value);
    });

    return {
        mime: MIME[path.extname(pathnames[0])] || 'text/plain',
        pathnames: pathnames
    };
}

main(process.argv.slice(2));
```

### 以上代码完整实现了服务器所需的功能，并且有以下几点值得注意：

1. 使用命令行参数传递JSON配置文件路径，入口函数负责读取配置并创建服务器。

2. 入口函数完整描述了程序的运行逻辑，其中解析URL和合并文件的具体实现封装在其它两个函数里。

3. 解析URL时先将普通URL转换为了文件合并URL，使得两种URL的处理方式可以一致。

4. 合并文件时使用异步API读取文件，避免服务器因等待磁盘IO而发生阻塞。

## 第二次迭代

在第一次迭代之后，我们已经有了一个可工作的版本，满足了功能需求。接下来我们需要从性能的角度出发，看看代码还有哪些改进余地。

### 设计

把map方法换成for循环或许会更快一些，但第一版代码最大的性能问题存在于从读取文件到输出响应的过程当中。我们以处理/??a.js,b.js,c.js这个请求为例，看看整个处理过程中耗时在哪儿。

```txt
 发送请求       等待服务端响应         接收响应
---------+----------------------+------------->
         --                                        解析请求
           ------                                  读取a.js
                 ------                            读取b.js
                       ------                      读取c.js
                             --                    合并数据
                               --                  输出响应
```

可以看到，第一版代码依次把请求的文件读取到内存中之后，再合并数据和输出响应。这会导致以下两个问题：

1. 当请求的文件比较多比较大时，串行读取文件会比较耗时，从而拉长了服务端响应等待时间。

2. 由于每次响应输出的数据都需要先完整地缓存在内存里，当服务器请求并发数较大时，会有较大的内存开销。

对于第一个问题，很容易想到把读取文件的方式从串行改为并行。但是别这样做，因为对于机械磁盘而言，因为只有一个磁头，尝试并行读取文件只会造成磁头频繁抖动，反而降低IO效率。而对于固态硬盘，虽然的确存在多个并行IO通道，但是对于服务器并行处理的多个请求而言，硬盘已经在做并行IO了，对单个请求采用并行IO无异于拆东墙补西墙。因此，正确的做法不是改用并行IO，而是一边读取文件一边输出响应，把响应输出时机提前至读取第一个文件的时刻。这样调整后，整个请求处理过程变成下边这样。

```txt
发送请求 等待服务端响应 接收响应
---------+----+------------------------------->
         --                                        解析请求
           --                                      检查文件是否存在
             --                                    输出响应头
               ------                              读取和输出a.js
                     ------                        读取和输出b.js
                           ------                  读取和输出c.js
```

按上述方式解决第一个问题后，因为服务器不需要完整地缓存每个请求的输出数据了，第二个问题也迎刃而解。

### 实现

根据以上设计，第二版代码按以下方式调整了部分函数。

```javaScript
function main(argv) {
    var config = JSON.parse(fs.readFileSync(argv[0], 'utf-8')),
        root = config.root || '.',
        port = config.port || 80;

    http.createServer(function (request, response) {
        var urlInfo = parseURL(root, request.url);

        validateFiles(urlInfo.pathnames, function (err, pathnames) {
            if (err) {
                response.writeHead(404);
                response.end(err.message);
            } else {
                response.writeHead(200, {
                    'Content-Type': urlInfo.mime
                });
                outputFiles(pathnames, response);
            }
        });
    }).listen(port);
}

function outputFiles(pathnames, writer) {
    (function next(i, len) {
        if (i < len) {
            var reader = fs.createReadStream(pathnames[i]);

            reader.pipe(writer, { end: false });
            reader.on('end', function() {
                next(i + 1, len);
            });
        } else {
            writer.end();
        }
    }(0, pathnames.length));
}

function validateFiles(pathnames, callback) {
    (function next(i, len) {
        if (i < len) {
            fs.stat(pathnames[i], function (err, stats) {
                if (err) {
                    callback(err);
                } else if (!stats.isFile()) {
                    callback(new Error());
                } else {
                    next(i + 1, len);
                }
            });
        } else {
            callback(null, pathnames);
        }
    }(0, pathnames.length));
}
```

可以看到，第二版代码在检查了请求的所有文件是否有效之后，立即就输出了响应头，并接着一边按顺序读取文件一边输出响应内容。并且，在读取文件时，第二版代码直接使用了只读数据流来简化代码。

## 第三次迭代

第二次迭代之后，服务器本身的功能和性能已经得到了初步满足。接下来我们需要从稳定性的角度重新审视一下代码，看看还需要做些什么。

设计

从工程角度上讲，没有绝对可靠的系统。即使第二次迭代的代码经过反复检查后能确保没有bug，也很难说是否会因为NodeJS本身，或者是操作系统本身，甚至是硬件本身导致我们的服务器程序在某一天挂掉。因此一般生产环境下的服务器程序都配有一个守护进程，在服务挂掉的时候立即重启服务。一般守护进程的代码会远比服务进程的代码简单，从概率上可以保证守护进程更难挂掉。如果再做得严谨一些，甚至守护进程自身可以在自己挂掉时重启自己，从而实现双保险。

因此在本次迭代时，我们先利用NodeJS的进程管理机制，将守护进程作为父进程，将服务器程序作为子进程，并让父进程监控子进程的运行状态，在其异常退出时重启子进程。

实现

根据以上设计，我们编写了守护进程需要的代码。

```js
var cp = require('child_process');

var worker;

function spawn(server, config) {
    worker = cp.spawn('node', [ server, config ]);
    worker.on('exit', function (code) {
        if (code !== 0) {
            spawn(server, config);
        }
    });
}

function main(argv) {
    spawn('server.js', argv[0]);
    process.on('SIGTERM', function () {
        worker.kill();
        process.exit(0);
    });
}

main(process.argv.slice(2));
```

此外，服务器代码本身的入口函数也要做以下调整。