// Script untuk memperbaiki permission untuk user digitalkontenoke@gmail.com
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDigitalPermissions() {
  try {
    console.log('🔍 Mencari user digitalkontenoke@gmail.com...');
    
    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: {
        email: 'digitalkontenoke@gmail.com'
      }
    });

    if (!user) {
      console.error('❌ User digitalkontenoke@gmail.com tidak ditemukan!');
      return;
    }

    console.log('✅ User ditemukan:', user.email);
    console.log('🔍 Department:', user.department);

    // Hapus permission lama jika ada (soft delete dengan isActive = false)
    const existingPermissions = await prisma.departmentPermission.findMany({
      where: {
        department: user.department
      }
    });

    if (existingPermissions.length > 0) {
      console.log(`🗑️ Menghapus ${existingPermissions.length} permission lama...`);
      
      for (const perm of existingPermissions) {
        await prisma.departmentPermission.update({
          where: { id: perm.id },
          data: { isActive: false }
        });
      }
    }

    // Daftar modul yang akan diberikan permission
    const modules = [
      'ASSETS',
      'DOCUMENTS',
      'DIGITAL_ASSETS',
      'USERS',
      'AUDIT_LOGS',
      'REPORTS',
      'SETTINGS'
    ];

    // Buat permission baru untuk setiap modul
    console.log('🔧 Membuat permission baru untuk department:', user.department);
    
    for (const module of modules) {
      await prisma.departmentPermission.create({
        data: {
          department: user.department,
          module,
          canRead: true,
          canWrite: true,
          canDelete: module === 'SETTINGS' ? false : true, // Batasi delete untuk SETTINGS
          isActive: true,
          createdById: user.id
        }
      });
      
      console.log(`✅ Permission untuk modul ${module} berhasil dibuat`);
    }

    console.log('\n🎉 Semua permission berhasil dibuat!');
    console.log('\n📋 Ringkasan:');
    console.log(`- User: ${user.email}`);
    console.log(`- Department: ${user.department}`);
    console.log(`- Modul dengan permission: ${modules.length} modul`);
    console.log('\n✨ User sekarang memiliki akses ke semua modul yang diperlukan.');

  } catch (error) {
    console.error('❌ Terjadi kesalahan:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDigitalPermissions();