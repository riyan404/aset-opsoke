const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugPermissions() {
  try {
    console.log('=== DEBUG PERMISSIONS FOR DIGITAL_ASSETS ===')
    
    // 1. Check all department permissions for DIGITAL_ASSETS
    console.log('\n1. All Department Permissions for DIGITAL_ASSETS:')
    const permissions = await prisma.departmentPermission.findMany({
      where: {
        module: 'DIGITAL_ASSETS',
        isActive: true
      },
      orderBy: { department: 'asc' }
    })
    
    if (permissions.length === 0) {
      console.log('❌ No permissions found for DIGITAL_ASSETS module!')
    } else {
      permissions.forEach(perm => {
        console.log(`   ${perm.department}: canRead=${perm.canRead}, canWrite=${perm.canWrite}, canDelete=${perm.canDelete}`)
      })
    }
    
    // 2. Check all users and their departments
    console.log('\n2. All Users and Their Departments:')
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true
      },
      orderBy: { email: 'asc' }
    })
    
    users.forEach(user => {
      console.log(`   ${user.email} (${user.firstName} ${user.lastName}) - Role: ${user.role}, Department: ${user.department}`)
    })
    
    // 3. Check all departments
    console.log('\n3. All Departments in Database:')
    const departments = await prisma.user.findMany({
      where: { isActive: true },
      select: { department: true },
      distinct: ['department']
    })
    
    departments.forEach(dept => {
      console.log(`   - ${dept.department}`)
    })
    
    // 4. Test permission check for each department
    console.log('\n4. Permission Check Results for Each Department:')
    for (const dept of departments) {
      if (dept.department) {
        const permission = await prisma.departmentPermission.findFirst({
          where: {
            department: dept.department,
            module: 'DIGITAL_ASSETS',
            isActive: true
          }
        })
        
        if (permission) {
          console.log(`   ${dept.department}: ✅ Found - canWrite=${permission.canWrite}`)
        } else {
          console.log(`   ${dept.department}: ❌ No permission record found`)
        }
      }
    }
    
    // 5. Check test users specifically
    console.log('\n5. Test Users Permission Check:')
    const testEmails = ['hr.test@example.com', 'it.test@example.com']
    
    for (const email of testEmails) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          email: true,
          role: true,
          department: true
        }
      })
      
      if (user) {
        console.log(`   ${email}:`)
        console.log(`     - Role: ${user.role}`)
        console.log(`     - Department: ${user.department}`)
        
        if (user.role === 'ADMIN') {
          console.log(`     - Permission: ✅ ADMIN (full access)`)
        } else {
          const permission = await prisma.departmentPermission.findFirst({
            where: {
              department: user.department,
              module: 'DIGITAL_ASSETS',
              isActive: true
            }
          })
          
          if (permission) {
            console.log(`     - Permission: ✅ canWrite=${permission.canWrite}`)
          } else {
            console.log(`     - Permission: ❌ No record found (default: canWrite=false)`)
          }
        }
      } else {
        console.log(`   ${email}: ❌ User not found`)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugPermissions()