app.use = function(path) {
  let handle
  if(typeof path === 'string') {
    handle = {
       // 第一个参数作为路径
      path: pathRegexp(path),
      // 其他都是处理单元
      stack: Array.prototype.slice.call(arguments, 1)
      }
    } else {
      handle = {
        // 第一个参数作为路径
        path: pathRegexp('/'),
        // 其他都是处理单元
        stack: Array.prototype.slice.call(arguments, 0)
      }
  }
  routes.all.push(handle)
}

const match = function(pathname, routes) {
  let stacks = []
  for(let i =  0; i< routes.length; i++) {
    let route = routes[i]
    // 正则匹配
    let reg = route.path.regexp
    let matched = reg.exec(pathname)
    if(matched)  {
      // 抽取具体值
      // 代码省略
      // 将中间件保存起来
      stacks = stacks.concat(route.stack)
    }
    return stacks
  }
}

// 持续改进分发过程

const distribution = function(req, res) {
  let pathname =  url.parse(req.url).pathname
  // 将请求方法变为小写
  let method = req.method.toLowerCase()
  // 获取all里面的中间件
  let stacks = match(pathname, routes.all)
  if(routes.hasOwnProperty(method)) {
    // 根据请求方法分发，获取相关中间件
    stacks.concat(match(pathname, routes[method]))
  }
  if(stacks.length) {
    handle(req, res, stacks)
  }else {
    // 处理404请求
    handle(req, res)
  }
}