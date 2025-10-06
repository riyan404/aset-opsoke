# 📤 Git Push Commands - Copy Paste Ready

## Push Biasa (Feature/Bug Fix)
```bash
git add .
git commit -m "feat: deskripsi perubahan"
git push origin main
```

## Push dengan Pesan Commit yang Jelas
```bash
git add .
git commit -m "fix: perbaikan bug login"
git push origin main
```

## Push Setelah Pull (Sync dengan Remote)
```bash
git pull origin main
git add .
git commit -m "update: sinkronisasi dengan remote"
git push origin main
```

## Push Force (Hati-hati!)
```bash
git add .
git commit -m "force: perbaikan konflik"
git push origin main --force
```

---

## 📝 Template Commit Messages

### Feature Baru
```bash
git commit -m "feat: tambah fitur dashboard analytics"
```

### Bug Fix
```bash
git commit -m "fix: perbaiki error 500 pada login"
```

### Update/Improvement
```bash
git commit -m "update: tingkatkan performa query database"
```

### Refactor
```bash
git commit -m "refactor: reorganisasi struktur komponen"
```

### Documentation
```bash
git commit -m "docs: tambah panduan deployment"
```

---

## 🔄 Workflow Lengkap (Recommended)
```bash
# 1. Cek status
git status

# 2. Pull terbaru
git pull origin main

# 3. Add semua perubahan
git add .

# 4. Commit dengan pesan jelas
git commit -m "feat: deskripsi perubahan"

# 5. Push ke GitHub
git push origin main
```

---

## 🆘 Jika Ada Konflik
```bash
# 1. Pull dulu
git pull origin main

# 2. Resolve konflik manual di file
# (Edit file yang konflik)

# 3. Add file yang sudah diresolve
git add .

# 4. Commit hasil resolve
git commit -m "resolve: fix merge conflict"

# 5. Push
git push origin main
```

---

## 📋 Quick Commands
```bash
# Status cepat
git status

# Log commit terakhir
git log --oneline -5

# Lihat perubahan
git diff

# Undo commit terakhir (keep changes)
git reset --soft HEAD~1

# Undo semua perubahan (dangerous!)
git reset --hard HEAD
```

---

**💡 Tips:**
- Selalu `git pull` sebelum `git push`
- Gunakan pesan commit yang jelas dan deskriptif
- Jangan gunakan `--force` kecuali benar-benar perlu
- Cek `git status` sebelum commit