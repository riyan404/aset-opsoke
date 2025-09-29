const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function fixLogin() {
  try {
    console.log('Starting login fix process...');
    
    // 1. Check database files
    const mainDbPath = '/home/riyan404/aset-opsoke/prisma/dev.db';
    const standaloneDbPath = '/home/riyan404/aset-opsoke/.next/standalone/prisma/dev.db';
    
    console.log('Checking database files...');
    const mainDbExists = fs.existsSync(mainDbPath);
    const standaloneDbExists = fs.existsSync(standaloneDbPath);
    
    console.log(`Main DB exists: ${mainDbExists}`);
    console.log(`Standalone DB exists: ${standaloneDbExists}`);
    
    if (mainDbExists && standaloneDbExists) {
      // 2. Copy the main database to standalone location to ensure they're in sync
      console.log('\nCopying main database to standalone location...');
      fs.copyFileSync(mainDbPath, standaloneDbPath);
      console.log('Database copied successfully');
    }
    
    // 3. Connect to the database and reset admin password
    console.log('\nConnecting to database and resetting admin password...');
    const prisma = new PrismaClient();
    
    // Hash a new password
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update admin user
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
    
    console.log('Admin password reset successfully');
    console.log('Updated user:', updatedUser);
    console.log(`New password: ${newPassword}`);
    
    // 4. Restart the application
    console.log('\nRestarting application...');
    const { execSync } = require('child_process');
    execSync('pm2 restart asset-management');
    console.log('Application restarted');
    
    console.log('\nLogin fix process completed successfully');
    console.log('Please try logging in with:');
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Password: ${newPassword}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error fixing login:', error);
  }
}

fixLogin();