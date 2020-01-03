const express = require('express')
const superagent = require('superagent')
const charset = require('superagent-charset')
const cheerio = require('cheerio')

// 防止乱码
charset(superagent)
// 爬取的网络地址
const baseUrl = 'https://www.qqtn.com/'
// 服务
const app = express()
app.get('/index', (req, res) => {
  // 设置请求头
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
  // 类型 页码
  let type = req.query.type
  let page = req.query.page
  type = type || 'nvsheng'
  page = page || '1'

  let route = `tx/${type}tx_${page}.html`
  // 网页页面信息是gb2312，所以chaeset应该为.charset('gb2312')，一般网页则为utf-8,可以直接使用.charset('utf-8')
  superagent.get(baseUrl + route)
    .charset('gb2312')
    .end((err, sres) => {
      let items = []
      if(err) {
        console.log('ERR: ' + err)
        res.json({code: 400, msg: err, sets: items})
        return
      }
      let $ = cheerio.load(sres.text)
      $('div.g-main-bg ul.g-gxlist-imgbox li a').each((idx, element) => {
        let $element = $(element)
        let $subElement = $element.find('img')
        let thumbImgSrc = $subElement.attr('src')
        items.push({
          title: $element.attr('title'),
          href: $element.attr('href'),
          thumbSrc: thumbImgSrc
        })
      })
      res.json({ code: 200, msg: "", data: {
        url: baseUrl + route,
        items
      } });
    })
})

const server = app.listen(8081, () => {
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
})