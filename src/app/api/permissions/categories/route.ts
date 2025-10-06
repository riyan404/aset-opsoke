import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { checkUserPermissions, SYSTEM_MODULES } from '@/lib/permissions'
import { CacheManager } from '@/lib/cache'

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user

    // Check cache first
    const cacheKey = CacheManager.generatePermissionKey(
      user.department,
      user.role,
      'CATEGORIES'
    )
    
    const cachedPermissions = CacheManager.getPermissions(cacheKey)
    if (cachedPermissions) {
      return NextResponse.json(cachedPermissions)
    }

    // For categories, we'll use ASSETS permissions as they're related
    const permissions = await checkUserPermissions(
      user.department,
      user.role,
      SYSTEM_MODULES.ASSETS
    )

    return NextResponse.json(permissions)
  } catch (error) {
    console.error('Error checking permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})