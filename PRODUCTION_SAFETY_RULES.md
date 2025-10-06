# 🛡️ Production Safety Rules & Procedures

## 📋 Overview
Dokumen ini berisi aturan dan prosedur keamanan untuk melindungi database produksi dari penimpaan yang tidak disengaja. Sistem ini dibuat untuk mencegah kejadian seperti yang terjadi sebelumnya dimana database produksi tertimpa secara tidak sengaja.

## 🚨 ATURAN UTAMA

### ❌ DILARANG KERAS
1. **Jangan pernah menjalankan perintah berikut di production tanpa backup:**
   - `npm run seed`
   - `npm run db:push`
   - `prisma db push`
   - `prisma migrate reset`
   - `prisma db seed`

2. **Jangan pernah menimpa file database produksi secara langsung**
3. **Jangan pernah menjalankan script seeding di production tanpa konfirmasi**

### ✅ WAJIB DILAKUKAN
1. **Selalu buat backup sebelum operasi apapun**
2. **Gunakan script protection yang telah disediakan**
3. **Verifikasi environment sebelum menjalankan perintah**
4. **Konfirmasi operasi berbahaya dengan mengetik 'YES'**

## 🔧 Sistem Proteksi yang Tersedia

### 1. Production Protection Script
**Lokasi:** `scripts/prod-protection.sh`

**Fungsi:**
- Mendeteksi environment produksi
- Memblokir operasi berbahaya
- Membuat backup otomatis
- Memverifikasi integritas database

**Cara Penggunaan:**
```bash
# Cek status produksi
./scripts/prod-protection.sh check

# Operasi dengan proteksi
./scripts/prod-protection.sh seed --force-production
```

### 2. Automated Backup System
**Lokasi:** `scripts/auto-backup.sh`

**Fungsi:**
- Backup otomatis dengan timestamp
- Cleanup backup lama (max 10 backup)
- Verifikasi integritas backup
- Restore dari backup

**Cara Penggunaan:**
```bash
# Buat backup manual
./scripts/auto-backup.sh create

# List backup terbaru
./scripts/auto-backup.sh list

# Restore dari backup
./scripts/auto-backup.sh restore backup-file.db

# Lihat statistik backup
./scripts/auto-backup.sh stats
```

### 3. Protected NPM Scripts
Script NPM telah dimodifikasi untuk menggunakan sistem proteksi:

```json
{
  "seed": "scripts/prod-protection.sh seed && tsx scripts/seed.ts",
  "seed:force": "scripts/prod-protection.sh seed --force-production && tsx scripts/seed.ts",
  "db:push": "scripts/prod-protection.sh db-push && prisma db push",
  "db:push:force": "scripts/prod-protection.sh db-push --force-production && prisma db push",
  "db:migrate": "scripts/prod-protection.sh migrate && prisma migrate dev",
  "db:reset": "scripts/prod-protection.sh reset --force-production && prisma migrate reset"
}
```

## 🔍 Deteksi Environment Produksi

Sistem mendeteksi environment produksi melalui:
1. **File marker:** `.production` di root directory
2. **Environment variable:** `NODE_ENV=production`
3. **Database path:** `/home/riyan404/aset-opsoke/prisma/prod.db`

## 📝 Prosedur Operasional

### Untuk Deployment Rutin
```bash
# 1. Cek status produksi
npm run prod:check

# 2. Buat backup pre-deployment
./scripts/auto-backup.sh create pre-deployment

# 3. Deploy aplikasi
npm run build
npm run start

# 4. Verifikasi deployment
curl http://localhost:3001/api/health
```

### Untuk Database Migration
```bash
# 1. Buat backup
./scripts/auto-backup.sh create pre-migration

# 2. Jalankan migration (akan otomatis terproteksi)
npm run db:migrate

# 3. Verifikasi hasil migration
npm run prod:check
```

### Untuk Seeding Data (HATI-HATI!)
```bash
# 1. WAJIB buat backup dulu
./scripts/auto-backup.sh create pre-seeding

# 2. Jalankan dengan force flag (akan minta konfirmasi)
npm run seed:force

# 3. Ketik 'YES' untuk konfirmasi

# 4. Verifikasi hasil
npm run prod:check
```

### Untuk Recovery/Restore
```bash
# 1. List backup yang tersedia
./scripts/auto-backup.sh list

# 2. Restore dari backup tertentu
./scripts/auto-backup.sh restore backups/database-backup-YYYY-MM-DD.db

# 3. Restart server
# (server akan restart otomatis jika menggunakan PM2)
```

## ⚠️ Warning Signs

Jika Anda melihat pesan berikut, STOP dan pikirkan lagi:

```
❌ DANGEROUS OPERATION BLOCKED: seed
❌ This operation could destroy production data!
```

```
⚠️  PRODUCTION ENVIRONMENT DETECTED!
⚠️  You are about to perform: seed
⚠️  This will affect the PRODUCTION database!
```

## 🆘 Emergency Procedures

### Jika Database Produksi Rusak
1. **Jangan panik**
2. **Hentikan server produksi**
3. **Cek backup yang tersedia:** `./scripts/auto-backup.sh list`
4. **Restore dari backup terbaru:** `./scripts/auto-backup.sh restore [backup-file]`
5. **Restart server**
6. **Verifikasi data**

### Jika Backup Tidak Ada
1. **Cek direktori backup:** `ls -la backups/`
2. **Cek backup database lain:** `ls -la prisma/*.backup*`
3. **Hubungi tim untuk recovery dari server lain**

## 📊 Monitoring & Maintenance

### Daily Checks
```bash
# Cek status backup
./scripts/auto-backup.sh stats

# Cek integritas database
npm run prod:check
```

### Weekly Maintenance
```bash
# Cleanup backup lama
./scripts/auto-backup.sh cleanup

# Verifikasi semua backup
for backup in backups/*.db; do
  echo "Checking $backup"
  sqlite3 "$backup" "SELECT COUNT(*) FROM users;"
done
```

## 🔐 Access Control

### File Permissions
```bash
# Script harus executable
chmod +x scripts/prod-protection.sh
chmod +x scripts/auto-backup.sh

# Database harus protected
chmod 644 prisma/prod.db

# Backup directory harus accessible
chmod 755 backups/
```

### Environment Variables
```bash
# Set di production server
export NODE_ENV=production
export DATABASE_URL="file:/home/riyan404/aset-opsoke/prisma/prod.db"
```

## 📞 Kontak Darurat

Jika terjadi masalah serius:
1. **Hentikan semua operasi**
2. **Dokumentasikan apa yang terjadi**
3. **Hubungi tim development**
4. **Jangan mencoba fix sendiri tanpa backup**

## 📚 Referensi

- **Production Protection Script:** `scripts/prod-protection.sh --help`
- **Auto Backup Script:** `scripts/auto-backup.sh --help`
- **Database Schema:** `prisma/schema.prisma`
- **Login Credentials:** `LOGIN_CREDENTIALS.md`

---

**⚠️ INGAT: Lebih baik aman daripada menyesal. Selalu backup sebelum operasi apapun!**

**📅 Dokumen ini dibuat:** $(date)
**🔄 Terakhir diupdate:** $(date)