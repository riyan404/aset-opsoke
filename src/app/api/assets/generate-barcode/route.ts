import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { generateUniqueBarcode } from '@/lib/barcode-generator'

/**
 * POST /api/assets/generate-barcode
 * Generate automatic barcode for asset based on category
 */
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { category, kuota } = body

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    // Generate unique barcode
    const barcode = await generateUniqueBarcode({
      category,
      kuota: kuota || 1000 // Default quota
    })

    return NextResponse.json({
      success: true,
      barcode,
      message: 'Barcode generated successfully'
    })

  } catch (error) {
    console.error('Generate barcode error:', error)
    return NextResponse.json(
      { error: 'Failed to generate barcode' },
      { status: 500 }
    )
  }
})