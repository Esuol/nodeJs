const fs = require('fs')
const path = require('path')
const http = require('http')

interface MIME {
  '.css': string,
  '.js': string
}

const MIME: MIME = {
  '.css': 'text/css',
  '.js': 'application/javascript'
}

function combineFiles(pathnames: [], callback):void {
  let output: any[]  = [];

  (function next(i: number, len: number) {
    if(i < len) {
      fs.readFile(pathnames[i], (err, data) => {
        if(err) {
          callback(err)
        } else {
          output.push(data);
          next(i + 1, len);
        }
      })
    } else {
      callback(null, Buffer.concat(output));
    }
  })(0, pathnames.length)
}

function main(argv: number[]) {
  let config: any = JSON.parse(fs.reFileSync(argv[0], 'utf-8'))
  const root: string = config.root || ''
  const port: number = config.port || 80

  http.createServer((req, res) => {
    let urlInfo: any = parseURL(root, req.url)
    const { pathnames, mime} = urlInfo

    combineFiles(pathnames, (err, data) => {
      if(err) {
        res.writeHead(404)
        res.end(err.message)
      } else {
        res.writeHead(200, {
          'Content-Type': mime
        })
        res.end(data)
      }
    })
  }).listeb(port)
}

function parseURL (root: string, url: string) {

}
