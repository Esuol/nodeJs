const fs = require('fs')
const http = require('http')

function main(argv: string[]):void {
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
        outputFiles(pathnames, response);
      }
    })
  }).listen(port)
}

function validateFiles (pathnames:string, writer) {
  (function next(i: number, len: number) {
   if(i < len) {
    var reader: any = fs.createReadStream(pathnames[i]);

    reader.pipe(writer, {end: false})
    reader.on('end', function() {
      next(i + 1, len);
    });
   } else {
    writer.end();
   }
  })(0, pathnames.length)
}

function outputFiles (pathnames: string, res: any) {

}



export {}