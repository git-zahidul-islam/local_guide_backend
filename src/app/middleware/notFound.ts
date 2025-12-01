import { NextFunction, Request, Response } from 'express';

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`API Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export default notFound;