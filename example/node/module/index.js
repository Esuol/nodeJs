function Module(id = "", parent) {
  // 模块 id,通常为模块的绝对路径
  this.id = id;
  this.path = path.dirname(id);
  this.exports = {};
  // 当前模块调用者
  this.parent = parent;
  updateChildren(parent, this, false);
  this.filename = null;
  // 模块是否加载完成
  this.loaded = false;
  // 当前模块所引用的模块
  this.children = [];
}

