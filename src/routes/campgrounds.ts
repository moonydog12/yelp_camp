import { Router } from 'express'
import multer from 'multer'
import { isLoggedIn } from '../middlewares/auth'
import catchAsync from '../utils/catchAsync'
import campgroundController, {
  CampgroundController,
} from '../controller/campground'
import { storage } from '../cloudinary'

const upload = multer({ storage })
const router = Router()

router
  .route('/')
  .get(catchAsync(CampgroundController.getAll))
  .post(
    isLoggedIn,
    upload.array('image'),
    campgroundController.validateCampground,
    catchAsync(CampgroundController.create),
  )

router.get('/new', isLoggedIn, CampgroundController.renderNewForm)

router
  .route('/:id')
  .get(catchAsync(campgroundController.showCampground))
  .put(
    isLoggedIn,
    campgroundController.isAuthor,
    upload.array('image'),
    campgroundController.validateCampground,
    catchAsync(campgroundController.updateCampground),
  )
  .delete(
    isLoggedIn,
    campgroundController.isAuthor,
    catchAsync(campgroundController.deleteCampground),
  )

router.get(
  '/:id/edit',
  isLoggedIn,
  campgroundController.isAuthor,
  catchAsync(campgroundController.renderEditForm),
)

export default router
