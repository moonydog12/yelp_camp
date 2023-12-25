import { Request, Response, NextFunction } from 'express'

function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    req.flash('error', 'you must be signed in')
    return res.redirect('/login')
  }
  next()
}

export default isLoggedIn
