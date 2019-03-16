const mongoose = require('mongoose')

let bookSchema = new mongoose.Schema({
  author: String,
  rate: String,
  title: String,
  alt: String,
  publisher: String,
  summary: String,
  price: String,
  tags: String,
  image: String,
  openid: String
})

module.exports = mongoose.model('Book', bookSchema)