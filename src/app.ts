import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import { json } from 'body-parser'
import ejsMate from 'ejs-mate'
import dotenv from 'dotenv'
import methodOverride from 'method-override'

import { Campground } from './models/Campground'
import { Review } from './models/Review'
import { connectToDB, dataSource } from './db'
import { campgroundSchema, reviewSchema } from './schemas'
import catchAsync from './utils/catchAsync'
import ExpressError from './utils/ExpressError'

const campgroundRepository = dataSource.getRepository(Campground)
const reviewRepository = dataSource.getRepository(Review)
dotenv.config()

// 連接 DB
connectToDB()

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../src/views'))

app.use(json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

const validateCampground = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const errorMessages = error.details.map((el) => el.message).join(',')
    throw new ExpressError(errorMessages, 400)
  } else {
    next()
  }
}

const validateReview = (req: Request, res: Response, next: NextFunction) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const errorMessages = error.details.map((el) => el.message).join(',')
    throw new ExpressError(errorMessages, 400)
  } else {
    next()
  }
}

app.get('/', (req, res) => {
  res.render('home')
})

app.get(
  '/campgrounds',
  catchAsync(async (req: Request, res: Response) => {
    const allCampgrounds = await campgroundRepository.find()
    res.render('campgrounds/index', { campgrounds: allCampgrounds })
  }),
)

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

app.post(
  '/campgrounds',
  validateCampground,
  catchAsync(async (req: Request, res: Response) => {
    const campground = { ...req.body.campground }
    await campgroundRepository.save(campground)
    res.redirect(`/campgrounds/${campground.id}`)
  }),
)

app.get(
  '/campgrounds/:id',
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const campground = await campgroundRepository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.reviews', 'reviews')
      .where('campground.id = :id', { id })
      .getOne()

    res.render('campgrounds/show', { campground })
  }),
)

app.get(
  '/campgrounds/:id/edit',
  catchAsync(async (req: Request, res: Response) => {
    const campground = await campgroundRepository.findOneBy({
      id: req.params.id,
    })
    res.render('campgrounds/edit', { campground })
  }),
)

app.put(
  '/campgrounds/:id',
  validateCampground,
  catchAsync(async (req: Request, res: Response) => {
    const { campground } = req.body
    const { id } = req.params
    const campgroundUpdate = await campgroundRepository.findOneBy({ id })

    if (!campgroundUpdate) {
      throw new Error('找不到該筆資料')
    }

    for (const property in campground) {
      ;(campgroundUpdate as any)[`${property}`] = campground[`${property}`]
    }

    await campgroundRepository.save(campgroundUpdate)
    res.redirect(`/campgrounds/${id}`)
  }),
)

app.delete(
  '/campgrounds/:id',
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const campgroundToRemove = await campgroundRepository.findOneBy({ id })

    if (!campgroundToRemove) {
      throw new Error('找不到該筆資料')
    }

    await campgroundRepository.remove(campgroundToRemove)
    res.redirect('/campgrounds')
  }),
)

app.post(
  '/campgrounds/:id/reviews',
  validateReview,
  catchAsync(async (req: Request, res: Response) => {
    const campground = await campgroundRepository.findOneBy({
      id: req.params.id,
    })

    // 先確定 campground 不是空值(ts 2322 錯誤)
    if (!campground) {
      throw new Error('找不到該筆資料')
    }

    const review = { ...req.body.review }
    const newReview = new Review()
    newReview.body = review.body
    newReview.rating = review.rating
    newReview.campground = campground
    await newReview.save()
    res.redirect(`/campgrounds/${campground.id}`)
  }),
)

app.delete(
  '/campground/:id/reviews/:reviewId',
  catchAsync(async (req: Request, res: Response) => {
    const review = await reviewRepository.findOneBy({ id: req.params.reviewId })
    if (!review) {
      throw new Error('找不到該筆資料')
    }
    await reviewRepository.remove(review)
    res.redirect(`/campgrounds/${req.params.id}`)
  }),
)

app.all('*', (req, res, next) => {
  next(new ExpressError('沒有相關頁面', 404))
})

// express 會把有四個參數的 function視作錯誤處理中介
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = 500 } = err
  if (!err.message) {
    err.message = '出現錯誤了 🐛'
  }
  res.status(statusCode).render('error', { err })
})

app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`)
})
