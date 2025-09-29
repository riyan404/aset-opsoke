// Test permission endpoint directly
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function testPermissionEndpoint() {
  try {
    console.log('=== TESTING PERMISSION ENDPOINT ===')
    
    // Get test user
    const testUser = await prisma.user.findUnique({
      where: { email: 'hr.test@example.com' }
    })
    
    if (!testUser) {
      console.log('❌ Test user not found')
      return
    }
    
    console.log('✅ Test user found:', {
      email: testUser.email,
      role: testUser.role,
      department: testUser.department
    })
    
    // Create JWT token with same payload as generateToken
    const token = jwt.sign(
      { 
        id: testUser.id, 
        email: testUser.email,
        role: testUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )
    
    console.log('✅ JWT token created')
    
    console.log('\n🧪 Testing endpoint with generated token...')
     
     const response = await fetch('http://localhost:3001/api/permissions/digital-assets', {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json'
       }
     })
    
    console.log('📡 Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Permission response:', data)
    } else {
      const errorText = await response.text()
      console.log('❌ Error response:', errorText)
    }
    
  } catch (error) {
    console.error('💥 Error testing endpoint:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Also test environment variables
console.log('🔍 Environment check:')
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0)

testPermissionEndpoint()