import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { checkUserPermissions, SYSTEM_MODULES } from '@/lib/permissions'

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user

    const permissions = await checkUserPermissions(user.department, user.role, SYSTEM_MODULES.DIGITAL_ASSETS)
    
    return NextResponse.json({ permissions })
  } catch (error) {
    console.error('Failed to get permissions:', error)
    return NextResponse.json(
      { error: 'Failed to get permissions' },
      { status: 500 }
    )
  }
})