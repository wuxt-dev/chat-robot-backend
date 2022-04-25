// @ts-nocheck
const http = require('http')

const baseUrl = 'http://api.qingyunke.com/api.php?key=free&appid=0&msg='

exports.getAnswer = url => {
  return new Promise((resolve, reject) => {
    http
      .get(url, res => {
        var datas = []
        res.on('data', data => {
          datas.push(data)
        })
        res.on('end', () => {
          resolve(JSON.parse(datas.toString()))
        })
      })
      .on('error', function (err) {
        reject(err)
      })
  })
}

exports.genUrl = msg => {
  return `${baseUrl}${msg}`
}
