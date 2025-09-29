const { PrismaClient } = require('@prisma/client');

async function testMarketingCorrectedPermissions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Marketing User Corrected Permissions...\n');
    
    // 1. Verify database permissions
    console.log('1️⃣ Verifying Database Permissions:');
    const marketingPermissions = await prisma.departmentPermission.findMany({
      where: {
        department: 'MARKETING'
      }
    });
    
    console.log(`Found ${marketingPermissions.length} permission(s) for Marketing department:`);
    marketingPermissions.forEach(perm => {
      console.log(`\n📋 Module: ${perm.module}`);
      console.log(`   📖 Can Read: ${perm.canRead ? '✅' : '❌'}`);
      console.log(`   ✏️  Can Write: ${perm.canWrite ? '✅' : '❌'}`);
      console.log(`   🗑️  Can Delete: ${perm.canDelete ? '✅' : '❌'}`);
      console.log(`   🔄 Active: ${perm.isActive ? '✅' : '❌'}`);
    });
    
    // 2. Check expected configuration
    console.log('\n2️⃣ Expected Configuration Check:');
    const digitalAssetsPermission = marketingPermissions.find(p => p.module === 'DIGITAL_ASSETS');
    const assetsPermission = marketingPermissions.find(p => p.module === 'ASSETS');
    const documentsPermission = marketingPermissions.find(p => p.module === 'DOCUMENTS');
    
    let configurationCorrect = true;
    
    // Digital Assets should be View Only
    if (digitalAssetsPermission) {
      if (digitalAssetsPermission.canRead === true && 
          digitalAssetsPermission.canWrite === false && 
          digitalAssetsPermission.canDelete === false) {
        console.log('✅ Digital Assets: View Only - CORRECT');
      } else {
        console.log('❌ Digital Assets: Permission incorrect');
        console.log(`   Current: Read=${digitalAssetsPermission.canRead}, Write=${digitalAssetsPermission.canWrite}, Delete=${digitalAssetsPermission.canDelete}`);
        console.log(`   Expected: Read=true, Write=false, Delete=false`);
        configurationCorrect = false;
      }
    } else {
      console.log('❌ Digital Assets: Permission missing');
      configurationCorrect = false;
    }
    
    // Assets should not exist
    if (!assetsPermission) {
      console.log('✅ Assets: No access - CORRECT');
    } else {
      console.log('❌ Assets: Should not have access');
      configurationCorrect = false;
    }
    
    // Documents should not exist
    if (!documentsPermission) {
      console.log('✅ Documents: No access - CORRECT');
    } else {
      console.log('❌ Documents: Should not have access');
      configurationCorrect = false;
    }
    
    // 3. Test Marketing user
    console.log('\n3️⃣ Testing Marketing User:');
    const marketingUser = await prisma.user.findFirst({
      where: {
        email: 'marketing@test.com'
      }
    });
    
    if (marketingUser) {
      console.log(`👤 Marketing User Found:`);
      console.log(`   📧 Email: ${marketingUser.email}`);
      console.log(`   🏢 Department: ${marketingUser.department}`);
      console.log(`   📋 Role: ${marketingUser.role}`);
      
      // Test permission logic simulation
      console.log('\n4️⃣ Permission Logic Simulation:');
      
      // Simulate checkUserPermissions function
      const testModules = ['DIGITAL_ASSETS', 'ASSETS', 'DOCUMENTS'];
      
      for (const module of testModules) {
        console.log(`\n🔍 Testing ${module} module:`);
        
        const permission = marketingPermissions.find(p => p.module === module);
        
        if (!permission) {
          console.log('   📖 Can Read: ✅ (default)');
          console.log('   ✏️  Can Write: ❌ (default)');
          console.log('   🗑️  Can Delete: ❌ (default)');
          console.log('   🎯 Result: View Only (default permissions)');
        } else {
          console.log(`   📖 Can Read: ${permission.canRead ? '✅' : '❌'}`);
          console.log(`   ✏️  Can Write: ${permission.canWrite ? '✅' : '❌'}`);
          console.log(`   🗑️  Can Delete: ${permission.canDelete ? '✅' : '❌'}`);
          
          if (permission.canRead && !permission.canWrite && !permission.canDelete) {
            console.log('   🎯 Result: View Only');
          } else if (permission.canRead && permission.canWrite && !permission.canDelete) {
            console.log('   🎯 Result: Read & Write');
          } else if (permission.canRead && permission.canWrite && permission.canDelete) {
            console.log('   �� Result: Full Access');
          } else if (!permission.canRead) {
            console.log('   🎯 Result: No Access');
          }
        }
      }
      
    } else {
      console.log('❌ Marketing user not found');
      configurationCorrect = false;
    }
    
    // 5. Final summary
    console.log('\n🎯 Final Summary:');
    if (configurationCorrect) {
      console.log('✅ All permissions are correctly configured!');
      console.log('📝 Marketing department now has:');
      console.log('   - Digital Assets: View Only (can see but cannot edit)');
      console.log('   - Assets: No Access (will not appear in navigation)');
      console.log('   - Documents: No Access (will not appear in navigation)');
      console.log('\n🔧 Expected behavior in UI:');
      console.log('   - Marketing user should only see "Aset Digital" in navigation');
      console.log('   - "Aset" and "Dokumen" should not appear in navigation');
      console.log('   - In Digital Assets page, user can view but cannot add/edit items');
    } else {
      console.log('❌ Some permissions are still incorrect');
      console.log('🔧 Please check the issues mentioned above');
    }
    
  } catch (error) {
    console.error('❌ Error testing permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMarketingCorrectedPermissions();
