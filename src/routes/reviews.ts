import express, { Request, Response, NextFunction } from 'express'

import Review from '../models/Review'
import Campground from '../models/Campground'
import { reviewSchema } from '../models/schemas'
import ExpressError from '../utils/ExpressError'
import catchAsync from '../utils/catchAsync'
import { dataSource } from '../db'

const router = express.Router({
  // 取得定義在之前路由的參數
  mergeParams: true,
})
const campgroundRepository = dataSource.getRepository(Campground)
const reviewRepository = dataSource.getRepository(Review)

function validateReview(req: Request, res: Response, next: NextFunction) {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const errorMessages = error.details.map((el) => el.message).join(',')
    throw new ExpressError(errorMessages, 400)
  } else {
    next()
  }
}

router.post(
  '/',
  validateReview,
  catchAsync(async (req: Request, res: Response) => {
    const campground = await campgroundRepository.findOneBy({
      id: req.params.id,
    })

    // 先確定 campground 不是空值(ts 2322 錯誤)
    if (!campground) {
      throw new Error('找不到該筆資料')
    }

    const review = { ...req.body.review }
    const newReview = new Review()
    newReview.body = review.body
    newReview.rating = review.rating
    newReview.campground = campground
    await newReview.save()
    req.flash('success', 'Create new review')
    res.redirect(`/campgrounds/${campground.id}`)
  }),
)

router.delete(
  '/:reviewId',
  catchAsync(async (req: Request, res: Response) => {
    const review = await reviewRepository.findOneBy({ id: req.params.reviewId })
    if (!review) {
      throw new Error('找不到該筆資料')
    }
    await reviewRepository.remove(review)
    req.flash('success', 'Delete review')
    res.redirect(`/campgrounds/${req.params.id}`)
  }),
)

export default router
