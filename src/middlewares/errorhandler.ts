import { Request, Response, NextFunction } from 'express'

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // express 會把有四個參數的 function視作錯誤處理中介
  const { statusCode = 500 } = err
  if (!err.message) {
    err.message = '出現錯誤了 🐛'
  }
  res.status(statusCode).render('error', { err })
}

export default errorHandler
