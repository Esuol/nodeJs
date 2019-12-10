const fs = require('fs')
const mimes = require('./mimes')
/**
 * 遍历读取目录内容（子目录，文件名）
 * @param  {string} reqPath 请求资源的绝对路径
 * @return {array} 目录内容列表
 */

 function walk(reqPath: string) {
   let files = fs.readdirSync(reqPath)
 }

export {}