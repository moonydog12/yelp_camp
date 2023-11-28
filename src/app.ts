import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import { json } from 'body-parser'
import { v4 as uuidv4 } from 'uuid'
import ejsMate from 'ejs-mate'
import dotenv from 'dotenv'
import methodOverride from 'method-override'

import { Campground } from './seeds/Campground'
import { connectToDB, database } from './db'
import catchAsync from './utils/catchAsync'

const campgroundRepository = database.getRepository(Campground)
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

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/campgrounds', async (req, res, next) => {
  try {
    const allCampgrounds = await campgroundRepository.find()
    res.render('campgrounds/index', { campgrounds: allCampgrounds })
  } catch (error) {
    next(error)
  }
})

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

app.post(
  '/campgrounds',
  catchAsync(async (req: Request, res: Response) => {
    const id = uuidv4()
    const campground = { ...req.body.campground, id }
    await campgroundRepository.save(campground)
    res.redirect(`/campgrounds/${campground.id}`)
  }),
)

app.get(
  '/campgrounds/:id',
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const campground = await campgroundRepository.findOneBy({ id })
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

app.put('/campgrounds/:id', async (req, res, next) => {
  const { campground } = req.body
  const { id } = req.params
  try {
    const campgroundUpdate = await campgroundRepository.findOneBy({ id })
    if (!campgroundUpdate) {
      throw new Error('找不到該筆資料')
    }

    for (const property in campground) {
      ;(campgroundUpdate as any)[`${property}`] = campground[`${property}`]
    }
    await campgroundRepository.save(campgroundUpdate)
    res.redirect(`/campgrounds/${id}`)
  } catch (error) {
    next(error)
  }
})

app.delete('/campgrounds/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const campgroundToRemove = await campgroundRepository.findOneBy({ id })
    if (!campgroundToRemove) {
      throw new Error('找不到該筆資料')
    }
    await campgroundRepository.remove(campgroundToRemove)
    res.redirect('/campgrounds')
  } catch (error) {
    next(error)
  }
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = 500, message = 'test' } = err
  res.status(statusCode).send(message)
})

app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`)
})
