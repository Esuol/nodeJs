const tls = require('tls')
const fs = require('fs')

const options = {
  key: fs.readFileSync('./keys/client.key'),
  cert: fs.readFileSync('./keys/client.crt'),
  ca: [fs.readFileSync('./keys/ca.crt')]
}

const stream = tls.connect(8000, options, () => {
  console.log(
    'client connected',
    stream.authorized ? 'authorized' : 'unauthorized'
  )
  process.stdin.pipe(stream)
})

stream.setEncoding('utf8')
stream.on('data', (data) => {
  console.log('data')
})
stream.on('end', () => {
  server.close()
})