// @ts-nocheck
const express = require('express')
const { resolve } = require('path')
const expressJoi = require('@escook/express-joi')
const multer = require('multer')
const { reg_login_schema } = require('../schema/user')
const { login, register, avatar } = require('../routerHandler/user')

const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resolve(__dirname, '../public/img'))
  },
  filename: function (req, file, cb) {
    cb(null, req.params.user + '.jpg')
  }
})
const upload = multer({ storage })

router.post('/register', expressJoi(reg_login_schema), register)
router.post('/login', expressJoi(reg_login_schema), login)
router.post('/avatar/:user', upload.single('avatar'), avatar)

module.exports = router
