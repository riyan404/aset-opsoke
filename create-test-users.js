const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    console.log('Creating test users...')

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Create user with view only permission
    const viewOnlyUser = await prisma.user.create({
      data: {
        email: 'viewonly@test.com',
        username: 'viewonly',
        password: hashedPassword,
        firstName: 'View',
        lastName: 'Only',
        role: 'USER',
        department: 'TEST_DEPT_VIEW',
        position: 'STAFF',
        isActive: true
      }
    })

    // Create user with can add items permission
    const canAddUser = await prisma.user.create({
      data: {
        email: 'canadd@test.com',
        username: 'canadd',
        password: hashedPassword,
        firstName: 'Can',
        lastName: 'Add',
        role: 'USER',
        department: 'TEST_DEPT_ADD',
        position: 'STAFF',
        isActive: true
      }
    })

    // Create department permissions for view only user
    await prisma.departmentPermission.create({
      data: {
        department: 'TEST_DEPT_VIEW',
        module: 'DIGITAL_ASSETS',
        canRead: true,
        canWrite: false,
        canDelete: false,
        createdById: viewOnlyUser.id
      }
    })

    // Create department permissions for can add user
    await prisma.departmentPermission.create({
      data: {
        department: 'TEST_DEPT_ADD',
        module: 'DIGITAL_ASSETS',
        canRead: true,
        canWrite: true,
        canDelete: true,
        createdById: canAddUser.id
      }
    })

    console.log('Test users created successfully!')
    console.log('View Only User:', {
      email: 'viewonly@test.com',
      password: 'password123',
      department: 'TEST_DEPT_VIEW',
      permissions: { canRead: true, canWrite: false, canDelete: false }
    })
    console.log('Can Add User:', {
      email: 'canadd@test.com',
      password: 'password123',
      department: 'TEST_DEPT_ADD',
      permissions: { canRead: true, canWrite: true, canDelete: true }
    })

  } catch (error) {
    console.error('Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()
