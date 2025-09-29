/**
 * Script untuk menguji apakah halaman dashboard sudah berfungsi dengan benar
 * setelah perbaikan konfigurasi domain
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Fungsi untuk mendapatkan URL dari file .env
function getAppUrl() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Coba dapatkan NEXT_PUBLIC_APP_URL terlebih dahulu
    const appUrlMatch = envContent.match(/NEXT_PUBLIC_APP_URL=([^\r\n]+)/);
    if (appUrlMatch) {
      return appUrlMatch[1].replace(/\"/g, '');
    }
    
    // Jika tidak ada, gunakan NEXTAUTH_URL
    const nextAuthUrlMatch = envContent.match(/NEXTAUTH_URL=([^\r\n]+)/);
    if (nextAuthUrlMatch) {
      return nextAuthUrlMatch[1].replace(/\"/g, '');
    }
  }
  
  // Default fallback
  return 'https://orderkuota.cobacoba.id';
}

// Fungsi untuk login
async function login(page, appUrl) {
  try {
    console.log(`🔑 Mencoba login ke ${appUrl}/login`);
    await page.goto(`${appUrl}/login`, { waitUntil: 'networkidle2' });
    
    // Tunggu form login muncul
    await page.waitForSelector('input[name="email"]');
    await page.waitForSelector('input[name="password"]');
    
    // Isi form login (ganti dengan kredensial yang benar)
    await page.type('input[name="email"]', 'admin@example.com');
    await page.type('input[name="password"]', 'password123');
    
    // Klik tombol login
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    // Periksa apakah login berhasil (biasanya diarahkan ke dashboard)
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Login berhasil!');
      return true;
    } else {
      console.log('❌ Login gagal. Diarahkan ke:', currentUrl);
      return false;
    }
  } catch (error) {
    console.error('❌ Error saat login:', error.message);
    return false;
  }
}

// Fungsi untuk menguji halaman dashboard
async function testDashboardPages(page, appUrl) {
  const dashboardPages = [
    '/dashboard',
    '/dashboard/assets',
    '/dashboard/categories',
    '/dashboard/users'
  ];
  
  const results = {};
  
  for (const pagePath of dashboardPages) {
    try {
      console.log(`🔍 Menguji halaman ${pagePath}...`);
      await page.goto(`${appUrl}${pagePath}`, { waitUntil: 'networkidle2' });
      
      // Periksa apakah halaman berhasil dimuat (tidak ada error page)
      const pageTitle = await page.title();
      const pageContent = await page.content();
      
      // Periksa apakah halaman berisi pesan error
      const hasError = pageContent.includes('Error') || 
                      pageContent.includes('404') || 
                      pageContent.includes('Not Found');
      
      if (!hasError) {
        console.log(`✅ Halaman ${pagePath} berhasil dimuat. Title: ${pageTitle}`);
        results[pagePath] = { success: true, title: pageTitle };
      } else {
        console.log(`❌ Halaman ${pagePath} menampilkan error.`);
        results[pagePath] = { success: false, error: 'Halaman menampilkan error' };
      }
    } catch (error) {
      console.error(`❌ Error saat mengakses ${pagePath}:`, error.message);
      results[pagePath] = { success: false, error: error.message };
    }
  }
  
  return results;
}

// Fungsi utama
async function main() {
  console.log('🧪 Memulai pengujian halaman dashboard...');
  
  const appUrl = getAppUrl();
  console.log(`📌 URL Aplikasi: ${appUrl}`);
  
  // Inisialisasi browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Login terlebih dahulu
    const loginSuccess = await login(page, appUrl);
    
    if (loginSuccess) {
      // Uji halaman dashboard
      const results = await testDashboardPages(page, appUrl);
      
      // Tampilkan ringkasan hasil
      console.log('\n📊 Ringkasan Hasil Pengujian:');
      let allSuccess = true;
      
      for (const [pagePath, result] of Object.entries(results)) {
        if (result.success) {
          console.log(`✅ ${pagePath}: Berhasil`);
        } else {
          console.log(`❌ ${pagePath}: Gagal - ${result.error}`);
          allSuccess = false;
        }
      }
      
      if (allSuccess) {
        console.log('\n🎉 Semua halaman dashboard berhasil dimuat! Perbaikan berhasil.');
      } else {
        console.log('\n⚠️ Beberapa halaman dashboard masih bermasalah. Perlu perbaikan lebih lanjut.');
      }
    } else {
      console.log('\n⚠️ Tidak dapat menguji halaman dashboard karena login gagal.');
    }
  } catch (error) {
    console.error('❌ Error saat menjalankan pengujian:', error);
  } finally {
    await browser.close();
  }
}

// Periksa apakah puppeteer sudah terinstal
try {
  require.resolve('puppeteer');
  // Jalankan fungsi utama
  main().catch(console.error);
} catch (error) {
  console.log('⚠️ Puppeteer belum terinstal. Menginstal puppeteer...');
  console.log('Jalankan: npm install puppeteer');
  console.log('Kemudian jalankan script ini kembali.');
}