import { prisma } from '@/lib/prisma'

/**
 * Generate automatic barcode for assets
 * Format: nomor.order.kuota.tahun.kategori
 * Example: 001.001.100.2024.COMP (for Computer & IT Equipment)
 */

// Category code mapping
const CATEGORY_CODES: Record<string, string> = {
  'Computer & IT Equipment': 'COMP',
  'Office Furniture': 'FURN',
  'Vehicle': 'VEHI',
  'Electronic Equipment': 'ELEC',
  'Medical Equipment': 'MEDI',
  'Industrial Equipment': 'INDU',
  'Building & Infrastructure': 'BUIL',
  'Security Equipment': 'SECU',
  'Communication Equipment': 'COMM',
  'Laboratory Equipment': 'LABO',
  'Kitchen Equipment': 'KITC',
  'Cleaning Equipment': 'CLEA',
  'Sports Equipment': 'SPOR',
  'Educational Equipment': 'EDUC',
  'Other': 'OTHR'
}

interface BarcodeGenerationOptions {
  category: string
  kuota?: number // Default quota per category
}

/**
 * Get category code from category name
 */
function getCategoryCode(category: string): string {
  return CATEGORY_CODES[category] || 'OTHR'
}

/**
 * Get the next sequential number for a category in the current year
 */
async function getNextSequentialNumber(category: string, year: number): Promise<number> {
  const categoryCode = getCategoryCode(category)
  const yearStr = year.toString()
  
  // Find the highest existing barcode for this category and year
  const existingAssets = await prisma.asset.findMany({
    where: {
      barcode: {
        contains: `.${yearStr}.${categoryCode}`
      }
    },
    select: {
      barcode: true
    },
    orderBy: {
      barcode: 'desc'
    }
  })

  if (existingAssets.length === 0) {
    return 1
  }

  // Extract the sequential number from the highest barcode
  const highestBarcode = existingAssets[0].barcode
  if (!highestBarcode) return 1

  // Parse barcode format: nomor.order.kuota.tahun.kategori
  const parts = highestBarcode.split('.')
  if (parts.length !== 5) return 1

  const sequentialNumber = parseInt(parts[0], 10)
  return isNaN(sequentialNumber) ? 1 : sequentialNumber + 1
}

/**
 * Get the next order number for a category in the current year
 */
async function getNextOrderNumber(category: string, year: number): Promise<number> {
  const categoryCode = getCategoryCode(category)
  const yearStr = year.toString()
  
  // Count existing assets for this category and year
  const count = await prisma.asset.count({
    where: {
      barcode: {
        contains: `.${yearStr}.${categoryCode}`
      }
    }
  })

  return count + 1
}

/**
 * Generate barcode for asset
 */
export async function generateAssetBarcode(options: BarcodeGenerationOptions): Promise<string> {
  const { category, kuota = 1000 } = options
  const currentYear = new Date().getFullYear()
  const categoryCode = getCategoryCode(category)

  // Get next sequential number and order number
  const sequentialNumber = await getNextSequentialNumber(category, currentYear)
  const orderNumber = await getNextOrderNumber(category, currentYear)

  // Format numbers with leading zeros
  const formattedSequential = sequentialNumber.toString().padStart(3, '0')
  const formattedOrder = orderNumber.toString().padStart(3, '0')
  const formattedKuota = kuota.toString().padStart(4, '0')

  // Generate barcode: nomor.order.kuota.tahun.kategori
  const barcode = `${formattedSequential}.${formattedOrder}.${formattedKuota}.${currentYear}.${categoryCode}`

  return barcode
}

/**
 * Validate barcode format
 */
export function validateBarcodeFormat(barcode: string): boolean {
  const barcodeRegex = /^\d{3}\.\d{3}\.\d{4}\.\d{4}\.[A-Z]{4}$/
  return barcodeRegex.test(barcode)
}

/**
 * Parse barcode to extract information
 */
export function parseBarcodeInfo(barcode: string): {
  sequentialNumber: number
  orderNumber: number
  kuota: number
  year: number
  categoryCode: string
  isValid: boolean
} {
  if (!validateBarcodeFormat(barcode)) {
    return {
      sequentialNumber: 0,
      orderNumber: 0,
      kuota: 0,
      year: 0,
      categoryCode: '',
      isValid: false
    }
  }

  const parts = barcode.split('.')
  return {
    sequentialNumber: parseInt(parts[0], 10),
    orderNumber: parseInt(parts[1], 10),
    kuota: parseInt(parts[2], 10),
    year: parseInt(parts[3], 10),
    categoryCode: parts[4],
    isValid: true
  }
}

/**
 * Get category name from category code
 */
export function getCategoryFromCode(categoryCode: string): string {
  const entry = Object.entries(CATEGORY_CODES).find(([_, code]) => code === categoryCode)
  return entry ? entry[0] : 'Other'
}

/**
 * Check if barcode already exists
 */
export async function isBarcodeExists(barcode: string): Promise<boolean> {
  const existingAsset = await prisma.asset.findUnique({
    where: { barcode }
  })
  return !!existingAsset
}

/**
 * Generate unique barcode (retry if exists)
 */
export async function generateUniqueBarcode(options: BarcodeGenerationOptions): Promise<string> {
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    try {
      const barcode = await generateAssetBarcode(options)
      const exists = await isBarcodeExists(barcode)
      
      if (!exists) {
        console.log(`Barcode generated successfully: ${barcode}`)
        return barcode
      }
      
      console.log(`Barcode collision detected: ${barcode}, retrying...`)
      attempts++
      // If collision occurs, wait a bit and try again
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Error generating barcode (attempt ${attempts + 1}):`, error)
      attempts++
      if (attempts >= maxAttempts) {
        throw new Error(`Failed to generate barcode: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  throw new Error('Failed to generate unique barcode after multiple attempts')
}