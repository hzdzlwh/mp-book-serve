const Koa = require('koa')
const mongoose = require('mongoose')
const bodyParser = require('koa-bodyparser')
const dbConfig = require('./dbs/config')
const book = require('./dbs/interface/book')

const app = new Koa()


app.use(bodyParser({
  extendTypes: ['json', 'form', 'text']
}))

mongoose.connect(dbConfig.book, {
  useNewUrlParser: true
})
const con = mongoose.connection
con.on('error', console.error.bind(console, '连接数据库失败'))

app.use(book.routes()).use(book.allowedMethods())

app.listen(3101)