import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import { logActivity } from '@/lib/audit'
import { generateUniqueBarcode } from '@/lib/barcode-generator'

// Create asset
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const formData = await request.formData()
    
    // Extract form fields
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const subcategory = formData.get('subcategory') as string
    const brand = formData.get('brand') as string
    const model = formData.get('model') as string
    const serialNumber = formData.get('serialNumber') as string
    const purchaseDate = formData.get('purchaseDate') as string
    const purchasePrice = formData.get('purchasePrice') as string
    const currentValue = formData.get('currentValue') as string
    const condition = formData.get('condition') as string
    const location = formData.get('location') as string
    const department = formData.get('department') as string
    const assignedTo = formData.get('assignedTo') as string
    const warrantyUntil = formData.get('warrantyUntil') as string
    const notes = formData.get('notes') as string
    const tags = formData.get('tags') as string
    const barcode = formData.get('barcode') as string
    const photo = formData.get('photo') as File | null

    if (!name || !category || !location) {
      return NextResponse.json(
        { error: 'Name, category, and location are required' },
        { status: 400 }
      )
    }

    // Check if serial number or barcode already exists
    if (serialNumber) {
      const existingAsset = await prisma.asset.findUnique({
        where: { serialNumber },
      })
      if (existingAsset) {
        return NextResponse.json(
          { error: 'Asset with this serial number already exists' },
          { status: 409 }
        )
      }
    }

    // Generate barcode automatically if not provided
    let finalBarcode = barcode
    if (!finalBarcode) {
      try {
        finalBarcode = await generateUniqueBarcode({ category })
      } catch (barcodeError) {
        console.error('Error generating barcode:', barcodeError)
        return NextResponse.json(
          { error: 'Failed to generate barcode' },
          { status: 500 }
        )
      }
    }

    // Check if barcode already exists (for manually provided barcodes)
    if (barcode) {
      const existingAsset = await prisma.asset.findUnique({
        where: { barcode: finalBarcode },
      })
      if (existingAsset) {
        return NextResponse.json(
          { error: 'Asset with this barcode already exists' },
          { status: 409 }
        )
      }
    }

    // Handle photo upload if provided
    let photoPath = null
    if (photo && photo.size > 0) {
      try {
        // Create uploads directory if it doesn't exist
        const fs = require('fs')
        const path = require('path')
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'assets')
        
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }

        // Generate unique filename
        const timestamp = Date.now()
        const fileExtension = photo.name.split('.').pop() || 'jpg'
        const fileName = `asset_${timestamp}.${fileExtension}`
        const filePath = path.join(uploadsDir, fileName)

        // Save file
        const buffer = Buffer.from(await photo.arrayBuffer())
        fs.writeFileSync(filePath, buffer)
        
        photoPath = `/uploads/assets/${fileName}`
      } catch (photoError) {
        console.error('Error saving photo:', photoError)
        // Continue without photo if upload fails
      }
    }

    // Create asset
    const asset = await prisma.asset.create({
      data: {
        name,
        description,
        category,
        subcategory,
        brand,
        model,
        serialNumber,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        currentValue: currentValue ? parseFloat(currentValue) : null,
        condition: condition || 'GOOD',
        location,
        department,
        assignedTo,
        warrantyUntil: warrantyUntil ? new Date(warrantyUntil) : null,
        notes,
        tags,
        barcode: finalBarcode,
        photoPath,
        createdById: (request as any).user.id,
        updatedById: (request as any).user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Log activity
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await logActivity(
      (request as any).user.id,
      'CREATE',
      'Asset',
      asset.id,
      null,
      { name, category, location },
      ipAddress,
      userAgent
    )

    return NextResponse.json({
      asset,
      message: 'Asset created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Create asset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// Get assets
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const condition = searchParams.get('condition') || ''
    const location = searchParams.get('location') || ''
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    const where = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
            { brand: { contains: search } },
            { model: { contains: search } },
            { serialNumber: { contains: search } },
            { barcode: { contains: search } },
          ],
        } : {},
        category ? { category: { contains: category } } : {},
        condition ? { condition: condition as any } : {},
        location ? { location: { contains: location } } : {},
        // Default to showing only active assets unless explicitly requested otherwise
        isActive !== null ? { isActive: isActive === 'true' } : { isActive: true },
      ],
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          updatedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.asset.count({ where }),
    ])

    return NextResponse.json({
      assets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Get assets error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})