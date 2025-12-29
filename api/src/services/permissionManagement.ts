import prisma from '../db/client'

/**
 * Add client to ACL (restricted client access)
 */
export async function addClientAcl(
  clientEntityId: string,
  staffUserId: string,
  changedBy: string
) {
  // Check if already exists
  const existing = await prisma.clientAcl.findUnique({
    where: {
      clientId_staffUserId: {
        clientId: clientEntityId,
        staffUserId,
      },
    },
  })

  if (existing) {
    return existing
  }

  const acl = await prisma.clientAcl.create({
    data: {
      clientId: clientEntityId,
      staffUserId,
    },
  })

  // Log audit
  await prisma.permissionAuditLog.create({
    data: {
      changeType: 'client_acl',
      clientId: clientEntityId,
      staffUserId,
      newValue: JSON.stringify({ action: 'GRANTED' }),
      changedBy,
    },
  })

  return acl
}

/**
 * Remove client from ACL
 */
export async function removeClientAcl(
  clientEntityId: string,
  staffUserId: string,
  changedBy: string
) {
  const acl = await prisma.clientAcl.delete({
    where: {
      clientId_staffUserId: {
        clientId: clientEntityId,
        staffUserId,
      },
    },
  })

  // Log audit
  await prisma.permissionAuditLog.create({
    data: {
      changeType: 'client_acl',
      clientId: clientEntityId,
      staffUserId,
      newValue: JSON.stringify({ action: 'REVOKED' }),
      changedBy,
    },
  })

  return acl
}

/**
 * Grant tax access to staff
 */
export async function grantTaxAccess(
  clientEntityId: string,
  staffUserId: string,
  changedBy: string
) {
  // Check if already exists
  const existing = await prisma.clientStaffPermission.findUnique({
    where: {
      clientId_staffUserId: {
        clientId: clientEntityId,
        staffUserId,
      },
    },
  })

  if (existing && existing.canSeeTaxes) {
    return existing
  }

  const permission = await prisma.clientStaffPermission.upsert({
    where: {
      clientId_staffUserId: {
        clientId: clientEntityId,
        staffUserId,
      },
    },
    create: {
      clientId: clientEntityId,
      staffUserId,
      canSeeTaxes: true,
    },
    update: {
      canSeeTaxes: true,
    },
  })

  // Log audit
  await prisma.permissionAuditLog.create({
    data: {
      changeType: 'tax_permission',
      clientId: clientEntityId,
      staffUserId,
      newValue: JSON.stringify({ canSeeTaxes: true, action: 'GRANTED' }),
      changedBy,
    },
  })

  return permission
}

/**
 * Revoke tax access from staff
 */
export async function revokeTaxAccess(
  clientEntityId: string,
  staffUserId: string,
  changedBy: string
) {
  const permission = await prisma.clientStaffPermission.update({
    where: {
      clientId_staffUserId: {
        clientId: clientEntityId,
        staffUserId,
      },
    },
    data: {
      canSeeTaxes: false,
    },
  })

  // Log audit
  await prisma.permissionAuditLog.create({
    data: {
      changeType: 'tax_permission',
      clientId: clientEntityId,
      staffUserId,
      newValue: JSON.stringify({ canSeeTaxes: false, action: 'REVOKED' }),
      changedBy,
    },
  })

  return permission
}

/**
 * Assign staff to client
 */
export async function assignStaffToClient(
  clientEntityId: string,
  staffUserId: string,
  roleOnClient: 'preparer' | 'assistant',
  assignedBy: string
) {
  // Check if already exists
  const existing = await prisma.clientStaffAssignment.findFirst({
    where: {
      clientId: clientEntityId,
      staffUserId,
    },
  })

  if (existing && existing.active) {
    // Update role if different
    if (existing.roleOnClient !== roleOnClient) {
      return await prisma.clientStaffAssignment.update({
        where: { id: existing.id },
        data: {
          roleOnClient,
          assignedBy,
        },
      })
    }
    return existing
  }

  let assignment
  if (existing) {
    assignment = await prisma.clientStaffAssignment.update({
      where: { id: existing.id },
      data: {
        roleOnClient,
        assignedBy,
        active: true,
      },
    })
  } else {
    assignment = await prisma.clientStaffAssignment.create({
      data: {
        clientId: clientEntityId,
        staffUserId,
        roleOnClient,
        assignedBy,
        active: true,
      },
    })
  }

  // Log audit
  await prisma.permissionAuditLog.create({
    data: {
      changeType: 'assignment',
      clientId: clientEntityId,
      staffUserId,
      newValue: JSON.stringify({ roleOnClient, action: 'ASSIGNED' }),
      changedBy: assignedBy,
    },
  })

  return assignment
}

/**
 * Unassign staff from client
 */
export async function unassignStaffFromClient(
  clientEntityId: string,
  staffUserId: string,
  changedBy: string
) {
  const assignment = await prisma.clientStaffAssignment.findFirst({
    where: {
      clientId: clientEntityId,
      staffUserId,
    },
  })

  if (!assignment) {
    throw new Error('Assignment not found')
  }

  await prisma.clientStaffAssignment.update({
    where: { id: assignment.id },
    data: {
      active: false,
    },
  })

  // Log audit
  await prisma.permissionAuditLog.create({
    data: {
      changeType: 'assignment',
      clientId: clientEntityId,
      staffUserId,
      newValue: JSON.stringify({ action: 'UNASSIGNED' }),
      changedBy,
    },
  })

  return { success: true }
}

/**
 * Get permission audit log for client
 */
export async function getPermissionAuditLog(clientEntityId: string) {
  return await prisma.permissionAuditLog.findMany({
    where: { clientId: clientEntityId },
    include: {
      staff: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

