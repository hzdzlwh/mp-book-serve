const mongoose = require('mongoose')

let wxuserSchema = new mongoose.Schema({
  openid: String,
  userInfo: Object
})

module.exports = mongoose.model('WxUser', wxuserSchema)