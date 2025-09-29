const { PrismaClient } = require('@prisma/client')

async function checkRealDepartments() {
  const prisma = new PrismaClient()
  
  try {
    console.log('=== CHECKING REAL DEPARTMENTS ===')
    
    // Get all departments from Category table
    const departments = await prisma.category.findMany({
      where: { 
        type: 'DEPARTMENT',
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        isActive: true
      },
      orderBy: { name: 'asc' }
    })
    
    console.log('\n📋 DEPARTMENTS FOUND:')
    if (departments.length === 0) {
      console.log('❌ No departments found in database!')
    } else {
      departments.forEach((dept, index) => {
        console.log(`${index + 1}. ID: ${dept.id}`)
        console.log(`   Name: ${dept.name}`)
        console.log(`   Description: ${dept.description || 'No description'}`)
        console.log(`   Active: ${dept.isActive}`)
        console.log('   ---')
      })
    }
    
    // Check if there are any department permissions
    console.log('\n🔐 CHECKING DEPARTMENT PERMISSIONS:')
    const departmentPermissions = await prisma.departmentPermission.findMany({
      include: {
        department: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    })
    
    if (departmentPermissions.length === 0) {
      console.log('❌ No department permissions found!')
    } else {
      departmentPermissions.forEach((perm, index) => {
        console.log(`${index + 1}. Department: ${perm.department?.name || 'Unknown'} (${perm.departmentId})`)
        console.log(`   Module: ${perm.module}`)
        console.log(`   Permissions: Read=${perm.canRead}, Write=${perm.canWrite}, Delete=${perm.canDelete}`)
        console.log('   ---')
      })
    }
    
    console.log('\n✅ Department check completed!')
    
  } catch (error) {
    console.error('❌ Error checking departments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRealDepartments()
