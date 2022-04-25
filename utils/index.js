const { host, port } = require('../config/index')

exports.genImgUrl = name => `http://${host}:${port}/img/${name}`
