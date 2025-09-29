const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserPermissions() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        department: true
      }
    });
    console.log('Users:', JSON.stringify(users, null, 2));

    // Get digital assets permissions
    const permissions = await prisma.departmentPermission.findMany({
      where: {
        module: 'DIGITAL_ASSETS'
      }
    });
    console.log('Digital Assets Permissions:', JSON.stringify(permissions, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPermissions();