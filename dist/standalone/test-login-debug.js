const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Cek user admin di database
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

    // Cek apakah user aktif
    if (!admin.isActive) {
      console.log('WARNING: Admin user is not active!');
    }

    // Coba login dengan kredensial admin
    const loginResponse = await fetch('http://0.0.0.0:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: admin.email,
        password: 'admin123' // Password yang diset di fix-login.js
      })
    });

    // Log status dan headers
    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', Object.fromEntries(loginResponse.headers.entries()));

    // Log response body
    const responseBody = await loginResponse.text();
    console.log('Login response body:', responseBody);

    try {
      // Parse response body jika JSON
      const jsonBody = JSON.parse(responseBody);
      console.log('Parsed JSON response:', jsonBody);

      // Jika error, cek password dengan bcrypt langsung
      if (jsonBody.error) {
        console.log('Testing password verification directly with bcrypt...');
        const isPasswordValid = await bcrypt.compare('admin123', admin.password);
        console.log('Direct password verification result:', isPasswordValid);
      }
    } catch (e) {
      console.log('Response is not valid JSON');
    }

    // Cek database standalone
    const standaloneDbPath = '/home/riyan404/aset-opsoke/.next/standalone/prisma/dev.db';
    if (fs.existsSync(standaloneDbPath)) {
      console.log('Standalone database exists at:', standaloneDbPath);
      const stats = fs.statSync(standaloneDbPath);
      console.log('Standalone database size:', stats.size, 'bytes');
      console.log('Last modified:', stats.mtime);
    } else {
      console.log('Standalone database does not exist!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();