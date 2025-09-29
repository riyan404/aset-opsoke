/**
 * Script sederhana untuk memperbaiki masalah halaman dashboard
 */

const fs = require('fs');
const path = require('path');

console.log('=== PERBAIKAN HALAMAN DASHBOARD ===');

// Perbaiki next.config.ts
const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
let configContent = fs.readFileSync(nextConfigPath, 'utf8');

const updatedConfig = configContent.replace(
  'const nextConfig: NextConfig = {\n  output: \'standalone\',',
  'const nextConfig: NextConfig = {\n  output: \'standalone\',\n  distDir: \'dist\',\n  basePath: \'\',\n  assetPrefix: \'\',\n  images: {\n    domains: [\'orderkuota.cobacoba.id\', \'www.orderkuota.cobacoba.id\'],\n  },'
);

fs.writeFileSync(nextConfigPath, updatedConfig, 'utf8');
console.log('✅ Konfigurasi Next.js berhasil diperbaiki.');

// Perbaiki .env
const envPath = path.join(process.cwd(), '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

if (!envContent.includes('NEXT_PUBLIC_APP_URL=')) {
  const updatedEnv = envContent.replace(
    'NEXTAUTH_URL="https://orderkuota.cobacoba.id"',
    'NEXTAUTH_URL="https://orderkuota.cobacoba.id"\nNEXT_PUBLIC_APP_URL="https://orderkuota.cobacoba.id"'
  );
  
  fs.writeFileSync(envPath, updatedEnv, 'utf8');
  console.log('✅ Konfigurasi .env berhasil diperbaiki.');
} else {
  console.log('✅ Konfigurasi .env sudah benar.');
}

// Periksa .env di folder standalone
const standaloneEnvPath = path.join(process.cwd(), '.next/standalone/.env');
if (fs.existsSync(standaloneEnvPath)) {
  let standaloneEnvContent = fs.readFileSync(standaloneEnvPath, 'utf8');
  
  if (!standaloneEnvContent.includes('NEXT_PUBLIC_APP_URL=')) {
    const updatedStandaloneEnv = standaloneEnvContent.replace(
      'NEXTAUTH_URL="https://orderkuota.cobacoba.id"',
      'NEXTAUTH_URL="https://orderkuota.cobacoba.id"\nNEXT_PUBLIC_APP_URL="https://orderkuota.cobacoba.id"'
    );
    
    fs.writeFileSync(standaloneEnvPath, updatedStandaloneEnv, 'utf8');
    console.log('✅ Konfigurasi .env di folder standalone berhasil diperbaiki.');
  } else {
    console.log('✅ Konfigurasi .env di folder standalone sudah benar.');
  }
} else {
  console.log('ℹ️ File .env di folder standalone tidak ditemukan. Akan dibuat saat build.');
}

console.log('\n=== PERBAIKAN SELESAI ===');
console.log('Konfigurasi telah diperbaiki. Untuk menerapkan perubahan:');
console.log('1. Jalankan: npm run build');
console.log('2. Restart aplikasi: pm2 restart asset-management');
console.log('\nHalaman dashboard yang seharusnya sudah dapat diakses setelah build dan restart:');
console.log('- /dashboard/compression-stats');
console.log('- /dashboard/watermarks');
console.log('- /dashboard/archive-reports');
console.log('- /dashboard/audit');