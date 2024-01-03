import { Request, Response } from 'express'
import Campground from '../models/Campground'
import connection from '../db'
import Review from '../models/Review'

class ReviewController {
  private campgroundRepository = connection.getRepository(Campground)

  private reviewRepository = connection.getRepository(Review)

  createReview = async (req: Request, res: Response) => {
    const campground = await this.campgroundRepository.findOneBy({
      id: req.params.id,
    })

    if (campground === null) {
      throw new Error('Can not find the data')
    }

    const review = { ...req.body.review }
    const newReview = new Review()
    newReview.body = review.body
    newReview.rating = review.rating
    newReview.campground = campground
    newReview.authorId = req.user!.id
    await newReview.save()
    req.flash('success', 'Create new review')
    res.redirect(`/campgrounds/${campground.id}`)
  }

  deleteReview = async (req: Request, res: Response) => {
    const review = await this.reviewRepository.findOneBy({
      id: req.params.reviewId,
    })
    if (review === null) {
      throw new Error('Can not find the data')
    }
    await this.reviewRepository.remove(review)
    req.flash('success', 'Delete review')
    res.redirect(`/campgrounds/${req.params.id}`)
  }
}

const reviewController = new ReviewController()

export default reviewController
