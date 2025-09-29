const puppeteer = require('puppeteer');

async function testLoadTime() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable performance monitoring
    await page.setCacheEnabled(false);
    
    console.log('🚀 Testing Digital Assets Page Load Time...\n');
    
    // Test 1: Initial page load
    console.log('1. Testing initial page load...');
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000/login', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Login first
    await page.type('input[name="email"]', 'admin@example.com');
    await page.type('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Navigate to digital assets page
    const navigationStart = Date.now();
    await page.goto('http://localhost:3000/dashboard/digital-assets', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    const navigationEnd = Date.now();
    
    console.log(`   ✅ Page navigation: ${navigationEnd - navigationStart}ms`);
    
    // Test 2: Wait for content to appear
    console.log('2. Testing content load time...');
    const contentStart = Date.now();
    
    // Wait for either loading skeleton or actual content
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Wait for actual content (not skeleton)
    try {
      await page.waitForFunction(() => {
        const skeletons = document.querySelectorAll('.animate-pulse');
        return skeletons.length === 0;
      }, { timeout: 15000 });
      
      const contentEnd = Date.now();
      console.log(`   ✅ Content loaded: ${contentEnd - contentStart}ms`);
      
      // Test 3: Count loaded assets
      const assetCards = await page.$$('.group.hover\\:shadow-lg');
      console.log(`   ✅ Assets loaded: ${assetCards.length} items`);
      
    } catch (error) {
      console.log('   ⚠️  Content still loading after 15s');
    }
    
    // Test 4: API response time
    console.log('3. Testing API response time...');
    const apiStart = Date.now();
    
    const response = await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      const start = Date.now();
      const res = await fetch('/api/digital-assets?page=1&limit=12', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const end = Date.now();
      const data = await res.json();
      return { 
        time: end - start, 
        status: res.status,
        count: data.digitalAssets?.length || 0
      };
    });
    
    console.log(`   ✅ API response: ${response.time}ms (${response.count} assets)`);
    
    // Test 5: Search performance
    console.log('4. Testing search performance...');
    const searchInput = await page.$('input[placeholder*="Cari"]');
    if (searchInput) {
      const searchStart = Date.now();
      await searchInput.type('test');
      
      // Wait for debounced search
      await page.waitForTimeout(500);
      
      const searchEnd = Date.now();
      console.log(`   ✅ Search response: ${searchEnd - searchStart}ms`);
    }
    
    console.log('\n📊 Performance Summary:');
    console.log(`   • Total page load: ${navigationEnd - navigationStart}ms`);
    console.log(`   • Content render: ${contentEnd - contentStart}ms`);
    console.log(`   • API response: ${response.time}ms`);
    console.log(`   • Assets loaded: ${response.count}`);
    
    // Performance recommendations
    console.log('\n💡 Performance Analysis:');
    if (navigationEnd - navigationStart > 2000) {
      console.log('   ⚠️  Page navigation is slow (>2s)');
    }
    if (contentEnd - contentStart > 1000) {
      console.log('   ⚠️  Content loading is slow (>1s)');
    }
    if (response.time > 500) {
      console.log('   ⚠️  API response is slow (>500ms)');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLoadTime().catch(console.error);
