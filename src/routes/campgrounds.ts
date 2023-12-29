import express, { Request, Response, NextFunction } from 'express'

import catchAsync from '../utils/catchAsync'
import { dataSource } from '../db'
import Campground from '../models/Campground'
import { campgroundSchema } from '../models/schemas'
import ExpressError from '../utils/ExpressError'
import { isLoggedIn } from '../middlewares/auth'

const router = express.Router()
const campgroundRepository = dataSource.getRepository(Campground)

function validateCampground(req: Request, res: Response, next: NextFunction) {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const errorMessages = error.details.map((el) => el.message).join(',')
    throw new ExpressError(errorMessages, 400)
  } else {
    next()
  }
}

async function isAuthor(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params
  const campground = await campgroundRepository
    .createQueryBuilder('campground')
    .leftJoin('campground.author', 'author')
    .addSelect(['author.id'])
    .where('campground.id = :id', { id })
    .getOne()

  if (campground?.author.id !== req.user?.id) {
    req.flash('error', 'You do not have permission to do that')
    return res.redirect(`/campgrounds/${id}`)
  }

  next()
}

router.get(
  '/',
  catchAsync(async (req: Request, res: Response) => {
    const allCampgrounds = await campgroundRepository.find()
    res.render('campgrounds/index', { campgrounds: allCampgrounds })
  }),
)

router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new')
})

router.post(
  '/',
  validateCampground,
  isLoggedIn,
  catchAsync(async (req: Request, res: Response) => {
    const campground = { ...req.body.campground }
    campground.author = req.user?.id
    await campgroundRepository.save(campground)
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground.id}`)
  }),
)

router.get(
  '/:id',
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const campground = await campgroundRepository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.reviews', 'reviews')
      .leftJoinAndSelect('campground.author', 'author')
      .leftJoinAndSelect('reviews.authorId', 'user')
      .where('campground.id = :id', { id })
      .getOne()

    if (!campground) {
      throw new Error('找不到該筆資料')
    }

    res.render('campgrounds/show', { campground })
  }),
)

router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const campground = await campgroundRepository.findOneBy({ id })
    if (!campground) {
      req.flash('error', 'Cannot find that campground!')
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
  }),
)

router.put(
  '/:id',
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(async (req: Request, res: Response) => {
    const { campground } = req.body
    const { id } = req.params
    const campgroundUpdate = await campgroundRepository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.author', 'author')
      .where('campground.id = :id', { id })
      .getOne()

    if (!campgroundUpdate) {
      throw new Error('找不到該筆資料')
    }

    if (campgroundUpdate.author.id !== req.user?.id) {
      req.flash('error', 'You do not have permission to do that')
      return res.redirect(`/campgrounds/${id}`)
    }

    const campgroundProperties = Object.keys(campgroundUpdate)
    for (let i = 0; i < campgroundProperties.length; i += 1) {
      const prop = campgroundProperties[i]
      ;(campgroundUpdate as any)[`${prop}`] = campground[`${prop}`]
    }
    ;(campgroundUpdate as any).id = id
    await campgroundRepository.save(campgroundUpdate)
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${id}`)
  }),
)

router.delete(
  '/:id',
  isLoggedIn,
  isAuthor,
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const campgroundToRemove = await campgroundRepository.findOneBy({ id })

    if (!campgroundToRemove) {
      throw new Error('找不到該筆資料')
    }

    await campgroundRepository.remove(campgroundToRemove)
    req.flash('success', 'Delete campground')
    res.redirect('/campgrounds')
  }),
)

export default router
