import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import connection from '../db'
import User from '../models/User'

export class UserController {
  private userRepository = connection.getRepository(User)

  static renderLogin(req: Request, res: Response) {
    res.render('auth/login')
  }

  static renderPreviousPage(req: Request, res: Response) {
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    res.redirect(redirectUrl)
  }

  static logout(req: Request, res: Response, next: NextFunction) {
    req.logOut((err) => {
      if (err) {
        return next(err)
      }
      req.flash('success', 'Goodbye!')
      res.redirect('/campgrounds')
    })
  }

  static renderRegister(req: Request, res: Response) {
    res.render('auth/register')
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(req.body.password, salt)
      const registerUser = await this.userRepository.save({
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
  }
}

const userController = new UserController()

export default userController
