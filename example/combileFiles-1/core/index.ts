interface URL {
  mime: string,
  pathnames: string[]
}

exports.combineFiles = function combineFiles(pathnames: string[], callback):void {
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
