const joi = require('joi')

const username = joi.string().alphanum().min(1).max(8).required()
const password = joi
  .string()
  .pattern(/^[\S]{6,12}$/)
  .required()
const userId = joi.required()
exports.reg_login_schema = {
  body: {
    username,
    password
  }
}
exports.user_id_schema = {
  query: {
    userId
  }
}
exports.add_friend_schema = {
  body: {
    userId,
    friendId: userId
  }
}
