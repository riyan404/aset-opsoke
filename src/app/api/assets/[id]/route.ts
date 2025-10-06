import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import { logActivity } from '@/lib/audit'

// Get single asset
export const GET = withAuth(async (request: NextRequest) => {
  try {
    // Extract asset ID from the URL
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const assetId = pathSegments[pathSegments.length - 1]

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
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
        maintenances: {
          orderBy: { createdAt: 'desc' },
        },
        audits: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Log view activity
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await logActivity(
      (request as any).user.id,
      'VIEW',
      'Asset',
      assetId,
      null,
      { name: asset.name, category: asset.category, location: asset.location },
      ipAddress,
      userAgent
    )

    return NextResponse.json({ asset })
  } catch (error) {
    console.error('Get asset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// Update asset
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    // Extract asset ID from the URL
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const assetId = pathSegments[pathSegments.length - 1]

    const {
      name,
      description,
      category,
      subcategory,
      brand,
      model,
      serialNumber,
      purchaseDate,
      purchasePrice,
      currentValue,
      condition,
      location,
      department,
      assignedTo,
      warrantyUntil,
      notes,
      tags,
      barcode,
      isActive,
      photo,
    } = await request.json()

    // Get current asset data for audit log
    const currentAsset = await prisma.asset.findUnique({
      where: { id: assetId },
    })

    if (!currentAsset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Handle photo upload if provided
    let photoPath = currentAsset.photoPath // Keep existing photo path by default
    if (photo && photo.url && photo.filename) {
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
        const fileExtension = photo.filename.split('.').pop() || 'jpg'
        const fileName = `asset_${timestamp}.${fileExtension}`
        const filePath = path.join(uploadsDir, fileName)

        // Convert data URL to buffer and save file
        let buffer
        if (photo.url.startsWith('data:')) {
          // Handle data URL (base64)
          const base64Data = photo.url.replace(/^data:image\/[a-z]+;base64,/, '')
          buffer = Buffer.from(base64Data, 'base64')
        } else {
          // Handle blob URL - this shouldn't happen in our case, but just in case
          console.error('Unexpected photo URL format:', photo.url)
          throw new Error('Unsupported photo URL format')
        }
        
        fs.writeFileSync(filePath, buffer)
        photoPath = `/uploads/assets/${fileName}`

        console.log('Photo saved successfully:', photoPath)

        // Delete old photo if it exists
        if (currentAsset.photoPath) {
          try {
            const oldPhotoPath = path.join(process.cwd(), 'public', currentAsset.photoPath)
            if (fs.existsSync(oldPhotoPath)) {
              fs.unlinkSync(oldPhotoPath)
              console.log('Old photo deleted:', currentAsset.photoPath)
            }
          } catch (deleteError) {
            console.error('Error deleting old photo:', deleteError)
          }
        }
      } catch (photoError) {
        console.error('Error saving photo:', photoError)
        // Continue with existing photo path if upload fails
      }
    }

    // Check if serial number or barcode already exists (excluding current asset)
    if (serialNumber && serialNumber.trim() !== '' && serialNumber !== currentAsset.serialNumber) {
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

    if (barcode && barcode.trim() !== '' && barcode !== currentAsset.barcode) {
      const existingAsset = await prisma.asset.findUnique({
        where: { barcode },
      })
      if (existingAsset) {
        return NextResponse.json(
          { error: 'Asset with this barcode already exists' },
          { status: 409 }
        )
      }
    }

    // Update asset
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        name,
        description,
        category,
        subcategory,
        brand,
        model,
        serialNumber: serialNumber && serialNumber.trim() !== '' ? serialNumber : null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        currentValue: currentValue ? parseFloat(currentValue) : null,
        condition,
        location,
        department,
        assignedTo,
        warrantyUntil: warrantyUntil ? new Date(warrantyUntil) : null,
        notes,
        tags,
        barcode: barcode && barcode.trim() !== '' ? barcode : null,
        isActive,
        photoPath,
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
        updatedBy: {
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
      'UPDATE',
      'Asset',
      assetId,
      {
        name: currentAsset.name,
        condition: currentAsset.condition,
        location: currentAsset.location,
      },
      { name, condition, location },
      ipAddress,
      userAgent
    )

    return NextResponse.json({
      asset: updatedAsset,
      message: 'Asset updated successfully',
    })
  } catch (error) {
    console.error('Update asset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// Delete asset (soft delete)
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    // Extract asset ID from the URL
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const assetId = pathSegments[pathSegments.length - 1]

    // Get current asset data for audit log
    const currentAsset = await prisma.asset.findUnique({
      where: { id: assetId },
    })

    if (!currentAsset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.asset.update({
      where: { id: assetId },
      data: { 
        isActive: false,
        updatedById: (request as any).user.id,
      },
    })

    // Log activity
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await logActivity(
      (request as any).user.id,
      'DELETE',
      'Asset',
      assetId,
      { isActive: true },
      { isActive: false },
      ipAddress,
      userAgent
    )

    return NextResponse.json({
      message: 'Asset deleted successfully',
    })
  } catch (error) {
    console.error('Delete asset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})