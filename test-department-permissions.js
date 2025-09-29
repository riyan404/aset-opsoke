const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testDepartmentPermissions() {
  console.log('🧪 Starting Department Permissions Testing...\n')

  try {
    // Step 1: Create Test Departments (using User table department field)
    console.log('📁 Step 1: Creating Test Users with Different Departments')
    console.log('=' .repeat(50))

    const testUsers = [
      {
        firstName: 'Marketing',
        lastName: 'User',
        username: 'marketing_user',
        email: 'marketing.test@company.com',
        department: 'Marketing',
        role: 'USER'
      },
      {
        firstName: 'Finance',
        lastName: 'User',
        username: 'finance_user',
        email: 'finance.test@company.com',
        department: 'Finance',
        role: 'USER'
      },
      {
        firstName: 'HR',
        lastName: 'User',
        username: 'hr_user',
        email: 'hr.test@company.com',
        department: 'HR',
        role: 'USER'
      },
      {
        firstName: 'IT',
        lastName: 'Admin',
        username: 'it_admin',
        email: 'it.test@company.com',
        department: 'IT',
        role: 'ADMIN'
      }
    ]

    const hashedPassword = await bcrypt.hash('testpassword123', 10)
    const createdUsers = []

    for (const userData of testUsers) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        })

        if (existingUser) {
          console.log(`   ✅ User "${userData.email}" already exists`)
          createdUsers.push(existingUser)
        } else {
          const newUser = await prisma.user.create({
            data: {
              ...userData,
              password: hashedPassword,
              isActive: true
            }
          })
          console.log(`   ✅ Created user: ${newUser.firstName} ${newUser.lastName} (${newUser.department})`)
          createdUsers.push(newUser)
        }
      } catch (error) {
        console.log(`   ❌ Error creating user ${userData.email}:`, error.message)
      }
    }

    console.log(`\n📊 Total test users: ${createdUsers.length}\n`)

    // Step 2: Configure Department Permissions
    console.log('🔐 Step 2: Configuring Department Permissions')
    console.log('=' .repeat(50))

    const permissionConfigs = [
      {
        department: 'Marketing',
        module: 'ASSETS',
        canRead: true,
        canWrite: false,
        canDelete: false
      },
      {
        department: 'Marketing',
        module: 'DIGITAL_ASSETS',
        canRead: true,
        canWrite: true,
        canDelete: true
      },
      {
        department: 'Finance',
        module: 'ASSETS',
        canRead: true,
        canWrite: true,
        canDelete: false
      },
      {
        department: 'Finance',
        module: 'DOCUMENTS',
        canRead: true,
        canWrite: true,
        canDelete: true
      },
      {
        department: 'HR',
        module: 'ASSETS',
        canRead: true,
        canWrite: false,
        canDelete: false
      },
      {
        department: 'HR',
        module: 'DOCUMENTS',
        canRead: true,
        canWrite: false,
        canDelete: false
      },
      {
        department: 'IT',
        module: 'ASSETS',
        canRead: true,
        canWrite: true,
        canDelete: true
      },
      {
        department: 'IT',
        module: 'DIGITAL_ASSETS',
        canRead: true,
        canWrite: true,
        canDelete: true
      },
      {
        department: 'IT',
        module: 'DOCUMENTS',
        canRead: true,
        canWrite: true,
        canDelete: true
      }
    ]

    for (const config of permissionConfigs) {
      try {
        const existingPermission = await prisma.departmentPermission.findUnique({
          where: {
            department_module: {
              department: config.department,
              module: config.module
            }
          }
        })

        if (existingPermission) {
          await prisma.departmentPermission.update({
            where: {
              department_module: {
                department: config.department,
                module: config.module
              }
            },
            data: {
              canRead: config.canRead,
              canWrite: config.canWrite,
              canDelete: config.canDelete,
              createdById: createdUsers.find(u => u.department === config.department)?.id || createdUsers[0].id
            }
          })
          console.log(`   ✅ Updated permission: ${config.department} - ${config.module}`)
        } else {
          await prisma.departmentPermission.create({
            data: {
              department: config.department,
              module: config.module,
              canRead: config.canRead,
              canWrite: config.canWrite,
              canDelete: config.canDelete,
              createdById: createdUsers.find(u => u.department === config.department)?.id || createdUsers[0].id
            }
          })
          console.log(`   ✅ Created permission: ${config.department} - ${config.module}`)
        }

        const accessLevel = config.canWrite && config.canDelete ? 'Full Access' : 
                           config.canWrite ? 'Read/Write' : 
                           config.canRead ? 'Read Only' : 'No Access'
        console.log(`      📋 ${config.department} - ${config.module}: ${accessLevel}`)
      } catch (error) {
        console.log(`   ❌ Error configuring permission ${config.department}-${config.module}:`, error.message)
      }
    }

    console.log('')

    // Step 3: Verify Permission Configuration
    console.log('🔍 Step 3: Verifying Permission Configuration')
    console.log('=' .repeat(50))

    const departments = ['Marketing', 'Finance', 'HR', 'IT']
    for (const dept of departments) {
      console.log(`   📋 ${dept} Department Permissions:`)
      
      const permissions = await prisma.departmentPermission.findMany({
        where: { department: dept }
      })

      if (permissions.length > 0) {
        permissions.forEach(perm => {
          const accessLevel = perm.canWrite && perm.canDelete ? '✅ Full Access' : 
                             perm.canWrite ? '📝 Read/Write' : 
                             perm.canRead ? '👁️ Read Only' : '❌ No Access'
          console.log(`      ${perm.module}: ${accessLevel}`)
        })
      } else {
        console.log(`      ❌ No permissions configured`)
      }
      console.log('')
    }

    // Step 4: Create Test Assets for Permission Testing
    console.log('📦 Step 4: Creating Test Assets for Permission Testing')
    console.log('=' .repeat(50))

    const testAssets = [
      {
        name: 'Marketing Laptop',
        category: 'Electronics',
        location: 'Marketing Office',
        department: 'Marketing',
        createdById: createdUsers.find(u => u.department === 'Marketing')?.id || createdUsers[0].id
      },
      {
        name: 'Finance Server',
        category: 'IT Equipment',
        location: 'Server Room',
        department: 'Finance',
        createdById: createdUsers.find(u => u.department === 'Finance')?.id || createdUsers[0].id
      }
    ]

    for (const assetData of testAssets) {
      try {
        const existingAsset = await prisma.asset.findFirst({
          where: { name: assetData.name }
        })

        if (!existingAsset) {
          const newAsset = await prisma.asset.create({
            data: {
              ...assetData,
              updatedById: assetData.createdById
            }
          })
          console.log(`   ✅ Created test asset: ${newAsset.name}`)
        } else {
          console.log(`   ✅ Test asset "${assetData.name}" already exists`)
        }
      } catch (error) {
        console.log(`   ❌ Error creating asset ${assetData.name}:`, error.message)
      }
    }

    // Step 5: Display Test Summary
    console.log('\n📊 Step 5: Test Summary')
    console.log('=' .repeat(50))
    console.log(`✅ Test users created: ${createdUsers.length}`)
    console.log(`✅ Permission configurations: ${permissionConfigs.length}`)
    console.log('')
    console.log('🔐 Permission Matrix:')
    console.log('Department | Assets    | Documents | Digital Assets')
    console.log('---------- | --------- | --------- | --------------')
    console.log('Marketing  | Read Only | -         | Full Access   ')
    console.log('Finance    | Read/Write| Full      | -             ')
    console.log('HR         | Read Only | Read Only | -             ')
    console.log('IT         | Full      | Full      | Full          ')
    console.log('')
    console.log('👥 Test Users Created:')
    createdUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - ${user.department} - ${user.role}`)
    })
    console.log('')
    console.log('🔑 Test Login Credentials:')
    console.log('   Email: [any of the emails above]')
    console.log('   Password: testpassword123')
    console.log('')
    console.log('✅ Department Permissions testing setup completed!')
    console.log('🚀 Next Steps:')
    console.log('   1. Login with different users')
    console.log('   2. Test access to different modules')
    console.log('   3. Verify permissions are enforced correctly')

  } catch (error) {
    console.error('❌ Error during testing:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testDepartmentPermissions()