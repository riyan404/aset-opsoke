// Using built-in fetch (Node.js 18+)

async function testCreateDigitalAsset() {
  try {
    // First, login to get token
    console.log('Logging in...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.error('Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData);
    const token = loginData.token;

    // Test creating digital asset with minimal data
    const createAssetData = {
      contentName: 'Test Digital Asset ' + Date.now(),
      description: 'Test description for digital asset',
      aspectRatio: 'RATIO_9_16',
      googleDriveLink: 'https://drive.google.com/test',
      tags: JSON.stringify(['test', 'digital']),
      department: 'Digital'
    }

    const formData = new FormData()
    Object.keys(createAssetData).forEach(key => {
      formData.append(key, createAssetData[key])
    })

    console.log('Sending data:', createAssetData)
    console.log('\nCreating digital asset...');

    const createResponse = await fetch('http://localhost:3001/api/digital-assets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    console.log('Response status:', createResponse.status);
    console.log('Response headers:', Object.fromEntries(createResponse.headers));
    
    const responseText = await createResponse.text();
    console.log('Response body:', responseText);

    if (!createResponse.ok) {
      console.error('Failed to create digital asset');
    } else {
      console.log('Digital asset created successfully!');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testCreateDigitalAsset();