const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_USER);
    authToken = response.data.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testCacheHeaders(endpoint, expectedCacheControl) {
  try {
    console.log(`\n🧪 Testing cache headers for ${endpoint}`);
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const cacheControl = response.headers['cache-control'];
    console.log(`📋 Cache-Control: ${cacheControl}`);
    
    if (cacheControl && cacheControl.includes(expectedCacheControl)) {
      console.log('✅ Cache headers correct');
      return true;
    } else {
      console.log(`❌ Expected cache control to include: ${expectedCacheControl}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error.response?.data || error.message);
    return false;
  }
}

async function testUserCacheInvalidation() {
  try {
    console.log('\n🔄 Testing user cache invalidation...');
    
    // 1. Get initial users list
    console.log('1️⃣ Getting initial users list...');
    const initialResponse = await axios.get(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const initialCount = initialResponse.data.users.length;
    console.log(`📊 Initial user count: ${initialCount}`);
    
    // 2. Create a new user
    console.log('2️⃣ Creating new test user...');
    const newUser = {
      name: 'Test Cache User',
      email: `testcache${Date.now()}@example.com`,
      password: 'testpass123',
      role: 'USER',
      department: 'IT'
    };
    
    const createResponse = await axios.post(`${BASE_URL}/api/users`, newUser, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (createResponse.status === 201) {
      console.log('✅ User created successfully');
      const createdUserId = createResponse.data.user.id;
      
      // 3. Get users list again (should show updated count immediately due to no-cache)
      console.log('3️⃣ Getting updated users list...');
      const updatedResponse = await axios.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const updatedCount = updatedResponse.data.users.length;
      console.log(`📊 Updated user count: ${updatedCount}`);
      
      if (updatedCount === initialCount + 1) {
        console.log('✅ Cache invalidation working - new user visible immediately');
        
        // 4. Clean up - delete the test user
        console.log('4️⃣ Cleaning up test user...');
        await axios.delete(`${BASE_URL}/api/users/${createdUserId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('🧹 Test user deleted');
        
        return true;
      } else {
        console.log('❌ Cache invalidation failed - user count not updated');
        return false;
      }
    } else {
      console.log('❌ Failed to create test user');
      return false;
    }
  } catch (error) {
    console.error('❌ Error in user cache invalidation test:', error.response?.data || error.message);
    return false;
  }
}

async function testDashboardCacheHeaders() {
  try {
    console.log('\n📊 Testing dashboard cache headers...');
    
    const response = await axios.get(`${BASE_URL}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const cacheControl = response.headers['cache-control'];
    console.log(`📋 Dashboard Cache-Control: ${cacheControl}`);
    
    // Dashboard should have short cache (5 minutes = 300 seconds)
    if (cacheControl && cacheControl.includes('max-age=300')) {
      console.log('✅ Dashboard cache headers correct (5 minute cache)');
      return true;
    } else {
      console.log('❌ Dashboard cache headers incorrect');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing dashboard cache:', error.response?.data || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Cache Invalidation Tests\n');
  
  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  const results = [];
  
  // Test 1: User API cache headers (should be no-cache)
  results.push(await testCacheHeaders('/api/users', 'no-cache'));
  
  // Test 2: Permissions API cache headers (should be no-cache)
  results.push(await testCacheHeaders('/api/permissions', 'no-cache'));
  
  // Test 3: Dashboard cache headers (should be short cache)
  results.push(await testDashboardCacheHeaders());
  
  // Test 4: User cache invalidation functionality
  results.push(await testUserCacheInvalidation());
  
  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n📋 Test Summary:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All cache invalidation tests passed!');
    console.log('✅ Cache strategy implementation is working correctly');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
  }
}

// Run the tests
runAllTests().catch(console.error);