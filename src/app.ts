import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import ejsMate from 'ejs-mate'
import methodOverride from 'method-override'
import expressSession from 'express-session'
import flash from 'connect-flash'
import passport from 'passport'

import ExpressError from './utils/ExpressError'
import errorHandler from './middlewares/errorhandler'
import campgroundRoutes from './routes/campgrounds'
import reviewRoutes from './routes/reviews'
import userRoutes from './routes/users'
import {
  localStrategy,
  setDeserializeUser,
  setSerializeUser,
} from './middlewares/passport'
import { SESSION_OPTION } from './configs/constants'
import { setFlash } from './middlewares/auth'
import connection from './configs/db'

// 設置 middleware
const app = express()
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../src/views'))

app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, '../src/public')))
app.use(expressSession(SESSION_OPTION))
app.use(flash())
app.use(setFlash)
app.use(passport.initialize())
app.use(passport.session())

passport.use(localStrategy)
passport.serializeUser(setSerializeUser)
passport.deserializeUser(setDeserializeUser)

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.currentUser = req.user
  next()
})

// 設置路由
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.all('*', (req, res, next) => {
  next(new ExpressError('No related pages', 404))
})

app.use(errorHandler)

connection.initialize().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`)
  })
})
