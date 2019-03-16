const mongoose = require('mongoose')

let commentSchema = new mongoose.Schema({
  bookid: String,
  comment: String,
  openid: String
})

module.exports = mongoose.model('Comment', commentSchema)