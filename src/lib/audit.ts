import { prisma } from '@/lib/prisma'

// Support both parameter formats for backward compatibility
export async function logActivity(
  userIdOrParams: string | {
    userId: string
    action: string
    module: string
    details?: any
    ipAddress?: string
    userAgent?: string
  },
  action?: string,
  resource?: string,
  resourceId?: string,
  oldValues?: any,
  newValues?: any,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    let logData: any

    if (typeof userIdOrParams === 'object') {
      // New format with object parameter
      const params = userIdOrParams
      logData = {
        userId: params.userId,
        action: params.action,
        resource: params.module,
        resourceId: null,
        oldValues: null,
        newValues: params.details ? JSON.stringify(params.details) : null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      }
    } else {
      // Legacy format with individual parameters
      logData = {
        userId: userIdOrParams,
        action: action!,
        resource: resource!,
        resourceId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent,
      }
    }

    await prisma.auditLog.create({
      data: logData,
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}