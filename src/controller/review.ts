import { Request, Response } from 'express'
import CampgroundService from '../services/campground.service'
import ReviewService from '../services/review.service'

export default class ReviewController {
  static createReview = async (req: Request, res: Response) => {
    const { id } = req.params
    const userId = req.user?.id
    const campground = await CampgroundService.getOne(id)

    if (!campground) {
      throw new Error('Can not find the data')
    }

    const { review } = req.body
    const data = { review, campground, userId }
    await ReviewService.create(data)

    req.flash('success', 'Create new review')
    res.redirect(`/campgrounds/${campground.id}`)
  }

  static deleteReview = async (req: Request, res: Response) => {
    const { reviewId } = req.params
    const review = await ReviewService.getOne(reviewId)
    if (!review) {
      throw new Error('Can not find the data')
    }

    await ReviewService.delete(review)
    req.flash('success', 'Delete review')
    res.redirect(`/campgrounds/${req.params.id}`)
  }
}
