import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import { json } from 'body-parser'
import ejsMate from 'ejs-mate'
import dotenv from 'dotenv'
import methodOverride from 'method-override'
import expressSession from 'express-session'
import flash from 'connect-flash'

import { connectToDB } from './db'
import ExpressError from './utils/ExpressError'
import campgroundRoute from './routes/campgrounds'
import reviewRoute from './routes/reviews'

dotenv.config()

const app = express()

const sevenDays = 1000 * 60 * 60 * 24 * 7
const sessionConfig = {
  secret: 'password',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: new Date(Date.now() + sevenDays),
    maxAge: sevenDays,
  },
}

// 設置 middleware
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../src/views'))

app.use(json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, '../src/public')))
app.use(expressSession(sessionConfig))
app.use(flash())

// 設置路由
app.get('/', (req, res) => {
  res.render('home')
})

app.use((req, res, next) => {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})
app.use('/campgrounds', campgroundRoute)
app.use('/campgrounds/:id/reviews', reviewRoute)

app.all('*', (req, res, next) => {
  next(new ExpressError('沒有相關頁面', 404))
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // express 會把有四個參數的 function視作錯誤處理中介
  const { statusCode = 500 } = err
  if (!err.message) {
    err.message = '出現錯誤了 🐛'
  }
  res.status(statusCode).render('error', { err })
})

app.listen(process.env.PORT, () => {
  connectToDB()
  console.log(`listening on port ${process.env.PORT}`)
})
