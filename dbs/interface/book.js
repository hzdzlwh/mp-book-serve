/*
 * @Author: lwh
 * @Date: 2019-02-18 17:31:28
 */
const router = require('koa-router')()
const fs = require('fs')
const path = require('path')
const User = require('../models/user')
const Book = require('../models/book')
const WxUser = require('../models/wxUser')
const Comment = require('../models/comment')
const axios = require('axios')

router.post('/addUser', async function (ctx) { // 此接口写数据添加user
  console.log(ctx)
  const user = new User({
    name: ctx.request.body.name,
    password: ctx.request.body.password
  })
  let code
  try {
    user.save()
    code = 0
  } catch(e) {
    code = -1
  }
  ctx.body = {
    code: code,
    success: true,
    message: '添加成功'
  }
})

router.get('/allUser', async function(ctx, next) { // 此接口从数据库查询数据
  const user = await User.find()
  const userName = user.map(u => {
    return { user: u.name, id: u._id }
  })
  console.log(userName)
  ctx.body = {
    code: 0,
    result: { user: userName }
  }
})

router.get('/allbooks', async function(ctx, next) {
  ctx.body = {
    id: 1,
    name: '边城',
    createDate: '2019-03-01 12:23:00',
    description: '极美'
  }
});

router.post('/onLogin', async function(ctx, next) {
  const code = ctx.request.body.code
  const userInfo = ctx.request.body.userInfo
  console.log(userInfo)
  try {
    var res = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=wx4dce5c62f3dff3ea&secret=b6fe896c956408d78cb562a70618b996&js_code=${code}&grant_type=authorization_code`)
  } catch(err) {
    console.log(err)
  }
  const wxUser = new WxUser({
    openid: res.data.openid,
    userInfo
  })
  try {
    wxUser.save()
  } catch(e) {
    console.log(e)
  }
  ctx.body = {
    code: 0,
    result: { openid: res.data.openid }
  }
});

router.get('/test', async (ctx, next) => {
  ctx.body = 'test'
})

router.post('/addbook', async function(ctx, next) {
  const isbn = ctx.request.body.isbn
  const openid = ctx.request.body.openid
  const res = await axios.get(`https://api.douban.com/v2/book/isbn/${isbn}`)
  /******************************************************************
    { rating: { max: 10, numRaters: 1957, average: '9.3', min: 0 },
      subtitle: '',
      author: [ '[美] Nicholas C. Zakas' ],
      pubdate: '2012-3-29',
      tags:
        [ { count: 2337, name: 'JavaScript', title: 'JavaScript' }],
      origin_title: 'Professional JavaScript for Web',
      image: 'https://img3.doubanio.com/view/subject/m/public/s8958650.jpg',
      binding: '平装',
      translator: [ '李松峰', '曹力' ],
      catalog: '',
      pages: '748',
      images:
        { small:
            'https://img3.doubanio.com/view/subject/s/public/s8958650.jpg',
          large:
            'https://img3.doubanio.com/view/subject/l/public/s8958650.jpg',
          medium:
            'https://img3.doubanio.com/view/subject/m/public/s8958650.jpg' },
      alt: 'https://book.douban.com/subject/10546125/',
      id: '10546125',
      publisher: '人民邮电出版社',
      isbn10: '7115275793',
      isbn13: '9787115275790',
      title: 'JavaScript高级程序设计（第3版）',
      url: 'https://api.douban.com/v2/book/10546125',
      alt_title: 'Professional JavaScript for Web',
      author_intro: '',
      summary: '',
      series: { id: '28503', title: '图灵程序设计丛书·Web开发系列' },
      price: '99.00元' }
  *****************************************************************************/
  const bookInfo = res.data
  const rate = bookInfo.rating.average
  const { title, image, alt, publisher, summary, price } = bookInfo
  const tags = bookInfo.tags.map(v => {
    return `${v.title} ${v.count}`
  }).join(',')
  const author = bookInfo.author.join(',')
  const book = new Book({
    author,
    rate,
    title,
    alt,
    publisher,
    summary,
    price,
    tags,
    image,
    openid
  })
  let code
  try {
    book.save()
    code = 0
  } catch(e) {
    code = -1
  }
  // if (bookInfo.title) {
  //   title = bookInfo.title
  // } else {
  //   title = '图书不存在'
  // }
  ctx.body = {
    code,
    result: {}
  }
})

router.get('/booklist', async (ctx, next) => {
  const page = ctx.request.query.page
  const pageSize = Number(ctx.request.query.pageSize)
  const booklist = await Book.find()
                              .skip(page * pageSize)
                              .limit(pageSize)
                              .sort({'_id':1})
  ctx.body = {
    code: 0,
    result: { booklist }
  }
})

router.get('/bookDetail', async (ctx, next) => {
  const id = ctx.request.query.id
  const where = { _id: id }
  const detail = await Book.find(where)
  ctx.body = {
    code: 0,
    result: { detail: detail[0] }
  }
})

router.post('/addComment', async (ctx, next) => {
  const comment = new Comment({
    bookid: ctx.request.body.bookid,
    openid: ctx.request.body.openid,
    comment: ctx.request.body.comment
  })
  try {
    comment.save()
  } catch (error) {
    console.log(error)
  }
  ctx.body = {
    code: 0
  }
})

router.get('/commentlist', async (ctx, next) => {
  const bookid = ctx.request.query.bookid
  const where = { bookid }
  const commentlist = await Comment.find(where)
  ctx.body = {
    code: 0,
    result: { commentlist }
  }
})

module.exports = router