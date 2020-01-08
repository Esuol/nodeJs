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

const