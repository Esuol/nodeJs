// 在 Node 模块系统中，每个文件都被视为一个独立的模块。模块被加载时，都会初始化为 Module 对象的实例

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

// 每一个模块都对外暴露自己的 exports 属性作为使用接口。

// 也可将需要导出的变量或函数挂载到 exports 对象的属性上

// require
Module.prototype.require = function(id) {
  // ...
  requireDepth++
  try {
    return Module._load(id, this, false) // 加载模块
  } finally {
    requireDepth--
  }
}

// _load 函数 实现node加载模块的主要逻辑
Module._load = function(request, parent, isMain) {
  // 步骤一：解析出模块的全路径
  const filename = Module._resolveFilename(request, parent, isMain)

  // 步骤二：加载模块，具体分三种情况处理
  // 情况一：存在缓存的模块，直接返回模块的 exports 属性
  const cacheModule = Module._cache[filename]
  if(cacheModule !== undefined) {
    return cacheModule.exports
  }
  // 情况二：加载内建模块
  const mod = loadNativeModule(filename, request)
  if(mod && mod.canBeRequireByUsers) return mod.exports
  // 情况三：构建模块加载
  const module = new Module(filename, parent)
  // 加载过之后就进行模块实例缓存
  Module._cache[filename] = module

  // 步骤三：加载模块文件
  module.load(filename)

  // 步骤四：返回导出对象
  return module.exports
}

// 解析文件名称
Module._resolveFilename = function(request, parent, isMain, options) {
  if(NativeModule.canBeRequireByUsers(request)) {
    // 优先加载内建模块
    return request
  }
  let paths

  // node require.resolve 函数使用的 options，options.paths 用于指定查找路径
  if(typeof options === 'object' && options !== null) {
    if(ArrayIsArray(options.paths)) {
      const isRelative =
        request.startsWith('./') ||
        request.startsWith('../') ||
        (isWindows && request.startsWith('.\\')) ||
        request.startsWith('..\\')
        if(isRelative) {
          paths = options.paths
        } else {
          const fakeParent = new Module("", null);
          paths = [];
          for (let i = 0; i < options.paths.length; i++) {
            const path = options.paths[i];
            fakeParent.paths = Module._nodeModulePaths(path);
            const lookupPaths = Module._resolveLookupPaths(request, fakeParent);
            for (let j = 0; j < lookupPaths.length; j++) {
              if (!paths.includes(lookupPaths[j])) paths.push(lookupPaths[j]);
            }
          }
        }
    } else if(options.paths === undefined) {
      paths === Module._resolveLookupPaths(request, parent)
    } else {
      // .....
    }
  } else {
    // 查找模块存在路径
    paths = Module._resolveLookupPaths(request, parent);
  }

  // 依据给出的模块和遍历地址数组，以及是否为入口模块来查找模块路径
}

