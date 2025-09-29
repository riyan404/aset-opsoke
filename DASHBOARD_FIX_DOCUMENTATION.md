# Dokumentasi Perbaikan Masalah Dashboard

## Masalah

Halaman dashboard mengalami error karena masalah konfigurasi domain. Domain `orderkuota.cobacoba.id` dikonfigurasi sebagai `NEXTAUTH_URL` di file `.env` tetapi tidak dikonfigurasi dengan benar di `next.config.ts` sebagai domain utama aplikasi.

## Analisis Masalah

1. **Konfigurasi Domain Tidak Konsisten**:
   - Domain `orderkuota.cobacoba.id` hanya ditambahkan sebagai `allowedDevOrigins` di `next.config.ts`
   - Domain tersebut dikonfigurasi sebagai `NEXTAUTH_URL` di file `.env`
   - Tidak ada konfigurasi `basePath`, `assetPrefix`, atau `images.domains` yang mendukung domain tersebut

2. **Dampak**:
   - Halaman dashboard tidak dapat dimuat dengan benar
   - Aset dan gambar mungkin tidak dapat diakses
   - Autentikasi mungkin tidak berfungsi dengan benar

## Solusi

### 1. Perbaikan Konfigurasi Next.js

File `next.config.ts` telah diperbarui dengan menambahkan konfigurasi berikut:

```typescript
const nextConfig = {
  output: 'standalone',
  distDir: 'dist',
  // Konfigurasi untuk domain orderkuota.cobacoba.id
  images: {
    domains: ['orderkuota.cobacoba.id', 'localhost'],
  },
  // ... konfigurasi lainnya
}
```

### 2. Perbaikan Konfigurasi Environment

File `.env` telah diperbarui dengan menambahkan:

```
NEXT_PUBLIC_APP_URL="https://orderkuota.cobacoba.id"
```

### 3. Script Perbaikan

Script `fix-dashboard-pages.js` telah dibuat untuk memperbaiki konfigurasi secara otomatis:

```javascript
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Fungsi utama
function main() {
  console.log('🔧 Memulai perbaikan konfigurasi dashboard...');
  
  // Perbaiki konfigurasi
  fixNextConfig();
  fixEnvConfig();
  fixStandaloneEnvConfig();
  
  console.log('\n✅ Perbaikan konfigurasi selesai!');
  console.log('\nLangkah selanjutnya:');
  console.log('1. Jalankan "npm run build" untuk membangun ulang aplikasi');
  console.log('2. Restart aplikasi dengan "pm2 restart asset-management"');
  console.log('\nSetelah itu, halaman dashboard seharusnya berfungsi dengan benar.');
}

// Jalankan fungsi utama
main();
```

## Langkah-langkah Penerapan

1. Perbarui file `next.config.ts` dengan menambahkan konfigurasi domain
2. Perbarui file `.env` dengan menambahkan `NEXT_PUBLIC_APP_URL`
3. Jalankan script `fix-dashboard-pages.js` untuk memastikan semua konfigurasi sudah benar
4. Build ulang aplikasi dengan `npm run build`
5. Restart aplikasi dengan `pm2 restart asset-management`

## Pencegahan Masalah di Masa Depan

1. Pastikan konfigurasi domain konsisten di semua file konfigurasi
2. Gunakan variabel lingkungan yang sama untuk URL aplikasi di seluruh kode
3. Tambahkan tes otomatis untuk memverifikasi konfigurasi domain
4. Dokumentasikan proses deployment dengan domain kustom