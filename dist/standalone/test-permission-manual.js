const fetch = require('node-fetch')

async function testPermissionAPI() {
  console.log('🚀 Testing Permission API...')
  
  try {
    // Test login view only user
    console.log('\n📋 Testing View Only User Login')
    const loginResponse1 = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'viewonly@test.com',
        password: 'password123'
      })
    })
    
    const loginData1 = await loginResponse1.json()
    if (loginResponse1.ok) {
      console.log('✅ View only user login successful')
      console.log('User department:', loginData1.user.department)
      
      // Test permissions API
      const permResponse1 = await fetch('http://localhost:3000/api/permissions/digital-assets', {
        headers: { 'Authorization': `Bearer ${loginData1.token}` }
      })
      
      const permissions1 = await permResponse1.json()
      console.log('🔍 View only user permissions:', permissions1)
      
    } else {
      console.log('❌ View only user login failed:', loginData1.error)
    }
    
    // Test login can add user
    console.log('\n📋 Testing Can Add User Login')
    const loginResponse2 = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'canadd@test.com',
        password: 'password123'
      })
    })
    
    const loginData2 = await loginResponse2.json()
    if (loginResponse2.ok) {
      console.log('✅ Can add user login successful')
      console.log('User department:', loginData2.user.department)
      
      // Test permissions API
      const permResponse2 = await fetch('http://localhost:3000/api/permissions/digital-assets', {
        headers: { 'Authorization': `Bearer ${loginData2.token}` }
      })
      
      const permissions2 = await permResponse2.json()
      console.log('🔍 Can add user permissions:', permissions2)
      
    } else {
      console.log('❌ Can add user login failed:', loginData2.error)
    }
    
    console.log('\n🎉 API Permission test completed!')
    
  } catch (error) {
    console.error('❌ Error during API testing:', error)
  }
}

testPermissionAPI()
