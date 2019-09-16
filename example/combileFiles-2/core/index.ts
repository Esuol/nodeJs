exports.parseURL = function parseURL (root: string, url: string):URL {
  let base: string;
  let pathnames: string[];
  let parts: string[];

  if(url.indexOf('??') === -1) {
    url = url.replace('/', '/??')
  }

  parts = url.split('??')
  base = parts[0]
  pathnames = parts[1].split(',').map(item => path.join(root, base, item))

  return {
    mime: MIME[path.extname(pathnames[0])] || 'text/plain',
    pathnames
  }
}

exports.outputFiles = function outputFiles (pathnames:string, writer) {
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

exports.validateFiles = function validateFiles (pathnames: string, callback) {
  (function next(i: number, len: number) {
    if(i < len) {
      fs.stat(pathnames[i], (err: any, stats: any) => {
        if (err) {
          callback(err)
        } else if(!stats.isFile()) {
          callback(new Error());
        } else {
          next(i + 1, len);
        }
      })
    } else {
      callback(null, pathnames);
    }
  })(0, pathnames.length)
}
