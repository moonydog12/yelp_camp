import express, { Request, Response, NextFunction } from 'express'

import { dataSource } from '../db'
import { User } from '../models/User'
import catchAsync from '../utils/catchAsync'

const router = express.Router()
const userRepository = dataSource.getRepository(User)

router.get('/register', (req: Request, res: Response) => {
  res.render('user/register')
})

router.post(
  '/register',
  catchAsync(async (req: Request, res: Response) => {
    try {
      await userRepository.save({ ...req.body })
      res.redirect('/campgrounds')
    } catch (error: any) {
      req.flash('error', error.message)
      res.redirect('/register')
    }
  }),
)

export default router
