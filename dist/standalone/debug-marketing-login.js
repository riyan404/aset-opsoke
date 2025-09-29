const fetch = require('node-fetch')

async function debugMarketingLogin() {
  const baseUrl = 'http://localhost:3000'
  
  try {
    console.log('=== DEBUGGING MARKETING USER LOGIN ===')
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'marketing.test@company.com',
        password: 'password123'
      })
    })
    
    console.log('Response status:', loginResponse.status)
    console.log('Response headers:', Object.fromEntries(loginResponse.headers))
    
    const responseText = await loginResponse.text()
    console.log('Response body:', responseText)
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed')
      try {
        const errorData = JSON.parse(responseText)
        console.log('Error details:', errorData)
      } catch (e) {
        console.log('Could not parse error as JSON')
      }
    } else {
      console.log('✅ Login successful')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugMarketingLogin()
