# 🚀 Quick Deploy Guide - Dev to Prod

## Panduan Cepat Push Improvement dari Dev ke Prod

### 📋 Checklist Sebelum Deploy
```bash
# 1. Cek status sistem proteksi
npm run prod:check

# 2. Buat backup wajib sebelum perubahan
npm run prod:backup
```

### 🔄 Workflow Deploy Standard
```bash
# 1. Pull code terbaru
git pull origin main

# 2. Build aplikasi (aman)
npm run build

# 3. Jika ada perubahan database schema
npm run db:push:force
# ⚠️ Ketik 'yes' saat diminta konfirmasi

# 4. Jika perlu update data/seeding
npm run seed:force
# ⚠️ Ketik 'yes' saat diminta konfirmasi

# 5. Restart server
pm2 restart asset-management-dev

# 6. Verifikasi deploy berhasil
npm run prod:check
```

### 🚨 PERINTAH YANG DIBLOKIR (JANGAN GUNAKAN!)
```bash
npm run seed          # ❌ DIBLOKIR
npm run db:push       # ❌ DIBLOKIR  
npm run db:migrate    # ❌ DIBLOKIR
npx prisma db push    # ❌ DIBLOKIR
npx prisma migrate    # ❌ DIBLOKIR
```

### ✅ PERINTAH YANG AMAN
```bash
npm run seed:force      # ✅ Dengan konfirmasi
npm run db:push:force   # ✅ Dengan konfirmasi
npm run prod:check      # ✅ Selalu aman
npm run prod:backup     # ✅ Selalu aman
npm run build           # ✅ Selalu aman
git pull/push           # ✅ Selalu aman
pm2 restart            # ✅ Selalu aman
```

### 🆘 Emergency Recovery
```bash
# Lihat daftar backup
./scripts/auto-backup.sh list

# Restore dari backup
./scripts/auto-backup.sh restore [nama-file-backup]

# Cek statistik backup
./scripts/auto-backup.sh stats
```

### 💡 Tips Penting
- ✅ **SELALU backup dulu** sebelum perubahan apapun
- ✅ **Gunakan perintah `:force`** untuk operasi database
- ✅ **Baca konfirmasi** dengan teliti sebelum ketik 'yes'
- ✅ **Test di dev** dulu sebelum push ke prod
- ✅ **Simpan log backup** untuk referensi

### 🛡️ Sistem Proteksi Aktif
- Deteksi otomatis lingkungan produksi
- Backup otomatis sebelum operasi berbahaya
- Konfirmasi manual untuk operasi sensitif
- Verifikasi integritas backup
- Cleanup backup lama (simpan 10 terakhir)

---
**📝 Catatan:** File ini adalah panduan cepat. Untuk detail lengkap, lihat `PRODUCTION_SAFETY_RULES.md`