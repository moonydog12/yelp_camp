import express from 'express'
import path from 'path'
import { json } from 'body-parser'
import ejsMate from 'ejs-mate'
import methodOverride from 'method-override'
import expressSession from 'express-session'
import flash from 'connect-flash'
import passport from 'passport'

import { SESSION_OPTION } from './config'
import ExpressError from './utils/ExpressError'
import errorHandler from './middlewares/errorhandler'
import setFlash from './middlewares/setFlash'
import campgroundRoutes from './routes/campgrounds'
import reviewRoutes from './routes/reviews'
import userRoutes from './routes/users'

// 設置 middleware
const app = express()
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../src/views'))

app.use(json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, '../src/public')))
app.use(expressSession(SESSION_OPTION))
app.use(flash())
app.use(setFlash)
app.use(passport.initialize())
app.use(passport.session())

// 設置路由
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.all('*', (req, res, next) => {
  next(new ExpressError('沒有相關頁面', 404))
})

app.use(errorHandler)

export default app
