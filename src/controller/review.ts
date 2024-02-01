import { Request, Response, NextFunction } from 'express'
import Campground from '../models/Campground'
import connection from '../db'
import Review from '../models/Review'
import { reviewSchema } from '../models/schemas'
import ExpressError from '../utils/ExpressError'

class ReviewController {
  private campgroundRepository = connection.getRepository(Campground)

  private reviewRepository = connection.getRepository(Review)

  private reviewSchema = reviewSchema

  isReviewAuthor = async (req: Request, res: Response, next: NextFunction) => {
    const { id, reviewId } = req.params
    const review = await this.reviewRepository.findOneBy({
      id: parseInt(reviewId, 10),
    })
    if (review === null) throw new Error('Can not find the review')
    if (review.authorId !== req.user!.id) {
      req.flash('error', "You don't have permission to do that")
      return res.redirect(`/campgrounds/${id}`)
    }
    next()
  }

  validateReview = (req: Request, res: Response, next: NextFunction) => {
    const { error } = this.reviewSchema.validate(req.body)
    if (error) {
      const errorMessages = error.details.map((el) => el.message).join(',')
      throw new ExpressError(errorMessages, 400)
    }
    next()
  }

  createReview = async (req: Request, res: Response) => {
    const campground = await this.campgroundRepository.findOneBy({
      id: parseInt(req.params.id, 10),
    })

    if (!campground) {
      throw new Error('Can not find the data')
    }

    const review = { ...req.body.review }
    const newReview = {} as any
    Object.keys(review).forEach((key) => {
      newReview[key] = review[key]
    })
    newReview.campground = campground
    newReview.authorId = req.user!.id
    this.reviewRepository.save(newReview)
    req.flash('success', 'Create new review')
    res.redirect(`/campgrounds/${campground.id}`)
  }

  deleteReview = async (req: Request, res: Response) => {
    const review = await this.reviewRepository.findOneBy({
      id: parseInt(req.params.reviewId, 10),
    })
    if (!review) {
      throw new Error('Can not find the data')
    }
    await this.reviewRepository.remove(review)
    req.flash('success', 'Delete review')
    res.redirect(`/campgrounds/${req.params.id}`)
  }
}

const reviewController = new ReviewController()

export default reviewController
