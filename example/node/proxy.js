const http = require('http')

let proxy = http.createServer((request, response) => {
  // 参数
  const options = {
    host: '这里放代理服务器的ip或者域名',
    port: '这里放代理服务器的端口号',
    method: 'POST', // 发送的方法
    path: 'https://www.google.com', // 访问的路径
    headers: {
      // 如果代理服务器需要认证
      'Proxy-Authentication': 'Base ' + new Buffer('user:password').toString('base64') // 替换为代理服务器用户名和密码
    }
  }

  let req = http.request(options, (req, res) => {
    res.pipe(response)
    console.log(req.url)
  }).end()
}).listen(8080)

module.exports = proxy