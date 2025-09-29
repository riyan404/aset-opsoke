const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserPermissions() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'digitalkontenoke@gmail.com' }
    });
    
    if (!user) {
      console.log('User tidak ditemukan');
      return;
    }
    
    console.log('User Info:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Active:', user.isActive);
    console.log('- Department:', user.department);
    
    if (!user.department) {
      console.log('\n❌ User tidak memiliki department yang di-assign!');
      return;
    }
    
    // Check department permissions
    console.log('\nDepartment Permissions:');
    const departmentPermissions = await prisma.departmentPermission.findMany({
      where: { 
        department: user.department,
        isActive: true
      }
    });
    
    if (departmentPermissions.length === 0) {
      console.log('- Tidak ada permissions untuk department:', user.department);
    } else {
      departmentPermissions.forEach(perm => {
        console.log(`- ${perm.module}:`);
        console.log(`  - Read: ${perm.canRead}`);
        console.log(`  - Write: ${perm.canWrite}`);
        console.log(`  - Delete: ${perm.canDelete}`);
      });
    }
    
    // Check digital assets specifically
    console.log('\nChecking DIGITAL_ASSETS permissions:');
    const digitalAssetPerm = departmentPermissions.find(p => p.module === 'DIGITAL_ASSETS');
    
    if (!digitalAssetPerm) {
      console.log('❌ Tidak ada permissions untuk DIGITAL_ASSETS module');
    } else {
      console.log('✅ DIGITAL_ASSETS permissions found:');
      console.log('  - Read:', digitalAssetPerm.canRead);
      console.log('  - Write:', digitalAssetPerm.canWrite);
      console.log('  - Delete:', digitalAssetPerm.canDelete);
    }
    
    // Check if user can create digital assets
    if (digitalAssetPerm && digitalAssetPerm.canWrite) {
      console.log('\n✅ User DAPAT menambah digital assets');
    } else {
      console.log('\n❌ User TIDAK DAPAT menambah digital assets - permission canWrite = false atau tidak ada');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPermissions();