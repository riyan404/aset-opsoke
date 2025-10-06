# 🚨 PRODPROMPT - Production Database Protection Rules

## ⚠️ CRITICAL WARNING
**JANGAN PERNAH MENIMPA DATABASE PRODUKSI TANPA BACKUP!**

Dokumen ini adalah **PRODPROMPT** - aturan wajib yang harus diikuti untuk melindungi database produksi dari penimpaan yang tidak disengaja.

## 🛡️ SISTEM PROTEKSI AKTIF

### 1. Environment Detection
- ✅ File marker `.production` telah dibuat
- ✅ Environment variables dikonfigurasi
- ✅ Database path produksi: `prisma/prod.db`

### 2. Protection Scripts
- ✅ `scripts/prod-protection.sh` - Proteksi utama
- ✅ `scripts/auto-backup.sh` - Sistem backup otomatis
- ✅ NPM scripts telah dimodifikasi dengan proteksi

### 3. Automated Safeguards
- ✅ Backup otomatis sebelum operasi berbahaya
- ✅ Konfirmasi manual untuk operasi destruktif
- ✅ Verifikasi integritas database
- ✅ Cleanup backup otomatis (max 10 backup)

## 🚫 OPERASI YANG DIBLOKIR

Operasi berikut **DIBLOKIR OTOMATIS** di production:

```bash
# ❌ DIBLOKIR - akan meminta konfirmasi dan backup
npm run seed
npm run db:push
prisma db push
prisma migrate reset
prisma db seed
```

## ✅ OPERASI YANG AMAN

Gunakan perintah berikut untuk operasi yang aman:

```bash
# ✅ Cek status produksi
npm run prod:check
./scripts/prod-protection.sh check

# ✅ Buat backup manual
npm run prod:backup
./scripts/auto-backup.sh create

# ✅ Lihat statistik backup
./scripts/auto-backup.sh stats

# ✅ List backup tersedia
./scripts/auto-backup.sh list
```

## 🔧 OPERASI DENGAN PROTEKSI

Jika BENAR-BENAR perlu melakukan operasi berbahaya:

```bash
# ⚠️ Dengan proteksi dan konfirmasi
npm run seed:force          # Akan minta konfirmasi 'YES'
npm run db:push:force        # Akan minta konfirmasi 'YES'

# ⚠️ Bypass proteksi (SANGAT BERBAHAYA!)
./scripts/prod-protection.sh seed --force-production
```

## 📋 CHECKLIST SEBELUM OPERASI

Sebelum melakukan operasi apapun di production:

- [ ] ✅ Cek environment: `npm run prod:check`
- [ ] ✅ Buat backup: `npm run prod:backup`
- [ ] ✅ Verifikasi backup: `./scripts/auto-backup.sh list`
- [ ] ✅ Konfirmasi operasi yang akan dilakukan
- [ ] ✅ Siapkan rollback plan
- [ ] ✅ Monitor hasil operasi

## 🆘 EMERGENCY RECOVERY

Jika database produksi rusak:

```bash
# 1. Hentikan server
# (server berjalan di terminal 3)

# 2. List backup tersedia
./scripts/auto-backup.sh list

# 3. Restore dari backup
./scripts/auto-backup.sh restore [backup-file]

# 4. Restart server
DATABASE_URL="file:/home/riyan404/aset-opsoke/prisma/prod.db" PORT=3001 node dist/standalone/server.js
```

## 📊 STATUS SISTEM SAAT INI

**Environment:** Production ✅
**Database:** `/home/riyan404/aset-opsoke/prisma/prod.db` ✅
**Server:** Running on port 3001 ✅
**Backup System:** Active (4 backups, 83MB total) ✅
**Protection Scripts:** Active ✅

**Data Produksi:**
- Users: 9
- Physical Assets: 2  
- Digital Assets: 90
- Total Backups: 4

## 🔐 AKSES & KREDENSIAL

**Login Credentials:** Lihat `LOGIN_CREDENTIALS.md`
**Server URL:** http://localhost:3001
**Database Path:** `/home/riyan404/aset-opsoke/prisma/prod.db`

## 📝 LOG OPERASI

**Terakhir Diupdate:** $(date)
**Sistem Dibuat:** Untuk mencegah penimpaan database produksi
**Status:** AKTIF dan TERLINDUNGI

---

## 🎯 PESAN UNTUK DEVELOPER

**INGAT:** Kasus penimpaan database produksi yang terjadi sebelumnya telah diatasi dengan sistem proteksi ini. 

**JANGAN PERNAH:**
- Menjalankan seed di production tanpa backup
- Bypass proteksi tanpa alasan kuat
- Menimpa file database secara langsung
- Mengabaikan warning dari sistem proteksi

**SELALU:**
- Buat backup sebelum operasi apapun
- Verifikasi environment sebelum menjalankan perintah
- Ikuti prosedur yang telah ditetapkan
- Dokumentasikan setiap perubahan

---

**🛡️ SISTEM PROTEKSI AKTIF - DATABASE PRODUKSI TERLINDUNGI**