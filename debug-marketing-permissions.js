const { PrismaClient } = require('@prisma/client');

async function debugMarketingPermissions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Debugging Marketing Department Permissions...\n');
    
    // Check current permissions in database
    console.log('📊 Current Database Permissions for Marketing:');
    const currentPermissions = await prisma.departmentPermission.findMany({
      where: {
        department: 'MARKETING'
      }
    });
    
    if (currentPermissions.length === 0) {
      console.log('❌ No permissions found for Marketing department');
    } else {
      currentPermissions.forEach(perm => {
        console.log(`\n📋 Module: ${perm.module}`);
        console.log(`   📖 Can Read: ${perm.canRead ? '✅' : '❌'}`);
        console.log(`   ✏️  Can Write: ${perm.canWrite ? '✅' : '❌'}`);
        console.log(`   🗑️  Can Delete: ${perm.canDelete ? '✅' : '❌'}`);
        console.log(`   🔄 Active: ${perm.isActive ? '✅' : '❌'}`);
      });
    }
    
    // Based on user's clarification, Marketing should only have:
    // - Digital Assets: View Only (canRead: true, canWrite: false, canDelete: false)
    // - Assets: NO ACCESS
    // - Documents: NO ACCESS
    
    console.log('\n🎯 Expected Permissions (based on user clarification):');
    console.log('✅ Digital Assets: View Only (canRead: true, canWrite: false, canDelete: false)');
    console.log('❌ Assets: NO ACCESS (should not exist in database)');
    console.log('❌ Documents: NO ACCESS (should not exist in database)');
    
    // Check what needs to be fixed
    console.log('\n⚠️  Issues Found:');
    
    const digitalAssetsPermission = currentPermissions.find(p => p.module === 'DIGITAL_ASSETS');
    const assetsPermission = currentPermissions.find(p => p.module === 'ASSETS');
    const documentsPermission = currentPermissions.find(p => p.module === 'DOCUMENTS');
    
    if (!digitalAssetsPermission) {
      console.log('❌ Missing Digital Assets permission');
    } else if (digitalAssetsPermission.canWrite === true || digitalAssetsPermission.canDelete === true) {
      console.log('❌ Digital Assets permission incorrect - should be View Only');
      console.log(`   Current: Read=${digitalAssetsPermission.canRead}, Write=${digitalAssetsPermission.canWrite}, Delete=${digitalAssetsPermission.canDelete}`);
      console.log(`   Expected: Read=true, Write=false, Delete=false`);
    } else {
      console.log('✅ Digital Assets permission is correct');
    }
    
    if (assetsPermission) {
      console.log('❌ Assets permission should not exist - Marketing should not have access');
    }
    
    if (documentsPermission) {
      console.log('❌ Documents permission should not exist - Marketing should not have access');
    }
    
    // Check Marketing user
    const marketingUser = await prisma.user.findFirst({
      where: {
        email: 'marketing@test.com'
      }
    });
    
    if (marketingUser) {
      console.log(`\n👤 Marketing User Info:`);
      console.log(`   📧 Email: ${marketingUser.email}`);
      console.log(`   🏢 Department: ${marketingUser.department}`);
      console.log(`   📋 Role: ${marketingUser.role}`);
    }
    
    console.log('\n🔧 Actions Needed:');
    console.log('1. Remove ASSETS permission for Marketing department');
    console.log('2. Remove DOCUMENTS permission for Marketing department');
    console.log('3. Update DIGITAL_ASSETS permission to View Only (canRead: true, canWrite: false, canDelete: false)');
    
  } catch (error) {
    console.error('❌ Error debugging permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugMarketingPermissions();
