const cp = require('child_process')

const child1 = cp.fork('child.js')
const child2 = cp.fork('child.js')

const server = require('net').createServer()

server.listen(1337, () => {
  child1.send('server', server)
  child2.send('server', server)
  // close
  server.close()
})