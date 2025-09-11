const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Test users
const testUsers = [
  {
    email: 'hr.test@example.com',
    department: 'HR Department',
    role: 'USER'
  },
  {
    email: 'it.test@example.com', 
    department: 'IT Department',
    role: 'USER'
  },
  {
    email: 'admin@example.com',
    department: 'Administration',
    role: 'ADMIN'
  }
]

// Replicate the checkUserPermissions logic
async function checkUserPermissions(userDepartment, userRole, module) {
  try {
    // Admin users have full access to everything
    if (userRole === 'ADMIN') {
      return {
        canRead: true,
        canWrite: true,
        canDelete: true
      }
    }

    // If user has no department, default to read-only
    if (!userDepartment) {
      return {
        canRead: true,
        canWrite: false,
        canDelete: false
      }
    }

    // Get department permissions
    const permission = await prisma.departmentPermission.findFirst({
      where: {
        department: userDepartment,
        module: module,
        isActive: true
      }
    })

    if (!permission) {
      // Default permissions if no specific permission is set
      return {
        canRead: true, // Default read access
        canWrite: false,
        canDelete: false
      }
    }

    return {
      canRead: permission.canRead,
      canWrite: permission.canWrite,
      canDelete: permission.canDelete
    }
  } catch (error) {
    console.error('Error checking user permissions:', error)
    // Default to safe permissions on error
    return {
      canRead: true,
      canWrite: false,
      canDelete: false
    }
  }
}

async function testDirectPermissionCheck() {
  console.log('=== TESTING DIRECT PERMISSION CHECK ===')
  
  for (const user of testUsers) {
    console.log(`\n🔍 Direct check for: ${user.email}`)
    
    try {
      const permissions = await checkUserPermissions(
        user.department,
        user.role,
        'DIGITAL_ASSETS'
      )
      
      console.log(`   Department: ${user.department}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Permissions:`, permissions)
      
    } catch (error) {
      console.log(`   Error: ${error.message}`)
    }
  }
}

async function main() {
  try {
    await testDirectPermissionCheck()
  } catch (error) {
    console.error('Main error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()