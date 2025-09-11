import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, withRole } from '@/lib/middleware'
import { logActivity } from '@/lib/audit'
import { checkUserPermissions, SYSTEM_MODULES } from '@/lib/permissions'

// GET /api/digital-assets - List all digital assets with filtering
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const aspectRatio = searchParams.get('aspectRatio') || ''
    const department = searchParams.get('department') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true,
    }

    // Add search filter
    if (search) {
      where.OR = [
        { contentName: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ]
    }

    // Add aspect ratio filter
    if (aspectRatio) {
      where.aspectRatio = aspectRatio
    }

    // Optional department filter (available for all users)
    if (department && department !== 'all') {
      where.department = department
    }

    // Get total count
    const total = await prisma.digitalAsset.count({ where })

    // Get digital assets with pagination
    const digitalAssets = await prisma.digitalAsset.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    })

    return NextResponse.json({
      digitalAssets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch digital assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch digital assets' },
      { status: 500 }
    )
  }
})

// POST /api/digital-assets - Create new digital asset
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user

    // Check if user can create digital assets
    const permissions = await checkUserPermissions(user.department, user.role, SYSTEM_MODULES.DIGITAL_ASSETS)
    if (!permissions.canWrite) {
      return NextResponse.json(
        { error: 'You do not have permission to create digital assets' },
        { status: 403 }
      )
    }

    const contentType = request.headers.get('content-type')
    let data: any
    let previewFileBuffer: string | null = null
    let previewFileName: string | null = null
    let previewFileSize: number | null = null

    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData (with file upload)
      const formData = await request.formData()
      const previewFile = formData.get('previewFile') as File | null
      
      data = {
        contentName: formData.get('contentName') as string,
        description: formData.get('description') as string,
        aspectRatio: formData.get('aspectRatio') as string,
        googleDriveLink: formData.get('googleDriveLink') as string,
        tags: formData.get('tags') as string,
        department: formData.get('department') as string,
      }

      // Process uploaded file if present
      if (previewFile && previewFile.size > 0) {
        // Convert file to base64 for storage
        const bytes = await previewFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        previewFileBuffer = buffer.toString('base64')
        previewFileName = previewFile.name
        previewFileSize = previewFile.size
      }
    } else {
      // Handle JSON data (legacy support)
      data = await request.json()
      previewFileBuffer = data.previewFile
      previewFileName = data.previewFileName
      previewFileSize = data.previewFileSize
    }

    const {
      contentName,
      description,
      aspectRatio,
      googleDriveLink,
      tags,
      department,
    } = data

    // Validate required fields
    if (!contentName || !aspectRatio) {
      return NextResponse.json(
        { error: 'Content name and aspect ratio are required' },
        { status: 400 }
      )
    }

    // Validate aspect ratio
    if (!['RATIO_4_3', 'RATIO_9_16'].includes(aspectRatio)) {
      return NextResponse.json(
        { error: 'Invalid aspect ratio. Must be RATIO_4_3 or RATIO_9_16' },
        { status: 400 }
      )
    }

    // Create digital asset
    const digitalAsset = await prisma.digitalAsset.create({
      data: {
        contentName,
        description,
        aspectRatio,
        googleDriveLink,
        previewFile: previewFileBuffer,
        previewFileName,
        previewFileSize,
        tags,
        department: department || user.department || 'Digital', // Default to 'Digital' if no department
        createdById: user.id,
        updatedById: user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    // Log activity
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    await logActivity(
      user.id,
      'CREATE_DIGITAL_ASSET',
      'DigitalAsset',
      digitalAsset.id,
      null,
      digitalAsset,
      ipAddress,
      request.headers.get('user-agent') || 'unknown'
    )

    return NextResponse.json({ digitalAsset }, { status: 201 })
  } catch (error) {
    console.error('Failed to create digital asset:', error)
    return NextResponse.json(
      { error: 'Failed to create digital asset' },
      { status: 500 }
    )
  }
})

// GET /api/digital-assets/permissions - Get user permissions for digital assets