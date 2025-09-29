const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'riyannalfiansyah@gmail.com' },
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:')
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`)
      console.log(`   Role: ${existingAdmin.role}`)
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Digital280', 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'riyannalfiansyah@gmail.com',
        username: 'riyannalfiansyah',
        password: hashedPassword,
        firstName: 'Riyan',
        lastName: 'Nalfiansyah',
        role: 'ADMIN',
        department: 'Administration',
        position: 'MANAGER',
        isActive: true,
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Name: ${admin.firstName} ${admin.lastName}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Department: ${admin.department}`)
    console.log(`   Position: ${admin.position}`)

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()