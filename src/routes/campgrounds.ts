import { Router } from 'express'
import multer from 'multer'
import { isLoggedIn } from '../middlewares/auth'
import catchAsync from '../utils/catchAsync'
import CampgroundController from '../controller/campground'
import { storage } from '../cloudinary'
import CampgroundService from '../services/campground.service'

const upload = multer({ storage })
const router = Router()

router
  .route('/')
  .get(catchAsync(CampgroundController.getAll))
  .post(
    isLoggedIn,
    upload.array('image'),
    CampgroundService.validateCampground,
    catchAsync(CampgroundController.create),
  )

router.get('/new', isLoggedIn, CampgroundController.renderNewForm)

router
  .route('/:id')
  .get(catchAsync(CampgroundController.showCampground))
  .put(
    isLoggedIn,
    CampgroundService.isAuthor,
    upload.array('image'),
    CampgroundService.validateCampground,
    catchAsync(CampgroundController.updateCampground),
  )
  .delete(
    isLoggedIn,
    CampgroundService.isAuthor,
    catchAsync(CampgroundController.deleteCampground),
  )

router.get(
  '/:id/edit',
  isLoggedIn,
  CampgroundService.isAuthor,
  catchAsync(CampgroundController.renderEditForm),
)

export default router
