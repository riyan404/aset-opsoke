const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkPasswordHash() {
  try {
    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'riyannalfiansyah@gmail.com' },
    });

    if (!adminUser) {
      console.log('User not found');
      return;
    }

    console.log('User found:', {
      id: adminUser.id,
      email: adminUser.email,
      username: adminUser.username,
      role: adminUser.role,
      isActive: adminUser.isActive,
      passwordHash: adminUser.password // Show full hash for debugging
    });

    // Test password verification directly
    const testPassword = 'password123';
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
    console.log(`Password verification for '${testPassword}': ${isPasswordValid ? 'SUCCESS' : 'FAILED'}`);

    // Create a new hash with the same password and compare
    const newHash = await bcrypt.hash(testPassword, 12);
    console.log('New hash created:', newHash);
    
    // Compare the new hash with the stored hash
    console.log('Comparing hashes:');
    console.log('Stored hash:', adminUser.password);
    console.log('New hash:   ', newHash);
    console.log('Hash length (stored):', adminUser.password.length);
    console.log('Hash length (new):   ', newHash.length);
    
    // Update password with new hash for testing
    console.log('\nUpdating password with new hash...');
    await prisma.user.update({
      where: { email: adminUser.email },
      data: { password: newHash }
    });
    
    console.log('Password updated with new hash');
    
    // Verify again after update
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'riyannalfiansyah@gmail.com' },
    });
    
    const isUpdatedPasswordValid = await bcrypt.compare(testPassword, updatedUser.password);
    console.log(`Password verification after update: ${isUpdatedPasswordValid ? 'SUCCESS' : 'FAILED'}`);
    
  } catch (error) {
    console.error('Error checking password hash:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPasswordHash();