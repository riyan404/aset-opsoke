// Test login with correct credentials and see full response
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLogin() {
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
    });

    // Test login with fetch
    console.log('\nTesting login with fetch...');
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'riyannalfiansyah@gmail.com',
        password: 'password123',
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    const responseHeaders = {};
    response.headers.forEach((value, name) => {
      responseHeaders[name] = value;
    });
    console.log('Response headers:', responseHeaders);

    const responseBody = await response.text();
    console.log('Response body:', responseBody);

    try {
      const jsonBody = JSON.parse(responseBody);
      console.log('Parsed JSON response:', jsonBody);
    } catch (e) {
      console.log('Response is not valid JSON');
    }
  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();