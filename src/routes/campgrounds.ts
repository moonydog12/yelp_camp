import express, { Request, Response, NextFunction } from 'express'

import catchAsync from '../utils/catchAsync'
import { dataSource } from '../db'
import Campground from '../models/Campground'
import { campgroundSchema } from '../models/schemas'
import ExpressError from '../utils/ExpressError'
import { isLoggedIn } from '../middlewares/auth'
import {
  createCampground,
  getAllCampgrounds,
  renderNewForm,
  showCampground,
  renderEditForm,
  updateCampground,
  deleteCampground,
} from '../controller/campgrounds'

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

router.get('/', catchAsync(getAllCampgrounds))

router.get('/new', isLoggedIn, renderNewForm)

router.post('/', validateCampground, isLoggedIn, catchAsync(createCampground))

router.get('/:id', catchAsync(showCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(renderEditForm))

router.put(
  '/:id',
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(updateCampground),
)

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(deleteCampground))

export default router
