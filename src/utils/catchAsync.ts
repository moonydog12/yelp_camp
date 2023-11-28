import { Request, Response, NextFunction } from 'express'

export default function catchAsync(func: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch((error: any) => next(error))
  }
}
