const db = require('../db/index')
const { genImgUrl } = require('../utils/index')

exports.getFriend = (req, res) => {
  // 查询好友id
  const sql =
    'select friend_id as friend from ev_friend where user_id = ? union select user_id as friend from ev_friend where friend_id = ?'
  db.query(sql, [req.query.userId, req.query.userId], (err, results) => {
    if (err) return res.cc(1, err.message)
    let friendList = [
      {
        id: 0,
        username: 'Chat Bot',
        avatar: ''
      }
    ]
    const idList = results.map(value => {
      return value.friend
    })
    // 如果存在好友，则查询好友的详细信息
    if (idList) {
      const sql = `select id,username,avatar from ev_users where id in (${idList})`
      db.query(sql, (err, result) => {
        if (err) res.cc(1, err.message)
        if (result.length) {
          friendList.push(...result)
          friendList = friendList.map(friend => {
            if (friend.avatar) friend.avatar = genImgUrl(friend.avatar)
            return { ...friend }
          })
        }
        res.cc(0, '', { friendList })
      })
    }
  })
}

exports.searchUser = (req, res) => {
  const { userId, username } = req.query
  let sql
  let param
  if (userId) {
    param = parseInt(userId)
    sql = 'select id,username,avatar from ev_users where id=?'
  } else {
    param = username
    sql = 'select id,username,avatar from ev_users where username=?'
  }
  db.query(sql, param, (err, result) => {
    if (err) return res.cc(1, err.message)
    if (result.length === 0) res.cc(1, '该用户不存在~')
    if (result.length > 1) res.cc(1, '获取用户失败，请稍后再试！')
    res.cc(0, '', {
      ...result[0],
      avatar: result[0].avatar ? genImgUrl(result[0].avatar) : ''
    })
  })
}

exports.addFriend = (req, res) => {
  const { userId, friendId } = req.body
  const sql =
    'select friend_id as id from ev_friend where user_id = ? union select user_id as id from ev_friend where friend_id = ?'
  db.query(sql, [userId, userId], (err, results) => {
    if (err) return res.cc(1, err.message)
    const isFriends = results.some(friend => friend.id == friendId)
    if (isFriends) return res.cc(1, '你们已经是好友了!')
    const sql = `insert into ev_friend set ?`
    db.query(sql, { user_id: userId, friend_id: friendId }, (err, result) => {
      if (err) return res.cc(1, err.message)
      if (result.affectedRows !== 1)
        return res.cc(1, '添加好友失败，请稍后再试！')
      res.cc(0, '添加成功！')
    })
  })
}
