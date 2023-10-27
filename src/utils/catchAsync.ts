import { Request, Response, NextFunction } from 'express';

export default function catchAsync(func) {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch(next);
  };
}
