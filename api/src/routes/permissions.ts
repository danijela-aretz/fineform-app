import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth'
import {
  addClientAcl,
  removeClientAcl,
  grantTaxAccess,
  revokeTaxAccess,
  assignStaffToClient,
  unassignStaffFromClient,
  getPermissionAuditLog,
} from '../services/permissionManagement'
import prisma from '../db/client'
import { z } from 'zod'

const router = Router()

// Get all permissions for a client entity
router.get('/client/:clientEntityId', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const [acl, taxPermissions, assignments] = await Promise.all([
      prisma.clientAcl.findMany({
        where: { clientId: req.params.clientEntityId },
        include: {
          staff: {
            include: {
              profile: true,
            },
          },
        },
      }),
      prisma.clientStaffPermission.findMany({
        where: { clientId: req.params.clientEntityId },
        include: {
          staff: {
            include: {
              profile: true,
            },
          },
        },
      }),
      prisma.clientStaffAssignment.findMany({
        where: { clientId: req.params.clientEntityId },
        include: {
          staff: {
            include: {
              profile: true,
            },
          },
        },
      }),
    ])

    res.json({
      acl,
      taxPermissions,
      assignments,
    })
  } catch (error) {
    next(error)
  }
})

// Add client to ACL
router.post('/client/:clientEntityId/acl', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const { staffUserId } = z.object({ staffUserId: z.string() }).parse(req.body)
    const acl = await addClientAcl(req.params.clientEntityId, staffUserId, req.userId!)
    res.json(acl)
  } catch (error) {
    next(error)
  }
})

// Remove client from ACL
router.delete('/client/:clientEntityId/acl/:staffUserId', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    await removeClientAcl(req.params.clientEntityId, req.params.staffUserId, req.userId!)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Grant tax access
router.post('/client/:clientEntityId/tax-access', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const { staffUserId } = z.object({ staffUserId: z.string() }).parse(req.body)
    const permission = await grantTaxAccess(req.params.clientEntityId, staffUserId, req.userId!)
    res.json(permission)
  } catch (error) {
    next(error)
  }
})

// Revoke tax access
router.delete('/client/:clientEntityId/tax-access/:staffUserId', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    await revokeTaxAccess(req.params.clientEntityId, req.params.staffUserId, req.userId!)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Assign staff to client
router.post('/client/:clientEntityId/assign', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const { staffUserId, roleOnClient } = z
      .object({
        staffUserId: z.string(),
        roleOnClient: z.enum(['preparer', 'assistant']),
      })
      .parse(req.body)
    const assignment = await assignStaffToClient(
      req.params.clientEntityId,
      staffUserId,
      roleOnClient,
      req.userId!
    )
    res.json(assignment)
  } catch (error) {
    next(error)
  }
})

// Unassign staff from client
router.delete('/client/:clientEntityId/assign/:staffUserId', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    await unassignStaffFromClient(req.params.clientEntityId, req.params.staffUserId, req.userId!)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Get permission audit log
router.get('/client/:clientEntityId/audit', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const auditLog = await getPermissionAuditLog(req.params.clientEntityId)
    res.json(auditLog)
  } catch (error) {
    next(error)
  }
})

// Get all staff (for dropdowns)
router.get('/staff', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const staff = await prisma.staffProfile.findMany({
      where: { active: true },
      include: {
        profile: true,
      },
      orderBy: {
        profile: {
          fullName: 'asc',
        },
      },
    })
    res.json(staff)
  } catch (error) {
    next(error)
  }
})

export default router

