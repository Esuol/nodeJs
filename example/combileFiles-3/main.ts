function main(argv: string[]) {
  const config: any = JSON.parse(fs.readFileSync(argv[0], 'utf-8'))
  const root: string = config.root || '.'
  const port: number = config.port || 80
  let server: any

  server = http.createServer((req, res) => {

  }).listen(port)

  process.on('SIGTERM', () => {
    server.close(() => {
      process.exit(0)
    })
  })

}