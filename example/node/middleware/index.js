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