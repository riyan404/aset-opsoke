/**
 * Script untuk memperbaiki masalah halaman dashboard yang mengalami error
 * "Application error: a client-side exception has occurred while loading orderkuota.cobacoba.id"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fungsi untuk memeriksa dan memperbaiki konfigurasi Next.js
function fixNextConfig() {
  console.log('Memeriksa konfigurasi Next.js...');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
  
  if (!fs.existsSync(nextConfigPath)) {
    console.error('File next.config.ts tidak ditemukan!');
    return false;
  }
  
  let configContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Periksa apakah konfigurasi sudah memiliki properti yang diperlukan
  const hasDistDir = configContent.includes('distDir:');
  const hasBasePath = configContent.includes('basePath:');
  const hasAssetPrefix = configContent.includes('assetPrefix:');
  const hasImagesDomains = configContent.includes('domains:');
  
  if (hasDistDir && hasBasePath && hasAssetPrefix && hasImagesDomains) {
    console.log('Konfigurasi Next.js sudah benar.');
    return true;
  }
  
  // Tambahkan konfigurasi yang diperlukan
  console.log('Memperbaiki konfigurasi Next.js...');
  
  const updatedConfig = configContent.replace(
    'const nextConfig: NextConfig = {\n  output: \'standalone\',',
    'const nextConfig: NextConfig = {\n  output: \'standalone\',\n  distDir: \'dist\',\n  basePath: \'\',\n  assetPrefix: \'\',\n  images: {\n    domains: [\'orderkuota.cobacoba.id\', \'www.orderkuota.cobacoba.id\'],\n  },'
  );
  
  fs.writeFileSync(nextConfigPath, updatedConfig, 'utf8');
  console.log('Konfigurasi Next.js berhasil diperbaiki.');
  return true;
}

// Fungsi untuk memeriksa dan memperbaiki konfigurasi .env
function fixEnvConfig() {
  console.log('Memeriksa konfigurasi .env...');
  
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('File .env tidak ditemukan!');
    return false;
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Periksa apakah konfigurasi sudah memiliki NEXT_PUBLIC_APP_URL
  if (envContent.includes('NEXT_PUBLIC_APP_URL=')) {
    console.log('Konfigurasi .env sudah benar.');
    return true;
  }
  
  // Tambahkan NEXT_PUBLIC_APP_URL
  console.log('Memperbaiki konfigurasi .env...');
  
  const updatedEnv = envContent.replace(
    'NEXTAUTH_URL="https://orderkuota.cobacoba.id"',
    'NEXTAUTH_URL="https://orderkuota.cobacoba.id"\nNEXT_PUBLIC_APP_URL="https://orderkuota.cobacoba.id"'
  );
  
  fs.writeFileSync(envPath, updatedEnv, 'utf8');
  console.log('Konfigurasi .env berhasil diperbaiki.');
  return true;
}

// Fungsi untuk memperbaiki standalone .env jika ada
function fixStandaloneEnv() {
  console.log('Memeriksa konfigurasi .env di folder standalone...');
  
  const standaloneEnvPath = path.join(process.cwd(), '.next/standalone/.env');
  
  if (!fs.existsSync(standaloneEnvPath)) {
    console.log('File .env di folder standalone tidak ditemukan. Akan dibuat saat build.');
    return true;
  }
  
  let envContent = fs.readFileSync(standaloneEnvPath, 'utf8');
  
  // Periksa apakah konfigurasi sudah memiliki NEXT_PUBLIC_APP_URL
  if (envContent.includes('NEXT_PUBLIC_APP_URL=')) {
    console.log('Konfigurasi .env di folder standalone sudah benar.');
    return true;
  }
  
  // Tambahkan NEXT_PUBLIC_APP_URL
  console.log('Memperbaiki konfigurasi .env di folder standalone...');
  
  const updatedEnv = envContent.replace(
    'NEXTAUTH_URL="https://orderkuota.cobacoba.id"',
    'NEXTAUTH_URL="https://orderkuota.cobacoba.id"\nNEXT_PUBLIC_APP_URL="https://orderkuota.cobacoba.id"'
  );
  
  fs.writeFileSync(standaloneEnvPath, updatedEnv, 'utf8');
  console.log('Konfigurasi .env di folder standalone berhasil diperbaiki.');
  return true;
}

// Fungsi untuk membangun ulang aplikasi
function rebuildApp() {
  console.log('Membangun ulang aplikasi...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Aplikasi berhasil dibangun ulang.');
    return true;
  } catch (error) {
    console.error('Gagal membangun ulang aplikasi:', error.message);
    return false;
  }
}

// Fungsi untuk me-restart aplikasi menggunakan PM2
function restartApp() {
  console.log('Me-restart aplikasi dengan PM2...');
  try {
    execSync('pm2 restart asset-management', { stdio: 'inherit' });
    console.log('Aplikasi berhasil di-restart.');
    return true;
  } catch (error) {
    console.error('Gagal me-restart aplikasi:', error.message);
    return false;
  }
}

// Fungsi utama
async function main() {
  // Aktifkan mode interaktif
  process.stdin.resume();
  console.log('=== PERBAIKAN HALAMAN DASHBOARD ===');
  
  // Langkah 1: Perbaiki konfigurasi Next.js
  const nextConfigFixed = fixNextConfig();
  if (!nextConfigFixed) {
    console.error('Gagal memperbaiki konfigurasi Next.js. Proses dihentikan.');
    return;
  }
  
  // Langkah 2: Perbaiki konfigurasi .env
  const envConfigFixed = fixEnvConfig();
  if (!envConfigFixed) {
    console.error('Gagal memperbaiki konfigurasi .env. Proses dihentikan.');
    return;
  }
  
  // Langkah 3: Perbaiki konfigurasi .env di folder standalone jika ada
  fixStandaloneEnv();
  
  console.log('\nKonfigurasi telah diperbaiki. Untuk menerapkan perubahan:');
  console.log('1. Jalankan: npm run build');
  console.log('2. Restart aplikasi: pm2 restart asset-management');
  
  // Tanyakan apakah ingin melakukan build dan restart
  console.log('\nApakah Anda ingin melakukan build dan restart aplikasi sekarang? (y/n)');
  process.stdin.once('data', (data) => {
    const answer = data.toString().trim().toLowerCase();
    if (answer === 'y' || answer === 'yes') {
      console.log('\nMemulai proses build dan restart...');
      
      // Langkah 4: Bangun ulang aplikasi
      const appRebuilt = rebuildApp();
      if (!appRebuilt) {
        console.error('Gagal membangun ulang aplikasi. Proses dihentikan.');
        return;
      }
      
      // Langkah 5: Restart aplikasi
      const appRestarted = restartApp();
      if (!appRestarted) {
        console.error('Gagal me-restart aplikasi. Proses dihentikan.');
        return;
      }
    } else {
      console.log('\nProses build dan restart dibatalkan. Konfigurasi sudah diperbaiki.');
    }
  })
  
  console.log('=== PERBAIKAN SELESAI ===');
  console.log('Halaman dashboard seharusnya sudah dapat diakses:');
  console.log('- /dashboard/compression-stats');
  console.log('- /dashboard/watermarks');
  console.log('- /dashboard/archive-reports');
  console.log('- /dashboard/audit');
  console.log('\nJika masih mengalami masalah, silakan periksa browser console untuk informasi lebih lanjut.');
}

// Jalankan fungsi utama
main().catch(error => {
  console.error('Terjadi kesalahan:', error);
});