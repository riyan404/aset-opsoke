/**
 * Script untuk memperbaiki masalah dashboard pada aplikasi Next.js
 * dengan domain orderkuota.cobacoba.id
 */

const fs = require('fs');
const path = require('path');

// Fungsi untuk memeriksa dan memperbaiki konfigurasi next.config.ts
function fixNextConfig() {
  const configPath = path.join(process.cwd(), 'next.config.ts');
  console.log('Memeriksa konfigurasi Next.js...');
  
  if (fs.existsSync(configPath)) {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Periksa apakah konfigurasi images.domains sudah ada
    if (!configContent.includes('images: {')) {
      // Tambahkan konfigurasi images.domains
      const updatedConfig = configContent.replace(
        'const nextConfig = {',
        'const nextConfig = {\n  distDir: \'dist\',\n  images: {\n    domains: [\'orderkuota.cobacoba.id\', \'localhost\'],\n  },'      
      );
      
      fs.writeFileSync(configPath, updatedConfig, 'utf8');
      console.log('✅ Konfigurasi next.config.ts berhasil diperbarui.');
    } else {
      console.log('✓ Konfigurasi images.domains sudah ada di next.config.ts.');
    }
  } else {
    console.error('❌ File next.config.ts tidak ditemukan!');
  }
}

// Fungsi untuk memeriksa dan memperbaiki konfigurasi .env
function fixEnvConfig() {
  const envPath = path.join(process.cwd(), '.env');
  console.log('Memeriksa konfigurasi .env...');
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Periksa apakah NEXT_PUBLIC_APP_URL sudah ada
    if (!envContent.includes('NEXT_PUBLIC_APP_URL')) {
      // Tambahkan NEXT_PUBLIC_APP_URL
      const nextAuthUrlMatch = envContent.match(/NEXTAUTH_URL=([^\r\n]+)/);
      if (nextAuthUrlMatch) {
        const nextAuthUrl = nextAuthUrlMatch[1];
        envContent += `\nNEXT_PUBLIC_APP_URL=${nextAuthUrl}\n`;
        fs.writeFileSync(envPath, envContent, 'utf8');
        console.log('✅ Konfigurasi .env berhasil diperbarui dengan NEXT_PUBLIC_APP_URL.');
      } else {
        console.error('❌ NEXTAUTH_URL tidak ditemukan di .env!');
      }
    } else {
      console.log('✓ NEXT_PUBLIC_APP_URL sudah ada di .env.');
    }
  } else {
    console.error('❌ File .env tidak ditemukan!');
  }
}

// Fungsi untuk memeriksa dan memperbaiki konfigurasi .env di folder standalone
function fixStandaloneEnvConfig() {
  const standaloneEnvPath = path.join(process.cwd(), 'dist', '.env');
  console.log('Memeriksa konfigurasi .env di folder standalone...');
  
  if (fs.existsSync(standaloneEnvPath)) {
    let envContent = fs.readFileSync(standaloneEnvPath, 'utf8');
    
    // Periksa apakah NEXT_PUBLIC_APP_URL sudah ada
    if (!envContent.includes('NEXT_PUBLIC_APP_URL')) {
      // Tambahkan NEXT_PUBLIC_APP_URL
      const nextAuthUrlMatch = envContent.match(/NEXTAUTH_URL=([^\r\n]+)/);
      if (nextAuthUrlMatch) {
        const nextAuthUrl = nextAuthUrlMatch[1];
        envContent += `\nNEXT_PUBLIC_APP_URL=${nextAuthUrl}\n`;
        fs.writeFileSync(standaloneEnvPath, envContent, 'utf8');
        console.log('✅ Konfigurasi .env di folder standalone berhasil diperbarui.');
      } else {
        console.error('❌ NEXTAUTH_URL tidak ditemukan di .env folder standalone!');
      }
    } else {
      console.log('✓ NEXT_PUBLIC_APP_URL sudah ada di .env folder standalone.');
    }
  } else {
    console.log('ℹ️ File .env di folder standalone tidak ditemukan. Akan dibuat saat build.');
  }
}

// Fungsi untuk menjalankan build dengan opsi --no-lint
function runBuild() {
  console.log('\n🔄 Menjalankan build dengan opsi --no-lint...');
  const { execSync } = require('child_process');
  
  try {
    console.log('Menjalankan: npm run build -- --no-lint');
    execSync('npm run build -- --no-lint', { stdio: 'inherit' });
    console.log('✅ Build berhasil!');
    return true;
  } catch (error) {
    console.error('❌ Build gagal:', error.message);
    return false;
  }
}

// Fungsi untuk me-restart aplikasi dengan PM2
function restartApp() {
  console.log('\n🔄 Me-restart aplikasi dengan PM2...');
  const { execSync } = require('child_process');
  
  try {
    console.log('Menjalankan: pm2 restart asset-management');
    execSync('pm2 restart asset-management', { stdio: 'inherit' });
    console.log('✅ Aplikasi berhasil di-restart!');
    return true;
  } catch (error) {
    console.error('❌ Restart aplikasi gagal:', error.message);
    return false;
  }
}

// Fungsi utama
function main() {
  console.log('🔧 Memulai perbaikan konfigurasi dashboard...');
  
  // Perbaiki konfigurasi
  fixNextConfig();
  fixEnvConfig();
  fixStandaloneEnvConfig();
  
  console.log('\n✅ Perbaikan konfigurasi selesai!');
  
  // Tanyakan apakah ingin melanjutkan dengan build dan restart
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('\nApakah Anda ingin melanjutkan dengan build dan restart aplikasi? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      const buildSuccess = runBuild();
      
      if (buildSuccess) {
        readline.question('\nApakah Anda ingin me-restart aplikasi dengan PM2? (y/n): ', (restartAnswer) => {
          if (restartAnswer.toLowerCase() === 'y') {
            restartApp();
          }
          
          console.log('\n✅ Proses perbaikan dashboard selesai!');
          readline.close();
        });
      } else {
        console.log('\n⚠️ Build gagal. Silakan perbaiki error ESLint terlebih dahulu atau jalankan build dengan opsi --no-lint secara manual.');
        readline.close();
      }
    } else {
      console.log('\nLangkah selanjutnya:');
      console.log('1. Jalankan "npm run build -- --no-lint" untuk membangun ulang aplikasi tanpa pemeriksaan lint');
      console.log('2. Restart aplikasi dengan "pm2 restart asset-management"');
      console.log('\nSetelah itu, halaman dashboard seharusnya berfungsi dengan benar.');
      readline.close();
    }
  });
}

// Jalankan fungsi utama
main();