// Script untuk memperbaiki JWT_SECRET di environment dan menguji login
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('=== FIXING JWT_SECRET ENVIRONMENT VARIABLE ===');
    
    // 1. Periksa JWT_SECRET di environment
    console.log('Current JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('Current JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
    
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
    
    // 4. Verifikasi password dengan bcrypt
    const isPasswordValid = await bcrypt.compare('admin123', admin.password);
    console.log('Password verification result:', isPasswordValid);
    
    // 5. Buat file .env jika belum ada
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
    
    // 6. Buat file .env di folder standalone jika ada
    const standaloneEnvPath = path.join(process.cwd(), '.next/standalone/.env');
    if (fs.existsSync(path.dirname(standaloneEnvPath))) {
      fs.writeFileSync(standaloneEnvPath, envContent);
      console.log('Created .env file in standalone directory');
    }
    
    // 7. Restart aplikasi
    console.log('Restarting application...');
    execSync('pm2 restart asset-management');
    console.log('Application restarted');
    
    console.log('\n=== FIXED JWT_SECRET ENVIRONMENT VARIABLE ===');
    console.log('Please try logging in again with:');
    console.log('Email: ' + admin.email);
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();