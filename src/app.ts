import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import ejsMate from 'ejs-mate'
import methodOverride from 'method-override'
import expressSession from 'express-session'
import flash from 'connect-flash'
import passport from 'passport'
import helmet from 'helmet'

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
import SESSION_OPTION from './configs/constants'
import { setFlash } from './middlewares/auth'
import connection from './configs/db'

// Content Security Policy 白名單變數
const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com/',
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://kit.fontawesome.com/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net',
]
const styleSrcUrls = [
  'https://kit-free.fontawesome.com/',
  'https://stackpath.bootstrapcdn.com/',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://use.fontawesome.com/',
  'https://cdn.jsdelivr.net',
]
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
]
const fontSrcUrls = ['https://fonts.gstatic.com/']

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
app.use(
  // helmet 設定 CSP
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        // 要跟 Cloudinary 使用者的專屬網址一樣!
        'https://res.cloudinary.com/dc13n3xwj/',
        'https://images.unsplash.com/',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  }),
)

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

app.get('/', (req, res) => {
  res.render('home')
})

app.all('*', (req, res, next) => {
  next(new ExpressError('No related pages', 404))
})

app.use(errorHandler)

connection.initialize().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`)
  })
})
