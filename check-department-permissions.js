const { PrismaClient } = require('@prisma/client')

async function checkDepartmentPermissions() {
  const prisma = new PrismaClient()
  
  try {
    console.log('=== CHECKING DEPARTMENT PERMISSIONS ===')
    
    // Get all departments from Category table
    const departments = await prisma.category.findMany({
      where: { 
        type: 'DEPARTMENT',
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: { name: 'asc' }
    })
    
    console.log('\n📋 AVAILABLE DEPARTMENTS:')
    departments.forEach((dept, index) => {
      console.log(`${index + 1}. ID: ${dept.id}`)
      console.log(`   Name: ${dept.name}`)
      console.log(`   Description: ${dept.description || 'No description'}`)
      console.log('   ---')
    })
    
    // Check department permissions
    console.log('\n🔐 CHECKING DEPARTMENT PERMISSIONS:')
    const departmentPermissions = await prisma.departmentPermission.findMany({
      orderBy: [
        { department: 'asc' },
        { module: 'asc' }
      ]
    })
    
    if (departmentPermissions.length === 0) {
      console.log('❌ No department permissions found!')
      console.log('💡 Need to create permissions for departments to use the system.')
    } else {
      console.log(`Found ${departmentPermissions.length} permission records:`)
      departmentPermissions.forEach((perm, index) => {
        console.log(`${index + 1}. Department: ${perm.department}`)
        console.log(`   Module: ${perm.module}`)
        console.log(`   Permissions: Read=${perm.canRead}, Write=${perm.canWrite}, Delete=${perm.canDelete}`)
        console.log(`   Active: ${perm.isActive}`)
        console.log('   ---')
      })
    }
    
    // Check if any permissions exist for DIGITAL_ASSETS module
    console.log('\n🎯 DIGITAL ASSETS PERMISSIONS:')
    const digitalAssetPermissions = await prisma.departmentPermission.findMany({
      where: {
        module: 'DIGITAL_ASSETS',
        isActive: true
      }
    })
    
    if (digitalAssetPermissions.length === 0) {
      console.log('❌ No permissions found for DIGITAL_ASSETS module!')
      console.log('💡 This explains why permission testing might not work properly.')
    } else {
      digitalAssetPermissions.forEach((perm, index) => {
        console.log(`${index + 1}. Department: ${perm.department}`)
        console.log(`   Read: ${perm.canRead}, Write: ${perm.canWrite}, Delete: ${perm.canDelete}`)
      })
    }
    
    console.log('\n✅ Permission check completed!')
    
  } catch (error) {
    console.error('❌ Error checking permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDepartmentPermissions()
