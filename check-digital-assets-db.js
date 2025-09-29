const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDigitalAssetsDatabase() {
  try {
    console.log('Checking Digital Assets in Database...\n');
    
    // Get all digital assets
    const digitalAssets = await prisma.digitalAsset.findMany({
      include: {
        createdBy: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
        updatedBy: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Total Digital Assets: ${digitalAssets.length}\n`);
    
    if (digitalAssets.length === 0) {
      console.log('❌ Tidak ada digital assets yang ditemukan di database');
      return;
    }
    
    // Show recent assets (last 5)
    console.log('Recent Digital Assets:');
    digitalAssets.slice(0, 5).forEach((asset, index) => {
      const creatorName = asset.createdBy ? 
        `${asset.createdBy.firstName || ''} ${asset.createdBy.lastName || ''}`.trim() || asset.createdBy.email :
        'Unknown';
      
      console.log(`${index + 1}. ${asset.contentName || 'Unnamed Asset'}`);
      console.log(`   - ID: ${asset.id}`);
      console.log(`   - Description: ${asset.description || 'No description'}`);
      console.log(`   - Aspect Ratio: ${asset.aspectRatio || 'Not specified'}`);
      console.log(`   - Department: ${asset.department || 'Not specified'}`);
      console.log(`   - Created by: ${creatorName} (${asset.createdBy?.email || 'No email'})`);
      console.log(`   - Created at: ${asset.createdAt}`);
      console.log(`   - Google Drive: ${asset.googleDriveLink || 'No link'}`);
      console.log('');
    });
    
    // Check assets created by digitalkontenoke@gmail.com
    console.log('\nAssets created by digitalkontenoke@gmail.com:');
    const userAssets = digitalAssets.filter(asset => 
      asset.createdBy?.email === 'digitalkontenoke@gmail.com'
    );
    
    if (userAssets.length === 0) {
      console.log('❌ No assets found created by digitalkontenoke@gmail.com');
    } else {
      console.log(`✅ Found ${userAssets.length} assets created by digitalkontenoke@gmail.com:`);
      userAssets.forEach((asset, index) => {
        console.log(`${index + 1}. ${asset.contentName || 'Unnamed Asset'} (${asset.aspectRatio || 'No ratio'}) - ${asset.createdAt}`);
      });
    }
    
    // Check assets created in last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentAssets = digitalAssets.filter(asset => 
      new Date(asset.createdAt) > yesterday
    );
    
    console.log(`\nAssets created in last 24 hours: ${recentAssets.length}`);
    recentAssets.forEach((asset, index) => {
      const creatorName = asset.createdBy ? `${asset.createdBy.firstName} ${asset.createdBy.lastName}` : 'Unknown';
      console.log(`${index + 1}. ${asset.contentName || 'Unnamed Asset'} by ${creatorName} - ${asset.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDigitalAssetsDatabase();