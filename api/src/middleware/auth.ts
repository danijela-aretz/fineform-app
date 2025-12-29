import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler'

export interface AuthRequest extends Request {
  userId?: string
  userType?: 'STAFF' | 'CLIENT'
  staffRole?: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401)
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    req.userId = decoded.userId
    req.userType = decoded.userType
    req.staffRole = decoded.staffRole

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401))
    } else {
      next(error)
    }
  }
}

export const requireStaff = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userType !== 'STAFF') {
    return next(new AppError('Staff access required', 403))
  }
  next()
}

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userType !== 'STAFF' || !['SUPER_ADMIN', 'ADMIN'].includes(req.staffRole || '')) {
    return next(new AppError('Admin access required', 403))
  }
  next()
}

export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userType !== 'STAFF' || req.staffRole !== 'SUPER_ADMIN') {
    return next(new AppError('Super admin access required', 403))
  }
  next()
}

