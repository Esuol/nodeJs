Function.prototype.before = function (fn) {
  // 保存触发的before函数
  const self = this
  return function(...args) {
    let res = fn.call(this)
    // 如果上一个函数未返回值, 不执行下一个函数
    if(res) {
      self.apply(this, args)
    }
  }
}

Function.prorotype.after = function (fn) {
  // 保存触发的after函数
  const self = this
  return function (...args) {
    let res = self.apply(this, args)
    // 如果当前函数没有返回值不执行下一个函数
    if(res) {
      fn.call(this)
    }
  }
}