import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRole } from '@/lib/middleware'
import { logActivity } from '@/lib/audit'

// GET - Fetch department permissions
export const GET = withRole(['ADMIN'])(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params
    const departmentId = params.id

    // Fetch existing permissions for the department
    const permissions = await prisma.departmentPermission.findMany({
      where: { department: departmentId },
    })

    // Transform to the expected format
    const permissionMap = {
      ASSETS: { canRead: false, canWrite: false },
      DOCUMENTS: { canRead: false, canWrite: false },
      DIGITAL_ASSETS: { canRead: false, canWrite: false }
    }

    permissions.forEach(perm => {
      if (perm.module in permissionMap) {
        permissionMap[perm.module as keyof typeof permissionMap] = {
          canRead: perm.canRead,
          canWrite: perm.canWrite
        }
      }
    })

    return NextResponse.json({ permissions: permissionMap })
  } catch (error) {
    console.error('Error fetching department permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST - Save department permissions
export const POST = withRole(['ADMIN'])(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params
    const departmentId = params.id
    const { permissions } = await request.json()
    const user = (request as any).user

    console.log('Received permissions data:', { departmentId, permissions })

    if (!permissions) {
      return NextResponse.json({ error: 'Permissions data is required' }, { status: 400 })
    }

    // Use upsert to handle permissions (update if exists, create if not)
    const permissionPromises = []
    for (const [module, perms] of Object.entries(permissions)) {
      if (typeof perms === 'object' && perms !== null) {
        const { canRead, canWrite } = perms as { canRead: boolean, canWrite: boolean }
        
        // Always upsert permission entry (even if both are false to maintain record)
        permissionPromises.push(
          prisma.departmentPermission.upsert({
            where: {
              department_module: {
                department: departmentId,
                module: module as any
              }
            },
            update: {
              canRead: canRead || false,
              canWrite: canWrite || false,
              canDelete: false,
              isActive: true,
              updatedAt: new Date()
            },
            create: {
              department: departmentId,
              module: module as any,
              canRead: canRead || false,
              canWrite: canWrite || false,
              canDelete: false,
              isActive: true,
              createdById: user.id
            }
          })
        )
      }
    }

    if (permissionPromises.length > 0) {
      await Promise.all(permissionPromises)
    }

    // Log the activity
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await logActivity(
      user.id,
      'UPDATE',
      'DepartmentPermission',
      departmentId,
      null,
      permissions,
      ipAddress,
      userAgent
    )

    return NextResponse.json({ message: 'Permissions updated successfully' })
  } catch (error) {
    console.error('Error saving department permissions:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})