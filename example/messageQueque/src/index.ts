const productFunc = require('./core/product')
const consumerFunc = require('./core/consumer')

async function run () {
  await productFunc()
  consumerFunc()
}

run()