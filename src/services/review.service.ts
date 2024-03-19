import { Request, Response, NextFunction } from 'express'
import connection from '../db'
import Review from '../models/Review'
import { reviewSchema } from '../models/schemas'
import ExpressError from '../utils/ExpressError'

const reviewRepository = connection.getRepository(Review)

export default class ReviewService {
  static validate(req: Request, res: Response, next: NextFunction) {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
      const errorMessages = error.details.map((el) => el.message).join(',')
      throw new ExpressError(errorMessages, 400)
    }
    return next()
  }

  static async checkAuthor(req: Request, res: Response, next: NextFunction) {
    const { id, reviewId } = req.params
    const review = await reviewRepository.findOneBy({
      id: parseInt(reviewId, 10),
    })
    if (!review) throw new Error('Can not find the review')
    if (review.authorId !== req.user!.id) {
      req.flash('error', "You don't have permission to do that")
      return res.redirect(`/campgrounds/${id}`)
    }
    next()
  }

  static async getOne(id: string) {
    const review = await reviewRepository.findOneBy({ id: parseInt(id, 10) })
    return review
  }

  static async create(data: any) {
    const { review, campground } = data
    const newReview = { ...review }
    newReview.campground = campground
    newReview.authorId = campground.author.id
    await reviewRepository.save(newReview)
  }

  static async delete(data: any) {
    await reviewRepository.remove(data)
  }
}
