const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestAdmin() {
  try {
    // Check if test admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    })

    if (existingAdmin) {
      console.log('✅ Test admin user already exists:')
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`)
      console.log(`   Role: ${existingAdmin.role}`)
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create test admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        department: 'Administration',
        position: 'MANAGER',
        isActive: true,
      },
    })

    console.log('✅ Test admin user created successfully!')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Name: ${admin.firstName} ${admin.lastName}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Department: ${admin.department}`)
    console.log(`   Position: ${admin.position}`)

  } catch (error) {
    console.error('❌ Error creating test admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestAdmin()
