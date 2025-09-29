const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAndResetPassword() {
  try {
    console.log('Checking user password...\n');
    
    const user = await prisma.user.findUnique({
      where: { email: 'digitalkontenoke@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('   Current password hash:', user.password);
    
    // Test if current password works
    const testPasswords = ['password123', 'digitalkonten', 'admin123', '123456'];
    
    for (const testPassword of testPasswords) {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`   Testing "${testPassword}":`, isValid ? '✅ MATCH' : '❌ No match');
      
      if (isValid) {
        console.log(`\n✅ Current password is: "${testPassword}"`);
        return;
      }
    }
    
    // If no password matches, reset to a known password
    console.log('\n🔄 No matching password found. Resetting to "password123"...');
    
    const newPasswordHash = await bcrypt.hash('password123', 10);
    
    await prisma.user.update({
      where: { email: 'digitalkontenoke@gmail.com' },
      data: { password: newPasswordHash }
    });
    
    console.log('✅ Password reset successfully to "password123"');
    
    // Verify the new password
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'digitalkontenoke@gmail.com' }
    });
    
    const isNewPasswordValid = await bcrypt.compare('password123', updatedUser.password);
    console.log('✅ New password verification:', isNewPasswordValid ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndResetPassword();