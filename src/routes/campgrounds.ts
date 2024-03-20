import { Router } from 'express'
import multer from 'multer'
import { isLoggedIn } from '../middlewares/auth'
import catchAsync from '../utils/catchAsync'
import CampgroundController from '../controller/campground'
import { storage } from '../configs/cloudinaryConfigs'
import CampgroundService from '../services/campground.service'

const upload = multer({ storage })
const router = Router()

router
  .route('/')
  .get(catchAsync(CampgroundController.get))
  .post(
    isLoggedIn,
    upload.array('image'),
    CampgroundService.validateCampground,
    catchAsync(CampgroundController.create),
  )

router.get('/new', isLoggedIn, CampgroundController.renderNew)

router
  .route('/:id')
  .get(catchAsync(CampgroundController.show))
  .put(
    isLoggedIn,
    CampgroundService.isAuthor,
    upload.array('image'),
    CampgroundService.validateCampground,
    catchAsync(CampgroundController.update),
  )
  .delete(
    isLoggedIn,
    CampgroundService.isAuthor,
    catchAsync(CampgroundController.delete),
  )

router.get(
  '/:id/edit',
  isLoggedIn,
  CampgroundService.isAuthor,
  catchAsync(CampgroundController.renderEdit),
)

export default router
