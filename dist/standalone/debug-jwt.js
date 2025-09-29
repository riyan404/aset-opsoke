// Debug JWT token creation and verification
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function debugJWT() {
  try {
    console.log('=== JWT DEBUG ===');
    
    // Check environment
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
    console.log('JWT_SECRET first 10 chars:', process.env.JWT_SECRET?.substring(0, 10) || 'N/A');
    
    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'riyannalfiansyah@gmail.com' }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('\n✅ Admin user found:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    });
    
    // Create token with exact same payload as generateToken
    const payload = { 
      id: adminUser.id, 
      email: adminUser.email,
      role: adminUser.role
    };
    
    console.log('\n🔧 Token payload:', payload);
    
    // Use the JWT_SECRET from .env file
    const jwtSecret = 'your-super-secret-jwt-key-change-this-in-production-12345';
    console.log('Using JWT secret:', jwtSecret);
    
    const token = jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '1d' }
    );
    
    console.log('\n🔑 Generated token:', token);
    
    // Verify the token
    try {
      const decoded = jwt.verify(token, jwtSecret);
      console.log('\n✅ Token verification successful:', decoded);
      
      // Test with curl command
      console.log('\n📋 Curl command to test:');
      console.log(`curl -v -X GET -H "Authorization: Bearer ${token}" http://localhost:3000/api/users/me`);
    } catch (error) {
      console.log('\n❌ Token verification failed:', error.message);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugJWT();