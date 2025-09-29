const fetch = require('node-fetch')

async function detailedApiTest() {
  const baseUrl = 'http://localhost:3000'
  
  try {
    console.log('=== DETAILED API TEST ===')
    
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
    
    console.log('Login status:', loginResponse.status)
    const loginText = await loginResponse.text()
    console.log('Login response:', loginText)
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed')
      return
    }
    
    const loginData = JSON.parse(loginText)
    const token = loginData.token
    console.log('✅ Login successful, token length:', token ? token.length : 'no token')
    
    // Test user info with detailed logging
    console.log('\n👤 Testing user info API...')
    const userResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('User API status:', userResponse.status)
    const userText = await userResponse.text()
    console.log('User API response:', userText)
    
    if (userResponse.ok) {
      const userData = JSON.parse(userText)
      console.log('✅ User data structure:', Object.keys(userData))
      console.log('✅ User details:', userData)
    }
    
    // Test permissions with detailed logging
    console.log('\n📋 Testing permissions API...')
    const permissionsResponse = await fetch(`${baseUrl}/api/permissions/digital-assets`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Permissions API status:', permissionsResponse.status)
    const permissionsText = await permissionsResponse.text()
    console.log('Permissions API response:', permissionsText)
    
    // Test digital assets with detailed logging
    console.log('\n📂 Testing digital assets API...')
    const assetsResponse = await fetch(`${baseUrl}/api/digital-assets`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Assets API status:', assetsResponse.status)
    const assetsText = await assetsResponse.text()
    console.log('Assets API response length:', assetsText.length)
    
    if (assetsResponse.ok) {
      try {
        const assetsData = JSON.parse(assetsText)
        console.log('✅ Assets data structure:', Object.keys(assetsData))
        if (Array.isArray(assetsData.digitalAssets)) {
          console.log('✅ Digital assets count:', assetsData.digitalAssets.length)
        }
      } catch (e) {
        console.log('❌ Could not parse assets response as JSON')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

detailedApiTest()
