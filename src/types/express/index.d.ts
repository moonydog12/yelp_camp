declare global {
  namespace Express {
    interface Request {
      requestTime: Record<Number>
    }
  }
}
