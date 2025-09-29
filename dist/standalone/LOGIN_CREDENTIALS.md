# 🔐 Login Credentials untuk Testing

## 📋 Daftar User dan Password

### 👑 Admin Users
1. **Super Admin**
   - Email: `riyannalfiansyah@gmail.com`
   - Password: `admin123`
   - Role: ADMIN
   - Department: Administration

2. **IT Admin**
   - Email: `it.test@company.com`
   - Password: `testpassword123`
   - Role: ADMIN
   - Department: IT

### 👤 Regular Users
3. **Digital User**
   - Email: `digitalkontenoke@gmail.com`
   - Password: `admin123`
   - Role: USER
   - Department: Digital

4. **Marketing User**
   - Email: `marketing.test@company.com`
   - Password: `testpassword123`
   - Role: USER
   - Department: Marketing

5. **Finance User**
   - Email: `finance.test@company.com`
   - Password: `testpassword123`
   - Role: USER
   - Department: Finance

6. **HR User**
   - Email: `hr.test@company.com`
   - Password: `testpassword123`
   - Role: USER
   - Department: HR

## 🔍 Penjelasan Masalah Login

**Masalah yang ditemukan:**
- Hanya user `riyannalfiansyah@gmail.com` yang bisa login karena menggunakan password `admin123`
- User lain menggunakan password `testpassword123` yang berbeda

**Solusi:**
- Gunakan password yang benar sesuai dengan user yang ingin ditest
- Password untuk test users adalah: `testpassword123`
- Password untuk admin utama adalah: `admin123`

## 🧪 Testing Department Permissions

Untuk menguji fitur Department Permissions, gunakan credentials berikut:

### Test Case 1: Marketing Department
- Login: `marketing.test@company.com` / `testpassword123`
- Expected: Akses terbatas sesuai permission Marketing

### Test Case 2: Finance Department  
- Login: `finance.test@company.com` / `testpassword123`
- Expected: Akses terbatas sesuai permission Finance

### Test Case 3: HR Department
- Login: `hr.test@company.com` / `testpassword123`
- Expected: Akses terbatas sesuai permission HR

### Test Case 4: IT Department (Admin)
- Login: `it.test@company.com` / `testpassword123`
- Expected: Akses admin dengan permission IT

## 📊 Status Database

✅ **6 users** telah dibuat dengan benar
✅ **Password hashes** tersimpan dengan benar di database
✅ **Department permissions** telah dikonfigurasi
✅ **Authentication system** berfungsi normal

## 🚀 Cara Testing

1. Buka halaman login: http://localhost:3000/login
2. Gunakan salah satu credentials di atas
3. Verifikasi akses sesuai dengan department permissions
4. Test berbagai fitur sesuai dengan role dan department

---
*Dibuat pada: ${new Date().toLocaleString()}*