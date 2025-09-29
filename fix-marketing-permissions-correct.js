const { PrismaClient } = require('@prisma/client');

async function fixMarketingPermissions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing Marketing Department Permissions...\n');
    
    // Step 1: Remove ASSETS permission (Marketing should not have access to Assets)
    console.log('1️⃣ Removing ASSETS permission for Marketing department...');
    const deletedAssets = await prisma.departmentPermission.deleteMany({
      where: {
        department: 'MARKETING',
        module: 'ASSETS'
      }
    });
    console.log(`   ✅ Deleted ${deletedAssets.count} ASSETS permission(s)`);
    
    // Step 2: Remove DOCUMENTS permission (Marketing should not have access to Documents)
    console.log('2️⃣ Removing DOCUMENTS permission for Marketing department...');
    const deletedDocuments = await prisma.departmentPermission.deleteMany({
      where: {
        department: 'MARKETING',
        module: 'DOCUMENTS'
      }
    });
    console.log(`   ✅ Deleted ${deletedDocuments.count} DOCUMENTS permission(s)`);
    
    // Step 3: Update DIGITAL_ASSETS permission to View Only
    console.log('3️⃣ Updating DIGITAL_ASSETS permission to View Only...');
    const updatedDigitalAssets = await prisma.departmentPermission.updateMany({
      where: {
        department: 'MARKETING',
        module: 'DIGITAL_ASSETS'
      },
      data: {
        canRead: true,
        canWrite: false,  // Changed from true to false (View Only)
        canDelete: false,
        isActive: true
      }
    });
    console.log(`   ✅ Updated ${updatedDigitalAssets.count} DIGITAL_ASSETS permission(s) to View Only`);
    
    // Step 4: Verify the changes
    console.log('\n🔍 Verifying changes...');
    const finalPermissions = await prisma.departmentPermission.findMany({
      where: {
        department: 'MARKETING'
      }
    });
    
    console.log('\n📊 Final Marketing Department Permissions:');
    if (finalPermissions.length === 0) {
      console.log('❌ No permissions found for Marketing department');
    } else {
      finalPermissions.forEach(perm => {
        console.log(`\n📋 Module: ${perm.module}`);
        console.log(`   📖 Can Read: ${perm.canRead ? '✅' : '❌'}`);
        console.log(`   ✏️  Can Write: ${perm.canWrite ? '✅' : '❌'}`);
        console.log(`   🗑️  Can Delete: ${perm.canDelete ? '✅' : '❌'}`);
        console.log(`   🔄 Active: ${perm.isActive ? '✅' : '❌'}`);
      });
    }
    
    // Verify against expected configuration
    console.log('\n✅ Expected vs Actual:');
    const digitalAssetsPermission = finalPermissions.find(p => p.module === 'DIGITAL_ASSETS');
    const assetsPermission = finalPermissions.find(p => p.module === 'ASSETS');
    const documentsPermission = finalPermissions.find(p => p.module === 'DOCUMENTS');
    
    if (digitalAssetsPermission && 
        digitalAssetsPermission.canRead === true && 
        digitalAssetsPermission.canWrite === false && 
        digitalAssetsPermission.canDelete === false) {
      console.log('✅ Digital Assets: View Only - CORRECT');
    } else {
      console.log('❌ Digital Assets: Permission incorrect');
    }
    
    if (!assetsPermission) {
      console.log('✅ Assets: No access - CORRECT');
    } else {
      console.log('❌ Assets: Should not have access');
    }
    
    if (!documentsPermission) {
      console.log('✅ Documents: No access - CORRECT');
    } else {
      console.log('❌ Documents: Should not have access');
    }
    
    console.log('\n🎉 Marketing department permissions have been corrected!');
    console.log('📝 Summary:');
    console.log('   - Digital Assets: View Only (Read: ✅, Write: ❌, Delete: ❌)');
    console.log('   - Assets: No Access');
    console.log('   - Documents: No Access');
    
  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMarketingPermissions();
