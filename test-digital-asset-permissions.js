const fetch = require('node-fetch')

async function testDigitalAssetPermissions() {
  const baseUrl = 'http://localhost:3000'
  
  try {
    console.log('=== TESTING DIGITAL ASSET PERMISSIONS ===')
    
    // Login as Marketing user
    console.log('🔐 Logging in as Marketing user...')
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'marketing.test@company.com',
        password: 'password123'
      })
    })
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed')
      return
    }
    
    const loginData = await loginResponse.json()
    const token = loginData.token
    console.log('✅ Login successful')
    
    // Test permissions API
    console.log('\n📋 Testing permissions API...')
    const permissionsResponse = await fetch(`${baseUrl}/api/permissions/digital-assets`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Permissions API status:', permissionsResponse.status)
    
    if (permissionsResponse.ok) {
      const permissions = await permissionsResponse.json()
      console.log('✅ Permissions received:', permissions)
    } else {
      const errorText = await permissionsResponse.text()
      console.log('❌ Permissions error:', errorText)
    }
    
    // Test digital assets list API
    console.log('\n📂 Testing digital assets list API...')
    const assetsResponse = await fetch(`${baseUrl}/api/digital-assets`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Digital assets API status:', assetsResponse.status)
    
    if (assetsResponse.ok) {
      const assets = await assetsResponse.json()
      console.log('✅ Digital assets received:', assets.length, 'items')
    } else {
      const errorText = await assetsResponse.text()
      console.log('❌ Digital assets error:', errorText)
    }
    
    // Test user info
    console.log('\n👤 Testing user info...')
    const userResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (userResponse.ok) {
      const userData = await userResponse.json()
      console.log('✅ User info:', {
        email: userData.email,
        department: userData.department,
        role: userData.role
      })
    } else {
      console.log('❌ User info error')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testDigitalAssetPermissions()
