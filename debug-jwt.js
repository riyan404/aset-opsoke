// Debug JWT token creation and verification
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function debugJWT() {
  try {
    console.log('=== JWT DEBUG ===')
    
    // Check environment
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)
    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0)
    console.log('JWT_SECRET first 10 chars:', process.env.JWT_SECRET?.substring(0, 10) || 'N/A')
    
    // Get test user
    const testUser = await prisma.user.findUnique({
      where: { email: 'hr.test@example.com' }
    })
    
    if (!testUser) {
      console.log('❌ Test user not found')
      return
    }
    
    console.log('\n✅ Test user found:', {
      id: testUser.id,
      email: testUser.email,
      role: testUser.role,
      department: testUser.department
    })
    
    // Create token with exact same payload as generateToken
    const payload = { 
      id: testUser.id, 
      email: testUser.email,
      role: testUser.role
    }
    
    console.log('\n🔧 Token payload:', payload)
    
    // Use the same JWT_SECRET as server (.env.local takes precedence)
    const jwtSecret = 'super-secret-jwt-key-for-development-only-2024'
    
    const token = jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '1d' }
    )
    
    console.log('\n✅ JWT token created')
    console.log('Token length:', token.length)
    console.log('Token first 50 chars:', token.substring(0, 50))
    
    // Try to verify the token immediately
    console.log('\n🔍 Verifying token locally...')
    try {
      const decoded = jwt.verify(token, jwtSecret)
      console.log('✅ Token verification successful')
      console.log('Decoded payload:', decoded)
    } catch (verifyError) {
      console.log('❌ Token verification failed:', verifyError.message)
      return
    }
    
    // Test the API endpoint
    console.log('\n🧪 Testing API endpoint...')
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
      console.log('✅ Success response:', data)
    } else {
      const errorData = await response.json()
      console.log('❌ Error response:', errorData)
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugJWT()