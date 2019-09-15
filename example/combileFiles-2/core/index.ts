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
