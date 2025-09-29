const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDigitalAssetsPerformance() {
  console.log('🔍 Testing Digital Assets Performance (Fixed)...\n')
  
  try {
    // Test 1: Count total digital assets
    console.log('1. Counting total digital assets...')
    const startCount = Date.now()
    const totalCount = await prisma.digitalAsset.count({
      where: { isActive: true }
    })
    const countTime = Date.now() - startCount
    console.log(`   ✅ Total assets: ${totalCount} (${countTime}ms)\n`)
    
    // Test 2: Fetch first 12 assets (default pagination)
    console.log('2. Fetching first 12 assets (default pagination)...')
    const startFetch = Date.now()
    const assets = await prisma.digitalAsset.findMany({
      where: { isActive: true },
      select: {
        id: true,
        contentName: true,
        description: true,
        previewFile: true,
        previewFileName: true,
        previewFileSize: true,
        aspectRatio: true,
        googleDriveLink: true,
        tags: true,
        department: true,
        createdAt: true,
        updatedAt: true,
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
      orderBy: { createdAt: 'desc' },
      take: 12,
      skip: 0
    })
    const fetchTime = Date.now() - startFetch
    console.log(`   ✅ Fetched ${assets.length} assets (${fetchTime}ms)\n`)
    
    // Test 3: Fetch all assets (current implementation)
    console.log('3. Fetching ALL assets (current implementation)...')
    const startFetchAll = Date.now()
    const allAssets = await prisma.digitalAsset.findMany({
      where: { isActive: true },
      select: {
        id: true,
        contentName: true,
        description: true,
        previewFile: true,
        previewFileName: true,
        previewFileSize: true,
        aspectRatio: true,
        googleDriveLink: true,
        tags: true,
        department: true,
        createdAt: true,
        updatedAt: true,
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
      orderBy: { createdAt: 'desc' },
      take: 1000
    })
    const fetchAllTime = Date.now() - startFetchAll
    console.log(`   ✅ Fetched ${allAssets.length} assets (${fetchAllTime}ms)\n`)
    
    // Test 4: Test with search filter (fixed)
    console.log('4. Testing search performance...')
    const startSearch = Date.now()
    const searchResults = await prisma.digitalAsset.findMany({
      where: {
        isActive: true,
        OR: [
          { contentName: { contains: 'test' } },
          { description: { contains: 'test' } },
          { tags: { contains: 'test' } },
        ]
      },
      select: {
        id: true,
        contentName: true,
        description: true,
        tags: true,
      },
      take: 12
    })
    const searchTime = Date.now() - startSearch
    console.log(`   ✅ Search found ${searchResults.length} assets (${searchTime}ms)\n`)
    
    // Test database indexes
    console.log('5. Testing database performance with different queries...')
    
    // Test aspect ratio filter
    const startAspectRatio = Date.now()
    const aspectRatioResults = await prisma.digitalAsset.findMany({
      where: {
        isActive: true,
        aspectRatio: 'RATIO_4_3'
      },
      select: { id: true, contentName: true, aspectRatio: true },
      take: 12
    })
    const aspectRatioTime = Date.now() - startAspectRatio
    console.log(`   • Aspect ratio filter: ${aspectRatioTime}ms (${aspectRatioResults.length} results)`)
    
    // Test department filter
    const startDepartment = Date.now()
    const departmentResults = await prisma.digitalAsset.findMany({
      where: {
        isActive: true,
        department: 'Marketing'
      },
      select: { id: true, contentName: true, department: true },
      take: 12
    })
    const departmentTime = Date.now() - startDepartment
    console.log(`   • Department filter: ${departmentTime}ms (${departmentResults.length} results)`)
    
    // Performance Analysis
    console.log('\n📊 Performance Analysis:')
    console.log(`   • Count query: ${countTime}ms`)
    console.log(`   • Paginated fetch (12 items): ${fetchTime}ms`)
    console.log(`   • Full fetch (${allAssets.length} items): ${fetchAllTime}ms`)
    console.log(`   • Search query: ${searchTime}ms`)
    console.log(`   • Aspect ratio filter: ${aspectRatioTime}ms`)
    console.log(`   • Department filter: ${departmentTime}ms`)
    
    console.log('\n🎯 PERFORMANCE ISSUES IDENTIFIED:')
    
    if (fetchTime > 300) {
      console.log(`   ❌ SLOW: Paginated fetch takes ${fetchTime}ms (should be <200ms)`)
    } else {
      console.log(`   ✅ GOOD: Paginated fetch is acceptable (${fetchTime}ms)`)
    }
    
    if (fetchAllTime > 200) {
      console.log(`   ❌ MAJOR ISSUE: Full fetch takes ${fetchAllTime}ms`)
      console.log('      • This is the main cause of slow page load!')
      console.log('      • Current implementation fetches ALL data upfront')
      console.log('      • Should use server-side pagination instead')
    }
    
    console.log('\n🚀 OPTIMIZATION RECOMMENDATIONS:')
    console.log('   1. ❌ REMOVE client-side pagination (fetches all data)')
    console.log('   2. ✅ IMPLEMENT server-side pagination')
    console.log('   3. ✅ ADD skeleton loading UI')
    console.log('   4. ✅ OPTIMIZE cache TTL (increase from 2min to 5min)')
    console.log('   5. ✅ IMPLEMENT lazy loading for images')
    console.log('   6. ✅ ADD database indexes for search fields')
    
  } catch (error) {
    console.error('❌ Error testing performance:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDigitalAssetsPerformance()
