const tls = require('tls')
const fs = require('fs')

const options = {
  key: fs.readFileSync('./keys/server.key'),
  cert: fs.readFileSync('./keys/cserver.cert'),
  requestCert: true,
  ca: [ fs.readFileSync('./keys/ca.crt')]
}

const server = tls.createServer(options, (stream) => {
  console.log('server onneted', stream.authorized ? 'authorized' : 'unauthorized')
  stream.write('welcone\n')
  stream.setEncoding('utf8')
  stream.pipe(stream)
})

server.listen('8000', () => {
  console.log('server bound')
})