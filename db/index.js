var mysql = require('mysql')
var pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'admin123',
  database: 'test'
})

module.exports = pool
