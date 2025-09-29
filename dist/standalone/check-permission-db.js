const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkPermissions() {
  try {
    console.log('🔍 Checking database permissions...')
    
    // Check users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'viewonly@test.com' },
          { email: 'canadd@test.com' }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
        department: true,
        role: true
      }
    })
    
    console.log('\n👥 Test Users:')
    users.forEach(user => {
      console.log(`- ${user.email} (${user.department}) - Role: ${user.role}`)
    })
    
    // Check department permissions
    const permissions = await prisma.departmentPermission.findMany({
      where: {
        department: {
          in: ['TEST_DEPT_VIEW', 'TEST_DEPT_ADD']
        },
        module: 'DIGITAL_ASSETS'
      }
    })
    
    console.log('\n🔐 Department Permissions:')
    permissions.forEach(perm => {
      console.log(`- ${perm.department}: canRead=${perm.canRead}, canWrite=${perm.canWrite}, canDelete=${perm.canDelete}`)
    })
    
    // Test permission check function
    const { checkUserPermissions, SYSTEM_MODULES } = require('./src/lib/permissions')
    
    console.log('\n🧪 Testing permission function:')
    
    const viewOnlyPerms = await checkUserPermissions('TEST_DEPT_VIEW', 'USER', SYSTEM_MODULES.DIGITAL_ASSETS)
    console.log('View Only User permissions:', viewOnlyPerms)
    
    const canAddPerms = await checkUserPermissions('TEST_DEPT_ADD', 'USER', SYSTEM_MODULES.DIGITAL_ASSETS)
    console.log('Can Add User permissions:', canAddPerms)
    
    console.log('\n✅ Permission check completed!')
    
  } catch (error) {
    console.error('❌ Error checking permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPermissions()
