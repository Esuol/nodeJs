const fs = require('fs')
const http = require('http')
const parseURL = require('./core')
const outputFiles = require('./core')
const validateFiles = require('./core')

module.exports = function main(argv: string[]):void {
  const config: any = JSON.parse(fs.readFileSync(argv[0], 'utf8'))
  let root: string = config.root || '.'
  let port: number = config.port || 80

  http.createServe((req: any, res: any) => {
    let urlInfo = parseURL(root, req.url)

    validateFiles(urlInfo.pathnames, (err, pathnames) => {
      if(err) {
        res.writeHead(404)
        res.end(err.message)
      } else {
        res.writeHead(200, {
          'Content-Type': urlInfo.mime
        })
        outputFiles(pathnames, res);
      }
    })
  }).listen(port)
}


export {}