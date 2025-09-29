// Script untuk menguji login setelah perbaikan
// Gunakan fetch API bawaan Node.js dengan flag --experimental-fetch
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('=== TESTING LOGIN AFTER FIX ===');
    
    // 1. Cek user admin di database
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
      role: admin.role
    });
    
    // 2. Coba login dengan kredensial admin
    console.log('\nTesting login with admin credentials...');
    const loginResponse = await fetch('http://0.0.0.0:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: admin.email,
        password: 'admin123'
      })
    });

    // Log status dan headers
    console.log('Login response status:', loginResponse.status);
    
    // Parse response body
    const responseBody = await loginResponse.json();
    
    if (loginResponse.status === 200) {
      console.log('Login successful!');
      console.log('User data received:', {
        id: responseBody.user.id,
        email: responseBody.user.email,
        role: responseBody.user.role,
        isActive: responseBody.user.isActive
      });
      
      // Verifikasi token JWT
      console.log('\nVerifying JWT token...');
      const token = responseBody.token;
      console.log('Token received:', token ? 'Yes' : 'No');
      
      if (token) {
        try {
          const jwtSecret = 'your-super-secret-jwt-key-change-this-in-production-12345';
          const decoded = jwt.verify(token, jwtSecret);
          console.log('JWT verification successful!');
          console.log('Decoded token payload:', {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
          });
          
          // 3. Coba akses endpoint yang dilindungi
          console.log('\nTesting protected endpoint access...');
          const meResponse = await fetch('http://0.0.0.0:3000/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Protected endpoint response status:', meResponse.status);
          
          if (meResponse.status === 200) {
            const userData = await meResponse.json();
            console.log('Protected endpoint access successful!');
            console.log('User data from protected endpoint:', {
              id: userData.user.id,
              email: userData.user.email,
              role: userData.user.role
            });
          } else {
            console.log('Protected endpoint access failed!');
            console.log('Response:', await meResponse.text());
          }
        } catch (error) {
          console.error('JWT verification failed:', error.message);
        }
      }
    } else {
      console.log('Login failed!');
      console.log('Error:', responseBody.error);
    }
    
    console.log('\n=== LOGIN TEST COMPLETED ===');
    
  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();