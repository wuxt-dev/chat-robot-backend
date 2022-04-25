const express = require('express')
const expressJoi = require('@escook/express-joi')
const { user_id_schema, add_friend_schema } = require('../schema/user')
const { getFriend, addFriend, searchUser } = require('../routerHandler/friend')

const router = express.Router()

router.get('/', expressJoi(user_id_schema), getFriend)
router.get('/search', searchUser)
router.post('/add', expressJoi(add_friend_schema), addFriend)

module.exports = router
