const fetch = require('node-fetch')

async function testRealDepartmentPermissions() {
  const baseUrl = 'http://localhost:3000'
  
  try {
    console.log('=== TESTING REAL DEPARTMENT PERMISSIONS ===')
    
    // Test users with real departments
    const testUsers = [
      {
        email: 'marketing.test@company.com',
        password: 'password123',
        department: 'Marketing',
        expectedPermissions: { canRead: true, canWrite: true, canDelete: true }
      },
      {
        email: 'it.test@company.com', 
        password: 'password123',
        department: 'IT',
        expectedPermissions: { canRead: true, canWrite: true, canDelete: true }
      }
    ]
    
    for (const user of testUsers) {
      console.log(`\n🧪 Testing ${user.department} Department User: ${user.email}`)
      
      // Login
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      })
      
      if (!loginResponse.ok) {
        console.log(`❌ Login failed for ${user.email}`)
        continue
      }
      
      const loginData = await loginResponse.json()
      console.log(`✅ Login successful for ${user.email}`)
      
      // Test permissions API
      const permissionsResponse = await fetch(`${baseUrl}/api/permissions/digital-assets`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      })
      
      if (!permissionsResponse.ok) {
        console.log(`❌ Permission API failed for ${user.email}`)
        continue
      }
      
      const permissions = await permissionsResponse.json()
      console.log(`📋 Permissions received:`, permissions)
      
      // Validate permissions
      const expected = user.expectedPermissions
      const actual = permissions
      
      console.log(`🔍 Permission Validation:`)
      console.log(`   canRead: Expected=${expected.canRead}, Actual=${actual.canRead} ${expected.canRead === actual.canRead ? '✅' : '❌'}`)
      console.log(`   canWrite: Expected=${expected.canWrite}, Actual=${actual.canWrite} ${expected.canWrite === actual.canWrite ? '✅' : '❌'}`)
      console.log(`   canDelete: Expected=${expected.canDelete}, Actual=${actual.canDelete} ${expected.canDelete === actual.canDelete ? '✅' : '❌'}`)
      
      const allMatch = expected.canRead === actual.canRead && 
                      expected.canWrite === actual.canWrite && 
                      expected.canDelete === actual.canDelete
      
      console.log(`🎯 Overall Result: ${allMatch ? '✅ PASS' : '❌ FAIL'}`)
    }
    
    console.log('\n✅ Real department permission testing completed!')
    
  } catch (error) {
    console.error('❌ Error testing permissions:', error)
  }
}

testRealDepartmentPermissions()
