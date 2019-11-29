const express = require('express')
const numCPUS = require('os').cpus().length
const cluster = require('cluster')

const app = express()
if(cluster.isMaster) {
  console.log('Master proces id is',process.pid);
  console.log(numCPUS)

  // fork wokers
  for(let i = 0; i < numCPUS; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker: any, code: any, signal: any) => {
    console.log('worker process died,id',worker.process.pid)
  })
} else {
   // Worker可以共享同一个TCP连接
   // 这里是一个http服务器
   app.get('/', (req: any, res: any) => {
     res.writeHead(200)
     res.end('hello world')
   })

   app.listen(8000)
}

export {}