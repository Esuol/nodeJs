export {}

const http = require('http')
const express = require('express')
const app = express()

// app.get('/', (req: any, res: any) => {
//   res.writeHead(200, {
//     'Content-type': 'text/plan'
//   })
//   res.end('I am worker, pid: ' + process.pid + ', ppid: ' + process.ppid)
//   throw new Error('worker process exception!') // 测试异常进程退出、重启
// })

const server = http.createServer((req: any, res: any) => {
  res.writeHead(200, {
    'Content-type': 'text/plan'
  })
  res.end('I am worker, pid: ' + process.pid + ', ppid: ' + process.ppid)
  throw new Error('worker process exception!') // 测试异常进程退出、重启
})

let worker: { on: (arg0: string, arg1: (socket: any) => void) => void; }

process.title = 'node-worker'
process.on('message', (message: any, sendHandle: any) => {
  if(message === 'server') {
    worker = sendHandle
    worker.on('connection', (socket: any) =>  {
      server.emit('connection', socket)
    })
  }
})

process.on('uncaughtException',  (err) => {
	console.log(err);
	(<any>process).send({act: 'suicide'});
	(<any>worker).close(() => {
		process.exit(1);
	})
})

