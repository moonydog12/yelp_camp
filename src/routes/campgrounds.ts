import express, { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { campgroundSchema } from '../models/schemas'
import { isLoggedIn } from '../middlewares/auth'
import catchAsync from '../utils/catchAsync'
import connection from '../db'
import Campground from '../models/Campground'
import ExpressError from '../utils/ExpressError'
import campgroundController, {
  CampgroundController,
} from '../controller/campground'
import { storage } from '../cloudinary'

const upload = multer({ storage })
const router = express.Router()
const campgroundRepository = connection.getRepository(Campground)

function validateCampground(req: Request, res: Response, next: NextFunction) {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const errorMessages = error.details.map((el) => el.message).join(',')
    throw new ExpressError(errorMessages, 400)
  }
  next()
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

router
  .route('/')
  .get(catchAsync(campgroundController.getAllCampgrounds))
  .post(
    isLoggedIn,
    upload.array('image'),
    validateCampground,
    catchAsync(campgroundController.createCampground),
  )

router.get('/new', isLoggedIn, CampgroundController.renderNewForm)

router
  .route('/:id')
  .get(catchAsync(campgroundController.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array('image'),
    validateCampground,
    catchAsync(campgroundController.updateCampground),
  )
  .delete(
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundController.deleteCampground),
  )

router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(campgroundController.renderEditForm),
)

export default router
