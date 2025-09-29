// Script untuk memperbaiki permission untuk user digitalkontenoke@gmail.com sesuai dengan UI
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDigitalPermissionsUI() {
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

    // Buat permission baru sesuai dengan UI screenshot
    // Berdasarkan screenshot, hanya Digital Assets yang memiliki checkbox tercentang
    const modules = [
      { name: 'ASSETS', canRead: false, canWrite: false, canDelete: false },
      { name: 'DOCUMENTS', canRead: false, canWrite: false, canDelete: false },
      { name: 'DIGITAL_ASSETS', canRead: true, canWrite: true, canDelete: true },
      { name: 'USERS', canRead: false, canWrite: false, canDelete: false },
      { name: 'AUDIT_LOGS', canRead: false, canWrite: false, canDelete: false },
      { name: 'REPORTS', canRead: false, canWrite: false, canDelete: false },
      { name: 'SETTINGS', canRead: false, canWrite: false, canDelete: false }
    ];

    // Buat permission baru untuk setiap modul menggunakan upsert
    console.log('🔧 Mengupdate permission untuk department:', user.department);
    
    for (const module of modules) {
      await prisma.departmentPermission.upsert({
        where: {
          department_module: {
            department: user.department,
            module: module.name
          }
        },
        update: {
          canRead: module.canRead,
          canWrite: module.canWrite,
          canDelete: module.canDelete,
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          department: user.department,
          module: module.name,
          canRead: module.canRead,
          canWrite: module.canWrite,
          canDelete: module.canDelete,
          isActive: true,
          createdById: user.id
        }
      });
      
      console.log(`✅ Permission untuk modul ${module.name} berhasil diupdate dengan canRead: ${module.canRead}, canWrite: ${module.canWrite}, canDelete: ${module.canDelete}`);
    }

    console.log('\n🎉 Semua permission berhasil diupdate!');
    console.log('\n📋 Ringkasan:');
    console.log(`- User: ${user.email}`);
    console.log(`- Department: ${user.department}`);
    console.log(`- Modul dengan permission aktif: DIGITAL_ASSETS`);
    console.log('\n✨ User sekarang hanya memiliki akses ke modul Digital Assets sesuai dengan screenshot.');

  } catch (error) {
    console.error('❌ Terjadi kesalahan:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDigitalPermissionsUI();