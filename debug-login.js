const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function debugLogin() {
  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: 'riyannalfiansyah@gmail.com' },
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      passwordHash: user.password.substring(0, 10) + '...' // Show part of the hash for debugging
    });

    // Test password verification
    const testPassword = 'password123';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    
    console.log(`Password verification for '${testPassword}': ${isPasswordValid ? 'SUCCESS' : 'FAILED'}`);
    
    if (!isPasswordValid) {
      // Try to update password again for testing
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      console.log('New hashed password:', hashedPassword);
      
      await prisma.user.update({
        where: { email: user.email },
        data: { password: hashedPassword }
      });
      
      console.log('Password updated again for testing');
    }
  } catch (error) {
    console.error('Error debugging login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();