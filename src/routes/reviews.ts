import express, { Request, Response, NextFunction } from 'express'
import Review from '../models/Review'
import { reviewSchema } from '../models/schemas'
import ExpressError from '../utils/ExpressError'
import catchAsync from '../utils/catchAsync'
import connection from '../db'
import { isLoggedIn } from '../middlewares/auth'
import reviewController from '../controller/review'

const router = express.Router({
  mergeParams: true,
})
const reviewRepository = connection.getRepository(Review)

async function isReviewAuthor(req: Request, res: Response, next: NextFunction) {
  const { id, reviewId } = req.params
  const review = await reviewRepository.findOneBy({
    id: parseInt(reviewId, 10),
  })
  if (review === null) throw new Error('Can not find the review')
  if (review.authorId !== req.user!.id) {
    req.flash('error', "You don't have permission to do that")
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}

function validateReview(req: Request, res: Response, next: NextFunction) {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const errorMessages = error.details.map((el) => el.message).join(',')
    throw new ExpressError(errorMessages, 400)
  }
  next()
}

router.post(
  '/',
  isLoggedIn,
  validateReview,
  catchAsync(reviewController.createReview),
)

router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviewController.deleteReview),
)

export default router
