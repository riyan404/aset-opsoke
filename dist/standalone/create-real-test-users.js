const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function createRealTestUsers() {
  const prisma = new PrismaClient()
  
  try {
    console.log('=== CREATING TEST USERS WITH REAL DEPARTMENTS ===')
    
    // Get available departments
    const departments = await prisma.category.findMany({
      where: { 
        type: 'DEPARTMENT',
        isActive: true 
      },
      select: {
        id: true,
        name: true
      }
    })
    
    console.log('\n📋 Available departments:')
    departments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name} (ID: ${dept.id})`)
    })
    
    // Find departments with different permissions for testing
    const marketingDept = departments.find(d => d.name === 'Marketing')
    const itDept = departments.find(d => d.name === 'IT')
    
    if (!marketingDept || !itDept) {
      console.log('❌ Required departments (Marketing, IT) not found!')
      return
    }
    
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    // Create test user with Marketing department (view only for digital assets)
    const marketingUser = await prisma.user.upsert({
      where: { email: 'marketing.test@company.com' },
      update: {
        department: marketingDept.name,
        firstName: 'Marketing',
        lastName: 'Tester',
        role: 'USER'
      },
      create: {
        email: 'marketing.test@company.com',
        username: 'marketing_test',
        password: hashedPassword,
        firstName: 'Marketing',
        lastName: 'Tester',
        department: marketingDept.name,
        role: 'USER',
        isActive: true
      }
    })
    
    // Create test user with IT department (full access)
    const itUser = await prisma.user.upsert({
      where: { email: 'it.test@company.com' },
      update: {
        department: itDept.name,
        firstName: 'IT',
        lastName: 'Tester',
        role: 'USER'
      },
      create: {
        email: 'it.test@company.com',
        username: 'it_test',
        password: hashedPassword,
        firstName: 'IT',
        lastName: 'Tester',
        department: itDept.name,
        role: 'USER',
        isActive: true
      }
    })
    
    console.log('\n✅ TEST USERS CREATED:')
    console.log(`1. Marketing User: marketing.test@company.com (password: password123)`)
    console.log(`   Department: ${marketingDept.name}`)
    console.log(`   Expected Digital Assets Permission: Read=true, Write=true, Delete=true`)
    
    console.log(`\n2. IT User: it.test@company.com (password: password123)`)
    console.log(`   Department: ${itDept.name}`)
    console.log(`   Expected Digital Assets Permission: Read=true, Write=true, Delete=true`)
    
    // Show current permissions for these departments
    console.log('\n🔐 CURRENT PERMISSIONS FOR THESE DEPARTMENTS:')
    
    const marketingPermissions = await prisma.departmentPermission.findMany({
      where: {
        department: marketingDept.name,
        module: 'DIGITAL_ASSETS',
        isActive: true
      }
    })
    
    const itPermissions = await prisma.departmentPermission.findMany({
      where: {
        department: itDept.name,
        module: 'DIGITAL_ASSETS',
        isActive: true
      }
    })
    
    console.log(`Marketing (${marketingDept.name}):`)
    if (marketingPermissions.length > 0) {
      marketingPermissions.forEach(perm => {
        console.log(`  Read: ${perm.canRead}, Write: ${perm.canWrite}, Delete: ${perm.canDelete}`)
      })
    } else {
      console.log('  ❌ No permissions found!')
    }
    
    console.log(`\nIT (${itDept.name}):`)
    if (itPermissions.length > 0) {
      itPermissions.forEach(perm => {
        console.log(`  Read: ${perm.canRead}, Write: ${perm.canWrite}, Delete: ${perm.canDelete}`)
      })
    } else {
      console.log('  ❌ No permissions found!')
    }
    
    console.log('\n✅ Real test users creation completed!')
    
  } catch (error) {
    console.error('❌ Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createRealTestUsers()
