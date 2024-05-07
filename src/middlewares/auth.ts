import { Request, Response, NextFunction } from 'express'
import { Session } from 'express-session'

interface MySession extends Session {
  returnTo?: string
}

function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  // 若使用者尚未通過驗證，則將使用者導向登入頁面
  if (!req.isAuthenticated()) {
    ;(req.session as MySession).returnTo = req.originalUrl
    req.flash('error', 'you must be signed in')
    return res.redirect('/login')
  }
  next()
}

function storeReturnTo(req: Request, res: Response, next: NextFunction) {
  if ((req.session as MySession).returnTo) {
    res.locals.returnTo = (req.session as MySession).returnTo
  }
  next()
}

function setFlash(req: Request, res: Response, next: NextFunction) {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
}

export { isLoggedIn, setFlash, storeReturnTo }
