// @ts-nocheck
const db = require('../db/index')
// 用于加密密码
const bcrypt = require('bcryptjs')
// 用户生成token字符串
const jwt = require('jsonwebtoken')

const { jwtSecretKey, tokenExpire } = require('../config/index')
const { genImgUrl } = require('../utils/index')

exports.register = (req, res) => {
  const userinfo = req.body
  const searchSql = 'select * from ev_users where username=?'
  db.query(searchSql, userinfo.username, (err, result) => {
    if (err) return res.cc(1, err.message)
    if (result.length > 0) return res.cc(1, '当前用户名已存在！')
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)
    const insertSql = 'insert into ev_users set ?'
    db.query(insertSql, userinfo, (err, result) => {
      if (err) return res.cc(1, err.message)
      if (result.affectedRows !== 1) return res.cc(1, '注册失败，请稍后再试！')
      res.cc(0, '注册成功！')
    })
  })
}

exports.login = (req, res) => {
  const userinfo = req.body
  const sql = 'select * from ev_users where username=?'
  // res.cc(1, '数据库错误')
  db.query(sql, userinfo.username, (err, result) => {
    if (err) return res.cc(1, err.message)
    if (result.length !== 1) return res.cc(1, '该用户不存在！')
    if (!bcrypt.compareSync(userinfo.password, result[0].password))
      return res.cc(1, '密码错误')
    const tokenInfo = { ...result[0], passowrd: '', avatar: '' }
    const token = jwt.sign(tokenInfo, jwtSecretKey, {
      expiresIn: tokenExpire
    })
    res.cc(0, '登录成功！', {
      token: 'Bearer ' + token,
      tokenExpire: tokenExpire,
      user: {
        id: result[0].id,
        username: result[0].username,
        avatar: genImgUrl(result[0].avatar)
      }
    })
  })
}

exports.avatar = (req, res) => {
  res.cc(0, '更换头像成功！')
}
