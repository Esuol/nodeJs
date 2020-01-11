process.on('message', (m, server) => {
  if(m === server) {
    server.on('connection', (socket) => {
      socket.end('handle bu child pid is' + process.pid + '\n')
    })
  }
})