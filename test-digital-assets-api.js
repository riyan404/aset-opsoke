const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testDigitalAssetsAPI() {
  try {
    console.log('Testing Digital Assets API...\n');
    
    // First, let's test login to get a token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'digitalkontenoke@gmail.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Error:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('   User:', loginData.user?.email);
    console.log('   Token received:', !!loginData.token);
    
    const token = loginData.token;
    
    // Test creating a digital asset
    const formData = new FormData();
    formData.append('contentName', 'Test Digital Asset via API');
    formData.append('description', 'Testing digital asset creation through API');
    formData.append('aspectRatio', 'RATIO_4_3');
    formData.append('googleDriveLink', 'https://drive.google.com/test-api');
    formData.append('tags', JSON.stringify(['test', 'api', 'verification']));
    
    // Create a simple test file
    const testFileContent = 'Test preview file content';
    fs.writeFileSync('/tmp/test-preview.txt', testFileContent);
    formData.append('previewFile', fs.createReadStream('/tmp/test-preview.txt'));
    
    console.log('\n📤 Creating digital asset...');
    
    const createResponse = await fetch('http://localhost:3000/api/digital-assets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });
    
    console.log('Response status:', createResponse.status);
    
    if (!createResponse.ok) {
      console.log('❌ Digital asset creation failed');
      const errorText = await createResponse.text();
      console.log('Error response:', errorText);
      return;
    }
    
    const createData = await createResponse.json();
    console.log('✅ Digital asset created successfully:');
    console.log('   Full response:', JSON.stringify(createData, null, 2));
    console.log('   ID:', createData.digitalAsset?.id || createData.id);
    console.log('   Name:', createData.digitalAsset?.contentName || createData.contentName);
    console.log('   Department:', createData.digitalAsset?.department || createData.department);
    console.log('   Created at:', createData.digitalAsset?.createdAt || createData.createdAt);
    
    // Test fetching digital assets
    console.log('\n📥 Fetching digital assets...');
    
    const fetchResponse = await fetch('http://localhost:3000/api/digital-assets', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!fetchResponse.ok) {
      console.log('❌ Failed to fetch digital assets');
      const errorText = await fetchResponse.text();
      console.log('Error:', errorText);
      return;
    }
    
    const fetchData = await fetchResponse.json();
    console.log('✅ Digital assets fetched successfully:');
    console.log('   Full fetch response:', JSON.stringify(fetchData, null, 2));
    console.log('   Total assets:', fetchData.digitalAssets?.length || fetchData.length);
    
    const assets = fetchData.digitalAssets || fetchData;
    if (assets && assets.length > 0) {
      console.log('   Latest asset:', assets[0].contentName);
      console.log('   Created by:', assets[0].createdBy?.email);
    }
    
    // Clean up test file
    fs.unlinkSync('/tmp/test-preview.txt');
    
  } catch (error) {
    console.error('❌ Error during API test:', error.message);
    console.error('Full error:', error);
  }
}

testDigitalAssetsAPI();