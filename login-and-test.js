const { spawn } = require('child_process');

// First, login to get new token with department
const loginData = JSON.stringify({
  email: 'admin@example.com',
  password: 'admin123'
});

const loginCurl = spawn('curl', [
  '-X', 'POST',
  '-H', 'Content-Type: application/json',
  '-d', loginData,
  'http://localhost:3001/api/auth/login'
]);

let loginResponse = '';

loginCurl.stdout.on('data', (data) => {
  loginResponse += data.toString();
});

loginCurl.stderr.on('data', (data) => {
  console.error('Login Error:', data.toString());
});

loginCurl.on('close', (code) => {
  console.log('Login Response:', loginResponse);
  
  try {
    const loginResult = JSON.parse(loginResponse);
    const token = loginResult.token;
    
    if (!token) {
      console.error('No token received from login');
      return;
    }
    
    console.log('Token received, now testing digital asset creation...');
    
    // Now test digital asset creation with new token
    const jsonData = JSON.stringify({
      contentName: 'Test Asset ' + Date.now(),
      description: 'Test description with new token',
      aspectRatio: 'RATIO_9_16',
      googleDriveLink: 'https://drive.google.com/test-new',
      tags: 'test,new-token',
      department: 'Administration'
    });
    
    const testCurl = spawn('curl', [
      '-X', 'POST',
      '-H', 'Content-Type: application/json',
      '-H', `Authorization: Bearer ${token}`,
      '-d', jsonData,
      'http://localhost:3001/api/digital-assets'
    ]);
    
    let testResponse = '';
    
    testCurl.stdout.on('data', (data) => {
      testResponse += data.toString();
    });
    
    testCurl.stderr.on('data', (data) => {
      console.error('Test Error:', data.toString());
    });
    
    testCurl.on('close', (code) => {
      console.log('Test Response:', testResponse);
      console.log('Test curl exited with code:', code);
    });
    
  } catch (error) {
    console.error('Error parsing login response:', error);
  }
});