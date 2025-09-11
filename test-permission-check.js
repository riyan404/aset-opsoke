// Test permission check directly with curl
const { spawn } = require('child_process');

function testWithCurl() {
  console.log('Testing digital asset creation with curl...');
  
  const formData = [
    '-F', 'contentName=Test Asset ' + Date.now(),
    '-F', 'description=Test description',
    '-F', 'aspectRatio=RATIO_9_16',
    '-F', 'googleDriveLink=https://drive.google.com/test',
    '-F', 'tags=test,curl',
    '-F', 'department=Administration'
  ];
  
  const curl = spawn('curl', [
    '-X', 'POST',
    '-H', 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZjI1dHFnMTAwMDBzaWRnbjR2dTJzc3kiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzU3NTc2MjQ1LCJleHAiOjE3NTc2NjI2NDV9.kwmMSRp7sDngVOc2_RwouB8IAAjN7KgPp-TVHn22Zv0',
    ...formData,
    'http://localhost:3001/api/digital-assets'
  ]);
  
  curl.stdout.on('data', (data) => {
    console.log('Response:', data.toString());
  });
  
  curl.stderr.on('data', (data) => {
    console.error('Error:', data.toString());
  });
  
  curl.on('close', (code) => {
    console.log('Curl exited with code:', code);
  });
}

testWithCurl();