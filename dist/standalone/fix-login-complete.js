// Script untuk memperbaiki masalah login dengan memastikan JWT_SECRET dan kredensial admin dikonfigurasi dengan benar
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('=== FIXING LOGIN ISSUES ===');
    
    // 1. Periksa JWT_SECRET di environment
    console.log('Current JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('Current JWT_SECRET value:', process.env.JWT_SECRET || 'not set');
    
    // 2. Set JWT_SECRET untuk proses ini
    const jwtSecret = 'your-super-secret-jwt-key-change-this-in-production-12345';
    process.env.JWT_SECRET = jwtSecret;
    console.log('Set JWT_SECRET for current process:', jwtSecret);
    
    // 3. Cek user admin di database
    const admin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (!admin) {
      console.log('Admin user not found');
      return;
    }

    console.log('Admin user found:', {
      id: admin.id,
      email: admin.email,
      isActive: admin.isActive,
      passwordLength: admin.password?.length || 0
    });
    
    // 4. Reset password admin
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const updatedAdmin = await prisma.user.update({
      where: { id: admin.id },
      data: { 
        password: hashedPassword,
        isActive: true // Pastikan user aktif
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true
      }
    });
    
    console.log('Admin password reset successfully');
    console.log('Updated admin:', updatedAdmin);
    console.log(`New password: ${newPassword}`);
    
    // 5. Verifikasi password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log('Password verification result:', isPasswordValid);
    
    // 6. Buat token JWT untuk pengujian
    const payload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      department: admin.department
    };
    
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });
    console.log('Generated test JWT token');
    
    // Verifikasi token
    try {
      const decoded = jwt.verify(token, jwtSecret);
      console.log('JWT verification successful:', decoded ? 'Valid' : 'Invalid');
    } catch (error) {
      console.error('JWT verification failed:', error.message);
    }
    
    // 7. Buat file .env jika belum ada
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('Existing .env file found');
      
      // Periksa apakah JWT_SECRET sudah ada
      if (envContent.includes('JWT_SECRET=')) {
        // Update JWT_SECRET yang sudah ada
        envContent = envContent.replace(/JWT_SECRET=.*$/m, `JWT_SECRET="${jwtSecret}"`);
        console.log('Updated existing JWT_SECRET in .env file');
      } else {
        // Tambahkan JWT_SECRET baru
        envContent += `\nJWT_SECRET="${jwtSecret}"\n`;
        console.log('Added JWT_SECRET to existing .env file');
      }
    } else {
      // Buat file .env baru
      envContent = `JWT_SECRET="${jwtSecret}"\n`;
      console.log('Created new .env file with JWT_SECRET');
    }
    
    // Tulis file .env
    fs.writeFileSync(envPath, envContent);
    console.log('.env file saved successfully');
    
    // 8. Periksa database standalone
    const mainDbPath = path.join(process.cwd(), 'prisma/dev.db');
    const standaloneDbPath = path.join(process.cwd(), '.next/standalone/prisma/dev.db');
    const standaloneEnvPath = path.join(process.cwd(), '.next/standalone/.env');
    
    console.log('Checking database files...');
    const mainDbExists = fs.existsSync(mainDbPath);
    const standaloneDbExists = fs.existsSync(standaloneDbPath);
    
    console.log(`Main DB exists: ${mainDbExists}`);
    console.log(`Standalone DB exists: ${standaloneDbExists}`);
    
    if (mainDbExists && standaloneDbExists) {
      // Sinkronkan database
      console.log('Syncing databases...');
      fs.copyFileSync(mainDbPath, standaloneDbPath);
      console.log('Database synced successfully');
    }
    
    // 9. Buat file .env di folder standalone jika ada
    if (fs.existsSync(path.dirname(standaloneEnvPath))) {
      fs.writeFileSync(standaloneEnvPath, envContent);
      console.log('Created .env file in standalone directory');
    }
    
    // 10. Restart aplikasi
    console.log('Restarting application...');
    execSync('pm2 restart asset-management');
    console.log('Application restarted');
    
    console.log('\n=== LOGIN FIX COMPLETED ===');
    console.log('Please try logging in again with:');
    console.log('Email: ' + admin.email);
    console.log('Password: ' + newPassword);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();