const { PrismaClient } = require('@prisma/client');

async function checkMarketingPermissions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Checking Marketing Department Permissions ===\n');
    
    // Check department permissions for Marketing
    const deptPermissions = await prisma.departmentPermission.findMany({
      where: {
        department: 'MARKETING'
      }
    });
    
    console.log('Current Department Permissions for Marketing:');
    if (deptPermissions.length === 0) {
      console.log('❌ No permissions found for Marketing department!');
    } else {
      deptPermissions.forEach(perm => {
        console.log(`\n📋 Module: ${perm.module}`);
        console.log(`   📖 Can Read: ${perm.canRead ? '✅' : '❌'}`);
        console.log(`   ✏️  Can Write: ${perm.canWrite ? '✅' : '❌'}`);
        console.log(`   🗑️  Can Delete: ${perm.canDelete ? '✅' : '❌'}`);
        console.log(`   🔄 Active: ${perm.isActive ? '✅' : '❌'}`);
      });
    }
    
    // Check Marketing user
    const marketingUser = await prisma.user.findFirst({
      where: {
        email: 'marketing@test.com'
      }
    });
    
    if (marketingUser) {
      console.log(`\n=== Marketing User Info ===`);
      console.log(`📧 Email: ${marketingUser.email}`);
      console.log(`🏢 Department: ${marketingUser.department}`);
      console.log(`👤 Role: ${marketingUser.role}`);
    } else {
      console.log(`\n❌ Marketing user not found!`);
    }
    
    // Expected permissions based on screenshot
    console.log(`\n=== Expected Permissions (from screenshot) ===`);
    console.log(`🎯 Assets Management:`);
    console.log(`   - View Only: ✅ (canRead: true)`);
    console.log(`   - Can Add Items: ✅ (canWrite: true)`);
    console.log(`🎯 Documents Management:`);
    console.log(`   - View Only: ✅ (canRead: true)`);
    console.log(`   - Can Add Items: ✅ (canWrite: true)`);
    console.log(`🎯 Digital Assets Management:`);
    console.log(`   - View Only: ✅ (canRead: true)`);
    console.log(`   - Can Add Items: ✅ (canWrite: true)`);
    
    console.log(`\n=== Required Database Entries ===`);
    console.log(`Department: MARKETING`);
    console.log(`Modules needed:`);
    console.log(`1. ASSETS - canRead: true, canWrite: true, canDelete: false`);
    console.log(`2. DOCUMENTS - canRead: true, canWrite: true, canDelete: false`);
    console.log(`3. DIGITAL_ASSETS - canRead: true, canWrite: true, canDelete: false`);
    
    // Check if we need to create/update permissions
    const requiredModules = ['ASSETS', 'DOCUMENTS', 'DIGITAL_ASSETS'];
    const existingModules = deptPermissions.map(p => p.module);
    const missingModules = requiredModules.filter(m => !existingModules.includes(m));
    
    if (missingModules.length > 0) {
      console.log(`\n⚠️  Missing permissions for modules: ${missingModules.join(', ')}`);
    }
    
    // Check for incorrect permissions
    const incorrectPermissions = deptPermissions.filter(p => {
      if (requiredModules.includes(p.module)) {
        return !(p.canRead === true && p.canWrite === true && p.canDelete === false);
      }
      return false;
    });
    
    if (incorrectPermissions.length > 0) {
      console.log(`\n⚠️  Incorrect permissions found for modules:`);
      incorrectPermissions.forEach(p => {
        console.log(`   ${p.module}: Read=${p.canRead}, Write=${p.canWrite}, Delete=${p.canDelete}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMarketingPermissions();
