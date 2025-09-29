const { PrismaClient } = require('@prisma/client');

async function checkMarketingPermissions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Checking Marketing Department Permissions ===\n');
    
    // Check department permissions
    const deptPermissions = await prisma.departmentPermission.findMany({
      where: {
        department: 'MARKETING'
      },
      include: {
        modulePermissions: true
      }
    });
    
    console.log('Current Department Permissions for Marketing:');
    deptPermissions.forEach(dept => {
      console.log(`\nDepartment: ${dept.department}`);
      console.log(`Module Permissions:`);
      dept.modulePermissions.forEach(mod => {
        console.log(`  - Module: ${mod.module}`);
        console.log(`    Can Read: ${mod.canRead}`);
        console.log(`    Can Write: ${mod.canWrite}`);
        console.log(`    Can Delete: ${mod.canDelete}`);
      });
    });
    
    // Check Marketing user
    const marketingUser = await prisma.user.findFirst({
      where: {
        email: 'marketing@test.com'
      }
    });
    
    if (marketingUser) {
      console.log(`\n=== Marketing User Info ===`);
      console.log(`Email: ${marketingUser.email}`);
      console.log(`Department: ${marketingUser.department}`);
      console.log(`Role: ${marketingUser.role}`);
    }
    
    // Check what modules should be available based on screenshot
    console.log(`\n=== Expected Permissions (from screenshot) ===`);
    console.log(`Assets Management: View Only ✓, Can Add Items ✓`);
    console.log(`Documents Management: View Only ✓, Can Add Items ✓`);
    console.log(`Digital Assets Management: View Only ✓, Can Add Items ✓`);
    
    console.log(`\n=== Module Mapping ===`);
    console.log(`Assets Management -> ASSETS module`);
    console.log(`Documents Management -> DOCUMENTS module`);
    console.log(`Digital Assets Management -> DIGITAL_ASSETS module`);
    
  } catch (error) {
    console.error('Error checking permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMarketingPermissions();
