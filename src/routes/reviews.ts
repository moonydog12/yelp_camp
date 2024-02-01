import { Router } from 'express'
import catchAsync from '../utils/catchAsync'
import { isLoggedIn } from '../middlewares/auth'
import reviewController from '../controller/review'

const router = Router({
  mergeParams: true,
})

router.post(
  '/',
  isLoggedIn,
  reviewController.validateReview,
  catchAsync(reviewController.createReview),
)

router.delete(
  '/:reviewId',
  isLoggedIn,
  reviewController.isReviewAuthor,
  catchAsync(reviewController.deleteReview),
)

export default router
