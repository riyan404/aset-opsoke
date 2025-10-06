# Domain Deployment Guide

Panduan lengkap untuk deployment aplikasi Asset Management System ke domain production.

## 📋 Prerequisites

- Server VPS dengan akses root/sudo
- Domain yang sudah terdaftar
- Node.js 18+ dan npm terinstall
- PM2 untuk process management
- Nginx untuk reverse proxy

## 🚀 Quick Deployment

### 1. Persiapan Server

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git (jika belum ada)
sudo apt install git -y
```

### 2. Clone dan Setup Aplikasi

```bash
# Clone repository
git clone <repository-url>
cd aset-opsoke

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 3. Konfigurasi Environment

Edit file `.env` dengan konfigurasi production:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXTAUTH_SECRET="your-nextauth-secret-key-change-this-in-production"
NEXTAUTH_URL="https://yourdomain.com"

# Environment
NODE_ENV="production"
PORT=3000

# Email Configuration
MAILTRAP_API_TOKEN="your-mailtrap-token"
MAILTRAP_HOST="send.api.mailtrap.io"
MAILTRAP_FROM_EMAIL="noreply@yourdomain.com"
MAILTRAP_FROM_NAME="Asset Management System"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database with initial data
npx prisma db seed
```

### 5. Build Aplikasi

```bash
# Build untuk production
npm run build

# Test build locally (optional)
npm start
```

### 6. PM2 Configuration

Buat file `ecosystem.config.js` untuk konfigurasi PM2:

```javascript
module.exports = {
  apps: [{
    name: 'asset-management',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/your/aset-opsoke',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start aplikasi dengan PM2:

```bash
# Create logs directory
mkdir -p logs

# Start aplikasi
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the instructions shown by PM2
```

### 7. DNS Configuration

Tambahkan record DNS berikut di panel domain Anda:

```
Type: A
Name: yourdomain.com
Value: YOUR_SERVER_IP
TTL: 300

Type: A
Name: www.yourdomain.com
Value: YOUR_SERVER_IP
TTL: 300
```

### 8. Nginx Configuration

Buat file konfigurasi Nginx `/etc/nginx/sites-available/asset-management`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (akan diatur oleh Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Favicon and robots.txt
    location = /favicon.ico {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }

    location = /robots.txt {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

Enable site dan restart Nginx:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 9. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron job
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 10. Firewall Configuration

```bash
# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3000  # Optional, for direct access

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## 🔧 Configuration Files

### Environment Variables (.env)
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXTAUTH_SECRET="your-nextauth-secret-key-change-this-in-production"
NEXTAUTH_URL="https://yourdomain.com"

# Environment
NODE_ENV="production"
PORT=3000

# Email Configuration
MAILTRAP_API_TOKEN="your-mailtrap-token"
MAILTRAP_HOST="send.api.mailtrap.io"
MAILTRAP_FROM_EMAIL="noreply@yourdomain.com"
MAILTRAP_FROM_NAME="Asset Management System"
```

### Next.js Configuration (next.config.ts)
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  images: {
    domains: ['localhost', 'yourdomain.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

## 🔍 Monitoring & Troubleshooting

### Check Application Status
```bash
# PM2 status
pm2 status

# View logs
pm2 logs asset-management

# Monitor resources
pm2 monit

# Restart aplikasi
pm2 restart asset-management

# Reload aplikasi (zero downtime)
pm2 reload asset-management
```

### Check Nginx Status
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Database Management
```bash
# Backup database
cp prisma/dev.db prisma/backup-$(date +%Y%m%d-%H%M%S).db

# View database
npx prisma studio

# Reset database (CAUTION: This will delete all data)
npx prisma migrate reset
```

### SSL Certificate Management
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## 🚨 Common Issues & Solutions

### 1. Application Won't Start
```bash
# Check PM2 logs
pm2 logs asset-management

# Check if port is in use
sudo netstat -tlnp | grep :3000

# Kill process using port 3000
sudo kill -9 $(sudo lsof -t -i:3000)
```

### 2. Database Connection Issues
```bash
# Check database file permissions
ls -la prisma/dev.db

# Fix permissions if needed
chmod 644 prisma/dev.db

# Regenerate Prisma client
npx prisma generate
```

### 3. Nginx 502 Bad Gateway
```bash
# Check if application is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### 4. SSL Certificate Issues
```bash
# Check certificate expiry
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Check SSL configuration
sudo nginx -t
```

### 5. Performance Issues
```bash
# Monitor system resources
htop

# Check PM2 monitoring
pm2 monit

# Restart application
pm2 restart asset-management
```

## 📊 Performance Optimization

### 1. Enable Gzip Compression
Already included in Nginx configuration above.

### 2. Database Optimization
```bash
# Analyze database
npx prisma db execute --file analyze.sql

# Optimize database (SQLite)
echo "VACUUM;" | sqlite3 prisma/dev.db
```

### 3. PM2 Cluster Mode
For high-traffic applications:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'asset-management',
    script: 'npm',
    args: 'start',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    // ... other configurations
  }]
};
```

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Rebuild application
npm run build

# Restart with zero downtime
pm2 reload asset-management
```

### System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js (if needed)
sudo npm install -g n
sudo n stable

# Update PM2
sudo npm install -g pm2@latest
pm2 update
```

### Backup Strategy
```bash
#!/bin/bash
# backup.sh - Run daily via cron

BACKUP_DIR="/home/backups/asset-management"
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp /path/to/aset-opsoke/prisma/dev.db $BACKUP_DIR/db-backup-$DATE.db

# Backup application files
tar -czf $BACKUP_DIR/app-backup-$DATE.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  /path/to/aset-opsoke

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Add to crontab:
```bash
sudo crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## 📞 Support & Maintenance

### Health Check Endpoint
Monitor application health: `https://yourdomain.com/api/health`

### Log Locations
- Application logs: `./logs/`
- PM2 logs: `~/.pm2/logs/`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

### Monitoring Tools
- PM2 monitoring: `pm2 monit`
- System monitoring: `htop`, `iotop`, `nethogs`
- Disk usage: `df -h`, `du -sh *`

Untuk bantuan lebih lanjut, periksa dokumentasi atau hubungi tim development.
```bash
# Status Nginx
sudo systemctl status nginx

# Test konfigurasi
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Check SSL Certificate
```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run
```

## 🌐 Access URLs

Setelah deployment selesai:

- **Production:** https://orderkuota.cobacoba.id
- **WWW:** https://www.orderkuota.cobacoba.id
- **Development:** http://localhost:3001 (masih berjalan)

## 🔐 Security Features

- ✅ HTTPS redirect
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options)
- ✅ SSL/TLS encryption
- ✅ Gzip compression
- ✅ Static file caching

## 📞 Support

Jika mengalami masalah:

1. Check logs: `pm2 logs asset-management`
2. Check Nginx: `sudo nginx -t`
3. Check DNS: `nslookup orderkuota.cobacoba.id`
4. Check SSL: `openssl s_client -connect orderkuota.cobacoba.id:443`

---

**Note:** Pastikan DNS sudah propagasi sebelum mengakses domain (biasanya 5-30 menit).