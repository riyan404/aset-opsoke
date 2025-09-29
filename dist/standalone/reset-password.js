const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPassword() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Update user password
    const updatedUser = await prisma.user.update({
      where: { email: 'riyannalfiansyah@gmail.com' },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true
      }
    });
    
    console.log('Password reset successful for user:', JSON.stringify(updatedUser, null, 2));
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();