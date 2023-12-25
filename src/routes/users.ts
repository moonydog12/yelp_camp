import express, { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import bcrypt from 'bcryptjs'

import { dataSource } from '../db'
import { User } from '../models/User'
import catchAsync from '../utils/catchAsync'

const router = express.Router()
const userRepository = dataSource.getRepository(User)

router.get('/login', async (req, res) => {
  res.render('auth/login')
})

router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
    failureMessage: true,
  }),
  (req, res) => {
    req.flash('success', 'welcome back')
    res.redirect('/campgrounds')
  },
)

router.get('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err)
    }
    req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds')
  })
})

router.get('/register', (req, res) => {
  res.render('auth/register')
})

router.post(
  '/register',
  catchAsync(async (req: Request, res: Response) => {
    try {
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(req.body.password, salt)
      await userRepository.save({ ...req.body, password: hash })
      res.redirect('/campgrounds')
    } catch (error: any) {
      req.flash('error', error.message)
      res.redirect('/register')
    }
  }),
)

export default router
