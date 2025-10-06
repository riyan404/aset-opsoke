# 🚀 Deploy Commands - Copy Paste Ready

## Langkah 1: Persiapan
```bash
cd /home/riyan404/aset-opsoke
npm run prod:check
npm run prod:backup
```

## Langkah 2: Pull & Build
```bash
git pull origin main
npm run build
```

## Langkah 3: Database (Jika Ada Perubahan Schema)
```bash
npm run db:push:force
# Ketik: yes
```

## Langkah 4: Data Update (Jika Perlu)
```bash
npm run seed:force
# Ketik: yes
```

## Langkah 5: Restart Server
```bash
pm2 restart asset-management-dev
```

## Langkah 6: Verifikasi
```bash
npm run prod:check
```

---

## 🆘 Emergency Recovery
```bash
# Lihat backup
./scripts/auto-backup.sh list

# Restore backup
./scripts/auto-backup.sh restore [nama-file]
```

---

## ⚠️ JANGAN GUNAKAN
```bash
npm run seed          # ❌
npm run db:push       # ❌
npm run db:migrate    # ❌
npx prisma db push    # ❌
```

---
**💡 Tip:** Copy paste satu per satu, tunggu selesai sebelum lanjut ke perintah berikutnya.