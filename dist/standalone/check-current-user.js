const { PrismaClient } = require('@prisma/client')

async function checkCurrentUser() {
  const prisma = new PrismaClient()
  
  try {
    console.log('=== CHECKING CURRENT USER STATUS ===')
    
    // Check Marketing Tester user
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: 'marketing.test@company.com' },
          { username: { contains: 'marketing' } },
          { username: { contains: 'Marketing' } }
        ]
      }
    })
    
    if (user) {
      console.log('✅ User found:')
      console.log('  ID:', user.id)
      console.log('  Email:', user.email)
      console.log('  Username:', user.username)
      console.log('  Department:', user.department)
      console.log('  Role:', user.role)
      console.log('  Active:', user.isActive)
      console.log('  Created:', user.createdAt)
    } else {
      console.log('❌ Marketing user not found!')
    }
    
    // Check all users with Marketing department
    console.log('\n=== ALL MARKETING USERS ===')
    const marketingUsers = await prisma.user.findMany({
      where: { department: 'Marketing' }
    })
    
    console.log(`Found ${marketingUsers.length} Marketing users:`)
    marketingUsers.forEach((u, i) => {
      console.log(`  ${i+1}. ${u.email} (${u.username}) - ${u.role} - Active: ${u.isActive}`)
    })
    
    // Check department permissions
    console.log('\n=== DEPARTMENT PERMISSIONS ===')
    const permissions = await prisma.departmentPermission.findMany({
      where: { 
        department: 'Marketing',
        isActive: true 
      }
    })
    
    console.log(`Found ${permissions.length} permissions for Marketing:`)
    permissions.forEach(p => {
      console.log(`  Module: ${p.module}`)
      console.log(`    Read: ${p.canRead}, Write: ${p.canWrite}, Delete: ${p.canDelete}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentUser()
