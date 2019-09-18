# node.js 使用 eventproxy 控制并发

## content

我们需要取出每个主题的第一条评论，这就要求我们对每个主题的链接发起请求，并用 cheerio 去取出其中的第一条评论。

CNode 目前每一页有 40 个主题，于是我们就需要发起 1 + 40 个请求，来达到我们这一课的目标。

用到三个库：superagent cheerio eventproxy

```js
var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
// url 模块是 Node.js 标准库里面的
// http://nodejs.org/api/url.html
var url = require('url');

var cnodeUrl = 'https://cnodejs.org/';

superagent.get(cnodeUrl)
  .end(function (err, res) {
    if (err) {
      return console.error(err);
    }
    var topicUrls = [];
    var $ = cheerio.load(res.text);
    // 获取首页所有的链接
    $('#topic_list .topic_title').each(function (idx, element) {
      var $element = $(element);
      // $element.attr('href') 本来的样子是 /topic/542acd7d5d28233425538b04
      // 我们用 url.resolve 来自动推断出完整 url，变成
      // https://cnodejs.org/topic/542acd7d5d28233425538b04 的形式
      // 具体请看 http://nodejs.org/api/url.html#url_url_resolve_from_to 的示例
      var href = url.resolve(cnodeUrl, $element.attr('href'));
      topicUrls.push(href);
    });

    console.log(topicUrls);
  });
```

用 js 写过异步的同学应该都知道，如果你要并发异步获取两三个地址的数据，并且要在获取到数据之后，对这些数据一起进行利用的话，常规的写法是自己维护一个计数器。

先定义一个 var count = 0，然后每次抓取成功以后，就 count++。如果你是要抓取三个源的数据，由于你根本不知道这些异步操作到底谁先完成，那么每次当抓取成功的时候，就判断一下 count === 3。当值为真时，使用另一个函数继续完成操作。

而 eventproxy 就起到了这个计数器的作用，它来帮你管理到底这些异步操作是否完成，完成之后，它会自动调用你提供的处理函数，并将抓取到的数据当参数传过来。

假设我们不使用 eventproxy 也不使用计数器时，抓取三个源的写法是这样的：

```js
// 参考 jquery 的 $.get 的方法
$.get("http://data1_source", function (data1) {
  // something
  $.get("http://data2_source", function (data2) {
    // something
    $.get("http://data3_source", function (data3) {
      // something
      var html = fuck(data1, data2, data3);
      render(html);
    });
  });
});
```

