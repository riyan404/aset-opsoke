const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createDepartmentCategories() {
  console.log('🏢 Creating Department Categories for UI...\n')

  try {
    // Departments to create in Category table with type DEPARTMENT
    const departments = [
      {
        name: 'IT',
        description: 'Information Technology Department',
        type: 'DEPARTMENT'
      },
      {
        name: 'Finance', 
        description: 'Finance and Accounting Department',
        type: 'DEPARTMENT'
      },
      {
        name: 'HR',
        description: 'Human Resources Department', 
        type: 'DEPARTMENT'
      },
      {
        name: 'Marketing',
        description: 'Marketing and Communications Department',
        type: 'DEPARTMENT'
      }
    ]

    console.log('📋 Step 1: Creating Department Categories')
    console.log('=' .repeat(50))

    for (const dept of departments) {
      try {
        // Check if department already exists
        const existing = await prisma.category.findFirst({
          where: {
            name: dept.name,
            type: 'DEPARTMENT'
          }
        })

        if (existing) {
          console.log(`   ⚠️  Department "${dept.name}" already exists (ID: ${existing.id})`)
        } else {
          const created = await prisma.category.create({
            data: {
              name: dept.name,
              description: dept.description,
              type: dept.type,
              isActive: true,
              createdById: 'cmfla5h9t0000371jwn6q0uus' // Admin user ID
            }
          })
          console.log(`   ✅ Created department: ${created.name} (ID: ${created.id})`)
        }
      } catch (error) {
        console.log(`   ❌ Failed to create ${dept.name}: ${error.message}`)
      }
    }

    // Step 2: Verify all departments
    console.log('\n🔍 Step 2: Verifying Department Categories')
    console.log('=' .repeat(50))

    const allDepartments = await prisma.category.findMany({
      where: { type: 'DEPARTMENT' },
      orderBy: { name: 'asc' }
    })

    console.log(`📊 Total Department Categories: ${allDepartments.length}`)
    console.log('')

    allDepartments.forEach((dept, index) => {
      console.log(`${index + 1}. 🏢 ${dept.name}`)
      console.log(`   📝 ${dept.description}`)
      console.log(`   🆔 ID: ${dept.id}`)
      console.log(`   ✅ Active: ${dept.isActive}`)
      console.log(`   📅 Created: ${dept.createdAt.toLocaleString()}`)
      console.log('')
    })

    // Step 3: Update existing permissions to use correct department IDs
    console.log('🔐 Step 3: Updating Department Permissions')
    console.log('=' .repeat(50))

    // Get department mappings
    const deptMap = {}
    for (const dept of allDepartments) {
      deptMap[dept.name] = dept.id
    }

    // Update existing permissions to use department IDs instead of names
    const existingPermissions = await prisma.departmentPermission.findMany()
    
    for (const perm of existingPermissions) {
      if (deptMap[perm.department]) {
        try {
          await prisma.departmentPermission.update({
            where: { id: perm.id },
            data: { 
              department: deptMap[perm.department].toString() // Convert to string if needed
            }
          })
          console.log(`   ✅ Updated permission: ${perm.department} - ${perm.module}`)
        } catch (error) {
          console.log(`   ⚠️  Permission update skipped: ${perm.department} - ${perm.module}`)
        }
      }
    }

    console.log('\n🎉 Department Categories Setup Complete!')
    console.log('✅ Departments are now available in the UI dropdown')
    console.log('✅ Existing permissions have been updated')
    console.log('\n🚀 Next: Refresh the Categories page to see all departments')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDepartmentCategories()