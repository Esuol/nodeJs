const fork = require('child_process').fork
const cpus = require('os').cpus()

const server = require('net').createServer();
server.listen(3000)
process.title = 'node-master'

const workers: any = {}
const createWorker = () => {
  const worker = fork('worker.js')

  worker.on('message', (message: any) => {
    if(message.act === 'suicide') {
      createWorker()
    }
  })

  worker.on('exit', (code: any, signal: any) => {
    console.log('worker process exited, code: %s signal: %s', code, signal);
    delete workers[worker.pid];
  })

  worker.send('server', server);
  workers[worker.pid] = worker;
  console.log('worker process created, pid: %s ppid: %s', worker.pid, process.pid);

  for (let i=0; i<cpus.length; i++) {
    createWorker();
  }

  process.once('SIGINT', close.bind(globalThis, 'SIGINT')); // kill(2) Ctrl-C
  process.once('SIGQUIT', close.bind(globalThis, 'SIGQUIT')); // kill(3) Ctrl-\
  process.once('SIGTERM', close.bind(globalThis, 'SIGTERM')); // kill(15) default
  process.once('exit', close.bind(globalThis));

  function close (code: any) {
      console.log('进程退出！', code);

      if (code !== 0) {
          for (let pid in workers) {
              console.log('master process exited, kill worker pid: ', pid);
              workers[pid].kill('SIGINT');
          }
      }

      process.exit(0);
  }

}

export {}