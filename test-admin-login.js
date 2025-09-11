const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Use the same JWT_SECRET as the server (.env.local takes priority)
const jwtSecret = 'super-secret-jwt-key-for-development-only-2024'

async function testAdminLogin() {
  console.log('\n=== TESTING ADMIN LOGIN ===')
  
  try {
    // Find admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found')
      return
    }
    
    console.log('✅ Admin user found:', {
      email: adminUser.email,
      role: adminUser.role,
      department: adminUser.department
    })
    
    // Create JWT token for admin
    const tokenPayload = {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    }
    
    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '24h' })
    console.log('✅ JWT token created for admin')
    console.log('Token length:', token.length)
    
    // Test permission endpoint with admin token
    console.log('\n🧪 Testing permission endpoint with admin token...')
    const response = await fetch('http://localhost:3000/api/permissions/digital-assets', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📡 Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Admin permissions:', data.permissions)
      
      if (data.permissions.canWrite) {
        console.log('🎉 Admin has canWrite permission - button should appear!')
      } else {
        console.log('❌ Admin does not have canWrite permission')
      }
    } else {
      const errorText = await response.text()
      console.log('❌ Error response:', errorText)
    }
    
    console.log('\n📋 Login instructions:')
    console.log('1. Go to http://localhost:3000/login')
    console.log('2. Use email: admin@example.com')
    console.log('3. Use password: admin123')
    console.log('4. Navigate to /dashboard/digital-assets')
    console.log('5. The "Tambah Aset Digital" button should now appear!')
    
  } catch (error) {
    console.error('💥 Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminLogin()