const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDigitalAssetCreation() {
  try {
    console.log('Testing Digital Asset Creation...\n');
    
    // First, get the user
    const user = await prisma.user.findUnique({
      where: { email: 'digitalkontenoke@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ User tidak ditemukan');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('   Department:', user.department);
    console.log('   Role:', user.role);
    
    // Create a test digital asset directly in database
    const testAsset = await prisma.digitalAsset.create({
      data: {
        contentName: 'Test Digital Asset - ' + new Date().toISOString(),
        description: 'Test asset created via script to verify database functionality',
        aspectRatio: 'RATIO_4_3',
        googleDriveLink: 'https://drive.google.com/test',
        tags: JSON.stringify(['test', 'verification']),
        department: user.department || 'Digital',
        createdById: user.id,
        updatedById: user.id,
      },
      include: {
        createdBy: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    console.log('\n✅ Test digital asset created successfully:');
    console.log('   ID:', testAsset.id);
    console.log('   Name:', testAsset.contentName);
    console.log('   Department:', testAsset.department);
    console.log('   Created by:', testAsset.createdBy?.email);
    console.log('   Created at:', testAsset.createdAt);
    
    // Verify it can be retrieved
    const retrievedAsset = await prisma.digitalAsset.findUnique({
      where: { id: testAsset.id },
      include: {
        createdBy: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    if (retrievedAsset) {
      console.log('\n✅ Asset can be retrieved from database');
      console.log('   Retrieved name:', retrievedAsset.contentName);
    } else {
      console.log('\n❌ Asset could not be retrieved from database');
    }
    
    // Check total count
    const totalAssets = await prisma.digitalAsset.count();
    console.log('\n📊 Total digital assets in database:', totalAssets);
    
    // Clean up test asset
    await prisma.digitalAsset.delete({
      where: { id: testAsset.id }
    });
    
    console.log('\n🧹 Test asset cleaned up');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDigitalAssetCreation();