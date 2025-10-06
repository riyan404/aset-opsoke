# 🏢 Sistem Manajemen Aset

Sistem manajemen aset perusahaan yang komprehensif dengan fitur multi-departemen, kontrol akses berbasis peran, dan manajemen dokumen terintegrasi.

## 🚀 Fitur Utama

### 📊 **Dashboard & Analytics**
- Dashboard interaktif dengan statistik real-time
- Grafik dan chart untuk visualisasi data aset
- Filter berdasarkan departemen dan kategori
- Export data dalam berbagai format

### 🏗️ **Manajemen Aset**
- **Aset Fisik**: Komputer, furniture, kendaraan, dll.
- **Aset Digital**: Software, lisensi, domain, hosting
- **Dokumen**: Kontrak, invoice, sertifikat, manual
- Upload foto dan file pendukung
- Tracking status dan kondisi aset
- Riwayat maintenance dan perbaikan

### 👥 **Manajemen User & Departemen**
- Role-based access control (Admin/User)
- Multi-departemen: IT, Finance, Marketing, Digital, Operational
- Permission granular per fitur dan departemen
- User profile dengan foto dan informasi lengkap

### 🔐 **Keamanan & Autentikasi**
- JWT-based authentication
- Session management
- Password hashing dengan bcrypt
- Middleware protection untuk API routes
- CORS dan security headers

### 📱 **User Interface**
- Responsive design untuk desktop dan mobile
- Dark/Light mode support
- Modern UI dengan Tailwind CSS dan shadcn/ui
- Loading states dan error handling
- Toast notifications

### 🔍 **Pencarian & Filter**
- Global search across all assets
- Advanced filtering by category, department, status
- Sorting dan pagination
- Real-time search suggestions

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: SQLite dengan Prisma ORM
- **Authentication**: NextAuth.js dengan JWT
- **File Upload**: Multer untuk handling files
- **Deployment**: PM2, Docker, Nginx
- **Development**: ESLint, Prettier, TypeScript

## 📋 Prerequisites

- Node.js 18+ 
- npm atau yarn
- SQLite (included)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd aset-opsoke
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` file:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key"
JWT_SECRET="your-jwt-secret"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🔑 Default Login Credentials

### Admin Account
- **Email**: `riyannalfiansyah@gmail.com`
- **Password**: `admin123`
- **Role**: ADMIN
- **Department**: Administration

### Test Users
Lihat file `LOGIN_CREDENTIALS.md` untuk daftar lengkap user testing.

## 📁 Struktur Project

```
aset-opsoke/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── login/          # Authentication
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable components
│   │   ├── ui/            # shadcn/ui components
│   │   └── forms/         # Form components
│   ├── contexts/          # React contexts
│   └── lib/               # Utilities & helpers
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── public/                # Static assets
└── scripts/               # Utility scripts
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio
npx prisma migrate   # Run migrations
npx prisma generate  # Generate Prisma client
npm run seed         # Seed database

# Production
npm run build        # Build application
pm2 start ecosystem.config.js  # Start with PM2
```

## 🚀 Deployment

### Production dengan PM2
```bash
# Build aplikasi
npm run build

# Start dengan PM2
pm2 start ecosystem.config.js --env production

# Monitor
pm2 status
pm2 logs
```

### Docker Deployment
```bash
# Build dan run dengan Docker Compose
docker-compose up --build -d

# Check status
docker-compose ps
```

Lihat `DOCKER_DEPLOYMENT.md` untuk panduan lengkap.

### Domain Deployment
Untuk deployment ke domain custom, lihat `DOMAIN_DEPLOYMENT.md`.

## 📚 Dokumentasi Tambahan

- **[Docker Deployment](DOCKER_DEPLOYMENT.md)** - Panduan deployment dengan Docker
- **[Domain Deployment](DOMAIN_DEPLOYMENT.md)** - Setup domain dan SSL
- **[Login Credentials](LOGIN_CREDENTIALS.md)** - Daftar user untuk testing
- **[Login Fix Documentation](LOGIN_FIX_DOCUMENTATION.md)** - Troubleshooting login issues

## 🐛 Troubleshooting

### Masalah Umum

**1. Login Gagal**
- Pastikan JWT_SECRET sudah diset di `.env`
- Cek kredensial di `LOGIN_CREDENTIALS.md`
- Restart server setelah mengubah environment variables

**2. Database Error**
- Jalankan `npx prisma generate`
- Cek DATABASE_URL di `.env`
- Pastikan file database ada dan accessible

**3. Permission Denied**
- Cek role dan department user
- Pastikan user memiliki permission yang sesuai
- Logout dan login ulang

**4. File Upload Gagal**
- Cek folder `public/uploads` ada dan writable
- Pastikan ukuran file tidak melebihi limit
- Cek format file yang diizinkan

### Performance Issues

**1. Slow Loading**
- Enable caching di production
- Optimize images dan assets
- Check database queries

**2. Memory Issues**
- Monitor dengan `pm2 monit`
- Restart aplikasi jika diperlukan
- Check for memory leaks

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Untuk bantuan dan support:
- Email: riyannalfiansyah@gmail.com
- Create issue di repository ini

---

**Built with ❤️ using Next.js and modern web technologies**
