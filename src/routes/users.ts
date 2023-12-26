import express, { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import bcrypt from 'bcryptjs'

import { dataSource } from '../db'
import { User } from '../models/User'
import { storeReturnTo } from '../middlewares/auth'
import catchAsync from '../utils/catchAsync'

const router = express.Router()
const userRepository = dataSource.getRepository(User)
const passportAuthConfig = {
  failureRedirect: '/login',
  failureMessage: true,
}

router.get('/login', async (req, res) => {
  res.render('auth/login')
})

router.post(
  '/login',
  storeReturnTo,
  passport.authenticate('local', passportAuthConfig),
  (req, res) => {
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    res.redirect(redirectUrl)
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
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(req.body.password, salt)
      const registerUser = await userRepository.save({
        ...req.body,
        password: hash,
      })
      req.logIn(registerUser, (error) => {
        if (error) return next(error)
        req.flash('success', 'Welcome to Yelp Camp')
        res.redirect('/campgrounds')
      })
    } catch (error: any) {
      req.flash('error', error.message)
      res.redirect('/register')
    }
  }),
)

export default router
