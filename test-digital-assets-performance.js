const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDigitalAssetsPerformance() {
  console.log('🔍 Testing Digital Assets Performance...\n')
  
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
    
    // Test 4: Test with search filter
    console.log('4. Testing search performance...')
    const startSearch = Date.now()
    const searchResults = await prisma.digitalAsset.findMany({
      where: {
        isActive: true,
        OR: [
          { contentName: { contains: 'test', mode: 'insensitive' } },
          { description: { contains: 'test', mode: 'insensitive' } },
          { tags: { contains: 'test', mode: 'insensitive' } },
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
    const searchTime = Date.now() - searchSearch
    console.log(`   ✅ Search found ${searchResults.length} assets (${searchTime}ms)\n`)
    
    // Performance Analysis
    console.log('📊 Performance Analysis:')
    console.log(`   • Count query: ${countTime}ms`)
    console.log(`   • Paginated fetch (12 items): ${fetchTime}ms`)
    console.log(`   • Full fetch (${allAssets.length} items): ${fetchAllTime}ms`)
    console.log(`   • Search query: ${searchTime}ms`)
    
    if (fetchAllTime > 1000) {
      console.log('\n⚠️  PERFORMANCE ISSUE DETECTED:')
      console.log(`   • Fetching all assets takes ${fetchAllTime}ms (>1s)`)
      console.log('   • This causes slow initial page load')
      console.log('   • Recommendation: Use server-side pagination instead of client-side')
    }
    
    if (fetchTime < 200) {
      console.log('\n✅ GOOD: Paginated queries are fast (<200ms)')
    }
    
    // Test database indexes
    console.log('\n5. Testing database performance with different queries...')
    
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
    
    console.log('\n🎯 RECOMMENDATIONS:')
    if (fetchAllTime > 500) {
      console.log('   1. ❌ REMOVE client-side pagination - it fetches ALL data upfront')
      console.log('   2. ✅ USE server-side pagination - only fetch what\'s needed')
      console.log('   3. ✅ IMPLEMENT infinite scroll or proper pagination')
    }
    
    if (searchTime > 300) {
      console.log('   4. ✅ ADD database indexes for search fields')
    }
    
    console.log('   5. ✅ OPTIMIZE cache TTL - current 2min might be too short')
    console.log('   6. ✅ ADD loading states and skeleton UI')
    console.log('   7. ✅ IMPLEMENT image lazy loading')
    
  } catch (error) {
    console.error('❌ Error testing performance:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDigitalAssetsPerformance()
