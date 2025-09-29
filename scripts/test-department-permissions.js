// Script untuk menguji fungsi penambahan departemen dan edit permission
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDepartmentPermissions() {
  try {
    console.log('🔍 Menguji fungsi penambahan departemen dan edit permission...');
    
    // Mencari admin user untuk createdById
    console.log('\n🔍 Mencari admin user untuk createdById...');
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
        isActive: true
      }
    });
    
    if (!adminUser) {
      console.error('❌ Tidak ditemukan user dengan role ADMIN yang aktif');
      return;
    }
    
    console.log(`✅ Admin user ditemukan: ${adminUser.email} (ID: ${adminUser.id})`);
    
    // 1. Membuat departemen baru untuk pengujian
    console.log('\n1️⃣ Membuat departemen baru untuk pengujian...');
    const testDepartment = await prisma.category.create({
      data: {
        name: 'Test Department',
        description: 'Departemen untuk pengujian',
        type: 'DEPARTMENT',
        isActive: true,
        createdById: adminUser.id
      }
    });
    
    console.log(`✅ Departemen berhasil dibuat: ${testDepartment.name} (ID: ${testDepartment.id})`);
    
    // 2. Membuat permission untuk departemen baru
    console.log('\n2️⃣ Membuat permission untuk departemen baru...');
    
    const modules = [
      { name: 'ASSETS', canRead: true, canWrite: false, canDelete: false },
      { name: 'DOCUMENTS', canRead: true, canWrite: true, canDelete: false },
      { name: 'DIGITAL_ASSETS', canRead: false, canWrite: false, canDelete: false }
    ];
    
    for (const module of modules) {
      await prisma.departmentPermission.create({
        data: {
          department: testDepartment.id,
          module: module.name,
          canRead: module.canRead,
          canWrite: module.canWrite,
          canDelete: module.canDelete,
          isActive: true,
          createdById: adminUser.id
        }
      });
      
      console.log(`✅ Permission untuk modul ${module.name} berhasil dibuat dengan canRead: ${module.canRead}, canWrite: ${module.canWrite}, canDelete: ${module.canDelete}`);
    }
    
    // 3. Memeriksa permission yang telah dibuat
    console.log('\n3️⃣ Memeriksa permission yang telah dibuat...');
    
    const createdPermissions = await prisma.departmentPermission.findMany({
      where: {
        department: testDepartment.id,
        isActive: true
      }
    });
    
    console.log(`✅ Ditemukan ${createdPermissions.length} permission untuk departemen ${testDepartment.name}`);
    createdPermissions.forEach(perm => {
      console.log(`   - Module: ${perm.module}, canRead: ${perm.canRead}, canWrite: ${perm.canWrite}, canDelete: ${perm.canDelete}`);
    });
    
    // 4. Mengupdate permission untuk departemen
    console.log('\n4️⃣ Mengupdate permission untuk departemen...');
    
    // Update permission untuk DIGITAL_ASSETS
    await prisma.departmentPermission.update({
      where: {
        department_module: {
          department: testDepartment.id,
          module: 'DIGITAL_ASSETS'
        }
      },
      data: {
        canRead: true,
        canWrite: true,
        canDelete: true,
        isActive: true
      }
    });
    
    console.log(`✅ Permission untuk modul DIGITAL_ASSETS berhasil diupdate`);
    
    // 5. Memeriksa permission setelah diupdate
    console.log('\n5️⃣ Memeriksa permission setelah diupdate...');
    
    const updatedPermissions = await prisma.departmentPermission.findMany({
      where: {
        department: testDepartment.id,
        isActive: true
      }
    });
    
    console.log(`✅ Ditemukan ${updatedPermissions.length} permission untuk departemen ${testDepartment.name}`);
    updatedPermissions.forEach(perm => {
      console.log(`   - Module: ${perm.module}, canRead: ${perm.canRead}, canWrite: ${perm.canWrite}, canDelete: ${perm.canDelete}`);
    });
    
    // 6. Membersihkan data pengujian (opsional, hapus jika ingin menyimpan data pengujian)
    console.log('\n6️⃣ Membersihkan data pengujian...');
    
    // Hapus permission terlebih dahulu (foreign key constraint)
    await prisma.departmentPermission.deleteMany({
      where: {
        department: testDepartment.id
      }
    });
    
    // Hapus departemen
    await prisma.category.delete({
      where: {
        id: testDepartment.id
      }
    });
    
    console.log(`✅ Data pengujian berhasil dibersihkan`);
    
    console.log('\n🎉 Pengujian selesai! Fungsi penambahan departemen dan edit permission berjalan dengan baik.');
    console.log('\n📋 Ringkasan:');
    console.log('1. Departemen baru berhasil dibuat');
    console.log('2. Permission untuk departemen berhasil dibuat');
    console.log('3. Permission berhasil diupdate');
    console.log('4. Data pengujian berhasil dibersihkan');

  } catch (error) {
    console.error('❌ Terjadi kesalahan:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDepartmentPermissions();