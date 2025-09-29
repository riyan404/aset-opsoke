const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true
      }
    });
    console.log('Users in database:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getUsers();