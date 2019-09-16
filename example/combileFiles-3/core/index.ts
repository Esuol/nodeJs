const cp = require('child-process')

let worker: any;

function spawn(server: any, config: any) {
  worker = cp.spawn('node', [server, config])
  worker.on('exit', code => {
    if(code !== 0) {
      spawn(server, config)
    }
  })
}

function main(argv: string[]) {
  spawn('server.js', argv[0])
  process.on('SIGTERM', () => {
    worker.kill()
    process.exit(0)
  })
}

main(process.argv.slice(2))