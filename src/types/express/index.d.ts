import express from 'express'

declare global {
  namespace Express {
    interface Request {
      requestTime: Record<Number>
    }
  }
}
