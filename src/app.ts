import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import { json } from 'body-parser'
import ejsMate from 'ejs-mate'
import dotenv from 'dotenv'
import methodOverride from 'method-override'

import { connectToDB } from './db'
import ExpressError from './utils/ExpressError'
import campgroundRoute from './routes/campgrounds'
import reviewRoute from './routes/reviews'

dotenv.config()

const app = express()

// 設置 middleware
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../src/views'))

app.use(json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, '../src/public')))

// 設置路由
app.get('/', (req, res) => {
  res.render('home')
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
