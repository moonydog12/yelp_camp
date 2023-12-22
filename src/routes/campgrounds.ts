import express, { Request, Response, NextFunction } from 'express'

import catchAsync from '../utils/catchAsync'
import { dataSource } from '../db'
import { Campground } from '../models/Campground'
import { campgroundSchema } from '../models/schemas'
import ExpressError from '../utils/ExpressError'

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

router.get(
  '/',
  catchAsync(async (req: Request, res: Response) => {
    const allCampgrounds = await campgroundRepository.find()
    res.render('campgrounds/index', { campgrounds: allCampgrounds })
  }),
)

router.get('/new', (req, res) => {
  res.render('campgrounds/new')
})

router.post(
  '/',
  validateCampground,
  catchAsync(async (req: Request, res: Response) => {
    const campground = { ...req.body.campground }
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
  catchAsync(async (req: Request, res: Response) => {
    const campground = await campgroundRepository.findOneBy({
      id: req.params.id,
    })
    res.render('campgrounds/edit', { campground })
  }),
)

router.put(
  '/:id',
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
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${id}`)
  }),
)

router.delete(
  '/:id',
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
