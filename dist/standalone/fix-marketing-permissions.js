const { PrismaClient } = require('@prisma/client');

async function fixMarketingPermissions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Fixing Marketing Department Permissions ===\n');
    
    // First, check if Marketing user exists, if not create one
    let marketingUser = await prisma.user.findFirst({
      where: {
        email: 'marketing@test.com'
      }
    });
    
    if (!marketingUser) {
      console.log('📝 Creating Marketing user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      marketingUser = await prisma.user.create({
        data: {
          email: 'marketing@test.com',
          username: 'marketing_tester',
          password: hashedPassword,
          firstName: 'Marketing',
          lastName: 'Tester',
          role: 'USER',
          department: 'MARKETING',
          position: 'STAFF',
          isActive: true
        }
      });
      console.log('✅ Marketing user created successfully');
    } else {
      console.log('✅ Marketing user already exists');
      // Update department if needed
      if (marketingUser.department !== 'MARKETING') {
        await prisma.user.update({
          where: { id: marketingUser.id },
          data: { department: 'MARKETING' }
        });
        console.log('✅ Updated user department to MARKETING');
      }
    }
    
    // Define required permissions based on screenshot
    const requiredPermissions = [
      {
        department: 'MARKETING',
        module: 'ASSETS',
        canRead: true,
        canWrite: true,
        canDelete: false,
        isActive: true,
        createdById: marketingUser.id
      },
      {
        department: 'MARKETING',
        module: 'DOCUMENTS',
        canRead: true,
        canWrite: true,
        canDelete: false,
        isActive: true,
        createdById: marketingUser.id
      },
      {
        department: 'MARKETING',
        module: 'DIGITAL_ASSETS',
        canRead: true,
        canWrite: true,
        canDelete: false,
        isActive: true,
        createdById: marketingUser.id
      }
    ];
    
    console.log('\n📋 Creating/Updating permissions...');
    
    for (const permission of requiredPermissions) {
      try {
        // Try to create or update the permission
        const result = await prisma.departmentPermission.upsert({
          where: {
            department_module: {
              department: permission.department,
              module: permission.module
            }
          },
          update: {
            canRead: permission.canRead,
            canWrite: permission.canWrite,
            canDelete: permission.canDelete,
            isActive: permission.isActive,
            updatedAt: new Date()
          },
          create: permission
        });
        
        console.log(`✅ ${permission.module}: Read=${permission.canRead}, Write=${permission.canWrite}, Delete=${permission.canDelete}`);
      } catch (error) {
        console.error(`❌ Error setting permission for ${permission.module}:`, error.message);
      }
    }
    
    // Verify the permissions were set correctly
    console.log('\n🔍 Verifying permissions...');
    const verifyPermissions = await prisma.departmentPermission.findMany({
      where: {
        department: 'MARKETING'
      }
    });
    
    console.log('\n📊 Final Marketing Department Permissions:');
    verifyPermissions.forEach(perm => {
      console.log(`📋 ${perm.module}:`);
      console.log(`   📖 Can Read: ${perm.canRead ? '✅' : '❌'}`);
      console.log(`   ✏️  Can Write: ${perm.canWrite ? '✅' : '❌'}`);
      console.log(`   🗑️  Can Delete: ${perm.canDelete ? '✅' : '❌'}`);
      console.log(`   🔄 Active: ${perm.isActive ? '✅' : '❌'}`);
    });
    
    console.log('\n🎉 Marketing department permissions have been configured successfully!');
    console.log('📝 Summary:');
    console.log('   - Assets Management: View Only ✅, Can Add Items ✅');
    console.log('   - Documents Management: View Only ✅, Can Add Items ✅');
    console.log('   - Digital Assets Management: View Only ✅, Can Add Items ✅');
    
  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMarketingPermissions();
