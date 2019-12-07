import { Context } from "vm"

// post 请求参数获取

// 对于POST请求的处理，koa2没有封装获取参数的方法，需要通过解析上下文context中的原生node.js请求对象req，将POST表单数据解析成query string（例如：a=1&b=2&c=3），再将query string 解析成JSON格式（例如：{"a":"1", "b":"2", "c":"3"}）

// 注意：ctx.request是context经过封装的请求对象，ctx.req是context提供的node.js原生HTTP请求对象，同理ctx.response是context经过封装的响应对象，ctx.res是context提供的node.js原生HTTP响应对象。

// 解析出POST请求上下文中的表单数据

// // 解析上下文里node原生请求的POST参数

// Examaple

const Koa = require('koa')
const app = new Koa()

app.use(async(ctx: Context) => {
  if(ctx.url === '/' && ctx.method === 'GET') {
     // 当GET请求时候返回表单页面
     let html = `
      <h1>koa2 request post demo</h1>
      <form method="POST" action="/">
        <p>userName</p>
        <input name="userName" /><br/>
        <p>nickName</p>
        <input name="nickName" /><br/>
        <p>email</p>
        <input name="email" /><br/>
        <button type="submit">submit</button>
      </form>
    `
   ctx.body = html
  } else if(ctx.url === '/' && ctx.method === 'POST') {
      // 当POST请求的时候，解析POST表单里的数据，并显示出来
      let postData = await parsePostData(ctx)
      ctx.body = postData
  } else {
    // 其他请求显示404
    ctx.body = '<h1>404！！！ o(╯□╰)o</h1>'
  }
})

// 解析上下文里node原生请求的POST参数
function parsePostData( ctx: Context ) {
  return new Promise((resolve, reject) => {
    try {
      let postdata = "";
      ctx.req.addListener('data', (data: any) => {
        postdata += data
      })
      ctx.req.addListener("end",function(){
        let parseData = parseQueryStr( postdata )
        resolve( parseData )
      })
    } catch ( err ) {
      reject(err)
    }
  })
}

// 将POST请求参数字符串解析成JSON
function parseQueryStr( queryStr: any ) {
  let queryData: any = {}
  let queryStrList = queryStr.split('&')
  console.log( queryStrList )

  queryStrList.map((queryItem: any) => {
    let itemList = queryItem.split('=')
    queryData[ itemList[0] ] = decodeURIComponent(itemList[1])
    console.log(queryData)
  })

  return queryData
}

app.listen(3000, () => {
  console.log('[demo] request post is starting at port 3000')
})
