const puppeteer = require('puppeteer')

async function testPermissions() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    console.log('🚀 Starting permission validation test...')
    
    // Test View Only User
    console.log('\n📋 Testing View Only User (viewonly@test.com)')
    const page1 = await browser.newPage()
    await page1.goto('http://localhost:3000/login')
    
    // Login as view only user
    await page1.type('input[name="email"]', 'viewonly@test.com')
    await page1.type('input[name="password"]', 'password123')
    await page1.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page1.waitForNavigation()
    console.log('✅ View only user logged in successfully')
    
    // Navigate to digital assets
    await page1.goto('http://localhost:3000/dashboard/digital-assets')
    await page1.waitForTimeout(3000) // Wait for permissions to load
    
    // Check if add button is disabled
    const addButtonDisabled = await page1.evaluate(() => {
      const addButton = document.querySelector('button:has(svg + text):contains("Tambah Aset Digital")')
      return addButton ? addButton.disabled || addButton.classList.contains('cursor-not-allowed') : false
    })
    
    console.log('🔍 Add button disabled for view only user:', addButtonDisabled)
    
    // Check if edit/delete buttons are disabled
    const editButtonsDisabled = await page1.evaluate(() => {
      const editButtons = document.querySelectorAll('button:has(svg[data-lucide="edit"])')
      return Array.from(editButtons).some(btn => 
        btn.classList.contains('cursor-not-allowed') || 
        btn.classList.contains('bg-gray-50')
      )
    })
    
    console.log('🔍 Edit buttons disabled for view only user:', editButtonsDisabled)
    
    // Test clicking add button to see modal
    try {
      await page1.click('button:has(svg + text):contains("Tambah Aset Digital")')
      await page1.waitForTimeout(1000)
      
      const modalVisible = await page1.evaluate(() => {
        return document.querySelector('[role="dialog"]') !== null
      })
      
      console.log('🔍 Access denied modal appears for view only user:', modalVisible)
    } catch (error) {
      console.log('⚠️ Could not test add button click for view only user')
    }
    
    await page1.close()
    
    // Test Can Add User
    console.log('\n📋 Testing Can Add User (canadd@test.com)')
    const page2 = await browser.newPage()
    await page2.goto('http://localhost:3000/login')
    
    // Login as can add user
    await page2.type('input[name="email"]', 'canadd@test.com')
    await page2.type('input[name="password"]', 'password123')
    await page2.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page2.waitForNavigation()
    console.log('✅ Can add user logged in successfully')
    
    // Navigate to digital assets
    await page2.goto('http://localhost:3000/dashboard/digital-assets')
    await page2.waitForTimeout(3000) // Wait for permissions to load
    
    // Check if add button is enabled
    const addButtonEnabled = await page2.evaluate(() => {
      const addButton = document.querySelector('button:has(svg + text):contains("Tambah Aset Digital")')
      return addButton ? !addButton.disabled && !addButton.classList.contains('cursor-not-allowed') : false
    })
    
    console.log('🔍 Add button enabled for can add user:', addButtonEnabled)
    
    // Check if edit/delete buttons are enabled
    const editButtonsEnabled = await page2.evaluate(() => {
      const editButtons = document.querySelectorAll('button:has(svg[data-lucide="edit"])')
      return Array.from(editButtons).some(btn => 
        !btn.classList.contains('cursor-not-allowed') && 
        !btn.classList.contains('bg-gray-50')
      )
    })
    
    console.log('🔍 Edit buttons enabled for can add user:', editButtonsEnabled)
    
    await page2.close()
    
    console.log('\n🎉 Permission validation test completed!')
    
  } catch (error) {
    console.error('❌ Error during testing:', error)
  } finally {
    await browser.close()
  }
}

testPermissions()
