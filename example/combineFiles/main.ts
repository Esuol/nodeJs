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
