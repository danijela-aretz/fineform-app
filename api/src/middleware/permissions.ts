import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import { checkClientVisibility, checkTaxAccess, checkStaffAssignment } from '../services/permissions'
import { AppError } from './errorHandler'

/**
 * Middleware to check if staff can access a client entity
 */
export const checkEntityAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.userType !== 'STAFF') {
      return next(new AppError('Staff access required', 403))
    }

    const clientEntityId = req.params.clientId || req.params.id || req.body.clientId

    if (!clientEntityId) {
      return next(new AppError('Client entity ID required', 400))
    }

    const result = await checkClientVisibility(req.userId!, clientEntityId)

    if (!result.canAccess) {
      return next(new AppError(result.reason || 'Access denied', 403))
    }

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware to check if staff can see tax-related items
 */
export const checkTaxAccessMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.userType !== 'STAFF') {
      return next(new AppError('Staff access required', 403))
    }

    const clientEntityId = req.params.clientId || req.params.id || req.body.clientId

    if (!clientEntityId) {
      return next(new AppError('Client entity ID required', 400))
    }

    const result = await checkTaxAccess(req.userId!, clientEntityId)

    if (!result.canAccess) {
      return next(new AppError(result.reason || 'Tax access denied', 403))
    }

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware to check if staff is assigned to a client
 */
export const checkAssignment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.userType !== 'STAFF') {
      return next(new AppError('Staff access required', 403))
    }

    const clientEntityId = req.params.clientId || req.params.id || req.body.clientId

    if (!clientEntityId) {
      return next(new AppError('Client entity ID required', 400))
    }

    // Super admin and admin don't need assignments
    if (req.staffRole === 'SUPER_ADMIN' || req.staffRole === 'ADMIN') {
      return next()
    }

    const result = await checkStaffAssignment(req.userId!, clientEntityId)

    if (!result.canAccess) {
      return next(new AppError(result.reason || 'Not assigned to client', 403))
    }

    next()
  } catch (error) {
    next(error)
  }
}

