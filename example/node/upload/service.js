// npm install multer

// npm insatll md5

const express = require('express')

const router = express.Router()

const upload = require('./fileuploads')

// 文件上传服务
router.post('/upload', upload.signle('avvatar'), (req, res, next) => {
  if(req.file) {
    res.send('文件上传成功')
    console.log(req.file)
    console.log(req.body)
  }
})

module.exports = router