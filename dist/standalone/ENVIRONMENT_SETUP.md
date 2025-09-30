# Environment Setup Guide

## Overview
Aplikasi Asset Management sekarang mendukung dua environment terpisah:
- **Development Environment**: Port 3000, menggunakan `dev.db`
- **Production Environment**: Port 3001, menggunakan `prod.db`

## File Structure
```
├── .env                    # Default environment (development)
├── .env.development        # Development environment variables
├── .env.production         # Production environment variables
├── ecosystem.config.js     # PM2 configuration for both environments
├── prisma/
│   ├── dev.db             # Development database
│   ├── prod.db            # Production database
│   └── prod.db.backup     # Backup of original production data
└── logs/                  # PM2 log files
```

## Environment Variables

### Development (.env.development)
- `DATABASE_URL`: Points to `prisma/dev.db`
- `NODE_ENV`: "development"
- `PORT`: 3000
- `NEXTAUTH_URL`: http://localhost:3000
- `NEXT_PUBLIC_APP_URL`: http://localhost:3000

### Production (.env.production)
- `DATABASE_URL`: Points to `prisma/prod.db`
- `NODE_ENV`: "production"
- `PORT`: 3001
- `NEXTAUTH_URL`: http://localhost:3001
- `NEXT_PUBLIC_APP_URL`: http://localhost:3001

## PM2 Configuration

### Applications
1. **asset-management-dev**: Development server
2. **asset-management-prod**: Production server

### Commands

#### Start Both Environments
```bash
pm2 start ecosystem.config.js
```

#### Start Specific Environment
```bash
# Development only
pm2 start ecosystem.config.js --only asset-management-dev

# Production only
pm2 start ecosystem.config.js --only asset-management-prod
```

#### Stop Applications
```bash
# Stop all
pm2 stop all

# Stop specific
pm2 stop asset-management-dev
pm2 stop asset-management-prod
```

#### Restart Applications
```bash
# Restart all
pm2 restart all

# Restart specific
pm2 restart asset-management-dev
pm2 restart asset-management-prod
```

#### View Status
```bash
pm2 status
```

#### View Logs
```bash
# All logs
pm2 logs

# Specific application logs
pm2 logs asset-management-dev
pm2 logs asset-management-prod
```

## Database Management

### Schema Updates
Setelah mengubah `prisma/schema.prisma`, jalankan:
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to development
NODE_ENV=development npx prisma db push

# Push schema changes to production
NODE_ENV=production npx prisma db push
```

### Database Backup
```bash
# Backup development database
cp prisma/dev.db prisma/dev.db.backup.$(date +%Y%m%d%H%M%S)

# Backup production database
cp prisma/prod.db prisma/prod.db.backup.$(date +%Y%m%d%H%M%S)
```

## Testing Endpoints

### Development Environment (Port 3000)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"riyannalfiansyah@gmail.com","password":"admin123"}'
```

### Production Environment (Port 3001)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"riyannalfiansyah@gmail.com","password":"admin123"}'
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
ss -tlnp | grep :3000
ss -tlnp | grep :3001

# Kill process if needed
pkill -f "next dev"
pkill -f "next start"
```

### Database Issues
```bash
# Check database tables
sqlite3 prisma/dev.db ".tables"
sqlite3 prisma/prod.db ".tables"

# Check user data
sqlite3 prisma/dev.db "SELECT email, username FROM users LIMIT 5;"
sqlite3 prisma/prod.db "SELECT email, username FROM users LIMIT 5;"
```

### PM2 Issues
```bash
# Delete all PM2 processes
pm2 delete all

# Restart PM2 daemon
pm2 kill
pm2 start ecosystem.config.js
```

## Security Notes
- Production environment menggunakan environment variables yang berbeda untuk keamanan
- Database production dan development terpisah untuk mencegah data corruption
- Log files disimpan terpisah untuk setiap environment
- JWT secrets berbeda untuk setiap environment

## Monitoring
- Development logs: `logs/dev-out.log`, `logs/dev-error.log`
- Production logs: `logs/prod-out.log`, `logs/prod-error.log`
- PM2 monitoring: `pm2 monit`