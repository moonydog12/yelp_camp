import { Router } from 'express'
import catchAsync from '../utils/catchAsync'
import { isLoggedIn } from '../middlewares/auth'
import ReviewController from '../controller/review'
import ReviewService from '../services/review.service'

const router = Router({
  mergeParams: true,
})

router.post(
  '/',
  isLoggedIn,
  ReviewService.validate,
  catchAsync(ReviewController.createReview),
)

router.delete(
  '/:reviewId',
  isLoggedIn,
  ReviewService.checkAuthor,
  catchAsync(ReviewController.deleteReview),
)

export default router
