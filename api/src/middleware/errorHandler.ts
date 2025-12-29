import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode?: number
  status?: string

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode || 500
    this.status = statusCode && statusCode < 500 ? 'fail' : 'error'
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  console.error('Error:', err)

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

