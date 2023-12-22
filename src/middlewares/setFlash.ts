import { Request, Response, NextFunction } from 'express'

function setFlash(req: Request, res: Response, next: NextFunction) {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
}

export default setFlash
