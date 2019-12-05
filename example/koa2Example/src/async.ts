function getSyncTime () {
  return new Promise((
    resolve: (value?: unknown) => void,
    reject: (value?: unknown) => void,
  ) => {
    try {
      let startTime: number = new Date().getTime()
      setTimeout(() => {
        let endTime: number = new Date().getTime()
        let data: number = endTime - startTime
        resolve(data)
      }, 500)
    } catch (err) {
      reject(err)
    }
  })
}

async function getSyncData () {
  let time: unknown = await getSyncTime()
  let data: string = `endTime - startTime = ${time}`
  return data
}

async function getData () {
  let data: string = await getSyncData()
  console.log( data )
}

getData()