import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRole } from '@/lib/middleware'
import { logActivity } from '@/lib/audit'
import { CacheHeaders, CACHE_TAGS } from '@/lib/cache-headers'
import bcrypt from 'bcryptjs'
import { revalidateTag } from 'next/cache'

// Get user by ID (Admin only)
export const GET = withRole(['ADMIN'])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        position: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const response = NextResponse.json({ user })

    // Apply no-cache headers for user data
    const cacheHeaders = CacheHeaders.noCache()
    cacheHeaders.forEach((value, key) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// Update user (Admin only)
export const PUT = withRole(['ADMIN'])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const {
      email,
      username,
      firstName,
      lastName,
      role,
      department,
      position,
      isActive,
    } = await request.json()

    if (!email || !username || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, username, firstName, and lastName are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email or username is already taken by another user
    const duplicateUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          {
            OR: [
              { email },
              { username },
            ],
          },
        ],
      },
    })

    if (duplicateUser) {
      return NextResponse.json(
        { error: duplicateUser.email === email 
          ? 'Email is already taken by another user' 
          : 'Username is already taken by another user'
        },
        { status: 409 }
      )
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        email,
        username,
        firstName,
        lastName,
        role,
        department,
        position,
        isActive,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        position: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Log activity
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await logActivity(
      (request as any).user.id,
      'UPDATE',
      'User',
      updatedUser.id,
      existingUser,
      updatedUser,
      ipAddress,
      userAgent
    )

    // Invalidate users cache
    revalidateTag(CACHE_TAGS.USERS)

    const response = NextResponse.json({
      user: updatedUser,
      message: 'User updated successfully',
    })

    // Apply no-cache headers
    const cacheHeaders = CacheHeaders.noCache()
    cacheHeaders.forEach((value, key) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// Delete user (Admin only)
export const DELETE = withRole(['ADMIN'])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deleting the current user
    const currentUser = (request as any).user
    if (currentUser.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Use transaction to handle foreign key constraints
    await prisma.$transaction(async (tx: any) => {
      // Update Assets to remove foreign key references
      await tx.asset.updateMany({
        where: { createdById: params.id },
        data: { createdById: currentUser.id } // Transfer to current admin
      })

      await tx.asset.updateMany({
        where: { updatedById: params.id },
        data: { updatedById: currentUser.id } // Transfer to current admin
      })

      // Update Documents to remove foreign key references
      await tx.document.updateMany({
        where: { createdById: params.id },
        data: { createdById: currentUser.id } // Transfer to current admin
      })

      await tx.document.updateMany({
        where: { updatedById: params.id },
        data: { updatedById: currentUser.id } // Transfer to current admin
      })

      // Update DigitalAssets to remove foreign key references
      await tx.digitalAsset.updateMany({
        where: { createdById: params.id },
        data: { createdById: currentUser.id } // Transfer to current admin
      })

      await tx.digitalAsset.updateMany({
        where: { updatedById: params.id },
        data: { updatedById: currentUser.id } // Transfer to current admin
      })

      // Now we can safely delete the user
      // AuditLogs will be automatically deleted due to onDelete: Cascade
      await tx.user.delete({
        where: { id: params.id },
      })
    })

    // Log activity
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await logActivity(
      currentUser.id,
      'DELETE',
      'User',
      existingUser.id,
      existingUser,
      null,
      ipAddress,
      userAgent
    )

    // Invalidate users cache
    revalidateTag(CACHE_TAGS.USERS)

    const response = NextResponse.json({
      message: 'User deleted successfully',
    })

    // Apply no-cache headers
    const cacheHeaders = CacheHeaders.noCache()
    cacheHeaders.forEach((value, key) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})