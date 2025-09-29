const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Check database URL
    console.log('Database URL:', process.env.DATABASE_URL || 'Not set in environment');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true
      }
    });
    
    console.log(`Found ${users.length} users in database:`);
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}): ${user.role}, Active: ${user.isActive}`);
    });
    
    // Check if there are any permissions
    const permissions = await prisma.permission.findMany();
    console.log(`\nFound ${permissions.length} permissions in database`);
    
    // Check if there are any assets
    const assets = await prisma.asset.findMany();
    console.log(`Found ${assets.length} assets in database`);
    
    // Check database file location
    console.log('\nChecking database file location...');
    const fs = require('fs');
    const path = require('path');
    
    // Common locations for SQLite database
    const possibleLocations = [
      '/home/riyan404/aset-opsoke/prisma/dev.db',
      '/home/riyan404/aset-opsoke/.next/standalone/prisma/dev.db',
      '/home/riyan404/aset-opsoke/prisma/dev.db.backup.20250915225410'
    ];
    
    possibleLocations.forEach(location => {
      try {
        const stats = fs.statSync(location);
        console.log(`Database file found at ${location}`);
        console.log(`- Size: ${stats.size} bytes`);
        console.log(`- Last modified: ${stats.mtime}`);
      } catch (err) {
        console.log(`Database file not found at ${location}`);
      }
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();