const https = require('https');
const http = require('http');

async function testAPIPerformance() {
  console.log('🚀 Testing Digital Assets API Performance...\n');
  
  // Test 1: API Response Time
  console.log('1. Testing API endpoint response time...');
  
  const testEndpoints = [
    { name: 'Digital Assets (page 1)', path: '/api/digital-assets?page=1&limit=12' },
    { name: 'Digital Assets (all)', path: '/api/digital-assets' },
    { name: 'Digital Assets (search)', path: '/api/digital-assets?search=test' },
    { name: 'Digital Assets (filter)', path: '/api/digital-assets?department=IT' }
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      const startTime = Date.now();
      
      const response = await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: 'localhost',
          port: 3000,
          path: endpoint.path,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token' // Mock token for testing
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({
              status: res.statusCode,
              data: data,
              headers: res.headers
            });
          });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => reject(new Error('Timeout')));
        req.end();
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      let dataSize = 0;
      let itemCount = 0;
      
      try {
        const parsed = JSON.parse(response.data);
        dataSize = Buffer.byteLength(response.data, 'utf8');
        itemCount = parsed.digitalAssets?.length || 0;
      } catch (e) {
        dataSize = Buffer.byteLength(response.data, 'utf8');
      }
      
      console.log(`   ✅ ${endpoint.name}: ${responseTime}ms (${itemCount} items, ${Math.round(dataSize/1024)}KB)`);
      
      // Performance analysis
      if (responseTime > 1000) {
        console.log(`      ⚠️  Slow response (>1s)`);
      } else if (responseTime > 500) {
        console.log(`      ⚠️  Moderate response (>500ms)`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: Failed - ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Test 2: Database Query Performance (simulate)
  console.log('\n2. Analyzing potential bottlenecks...');
  
  console.log('   📊 Common performance issues:');
  console.log('      • N+1 queries in related data fetching');
  console.log('      • Missing database indexes');
  console.log('      • Large payload sizes');
  console.log('      • Inefficient pagination');
  console.log('      • No caching strategy');
  
  console.log('\n💡 Optimization Recommendations:');
  console.log('   1. Implement proper database indexing');
  console.log('   2. Add response caching with Redis/Memory');
  console.log('   3. Optimize Prisma queries with select fields');
  console.log('   4. Implement lazy loading for images');
  console.log('   5. Add compression middleware');
  console.log('   6. Use CDN for static assets');
}

testAPIPerformance().catch(console.error);
