# Domain Deployment Guide - orderkuota.cobacoba.id

Panduan lengkap untuk mengarahkan domain `orderkuota.cobacoba.id` ke aplikasi Asset Management.

## 📋 Prerequisites

- Server VPS dengan IP: `103.197.191.12`
- Domain `orderkuota.cobacoba.id` sudah terdaftar
- Akses root/sudo ke server
- Node.js dan npm sudah terinstall

## 🚀 Quick Deployment

Jalankan script deployment otomatis:

```bash
./deploy-domain.sh
```

## 📝 Manual Setup Steps

### 1. DNS Configuration

Tambahkan record DNS berikut di panel domain Anda:

```
Type: A
Name: orderkuota.cobacoba.id
Value: 103.197.191.12
TTL: 300

Type: CNAME
Name: www.orderkuota.cobacoba.id
Value: orderkuota.cobacoba.id
TTL: 300
```

### 2. Application Configuration

File konfigurasi sudah diupdate:

- ✅ `.env` - NEXTAUTH_URL dan NODE_ENV
- ✅ `next.config.ts` - allowedDevOrigins dan security headers
- ✅ `docker-compose.yml` - environment variables
- ✅ `nginx.conf` - reverse proxy configuration

### 3. Build & Deploy Application

```bash
# Build aplikasi
npm run build

# Install PM2 (jika belum ada)
npm install -g pm2

# Start aplikasi dengan PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Nginx Setup

```bash
# Install Nginx (jika belum ada)
sudo apt update
sudo apt install nginx

# Copy konfigurasi
sudo cp nginx.conf /etc/nginx/sites-available/orderkuota.cobacoba.id

# Enable site
sudo ln -s /etc/nginx/sites-available/orderkuota.cobacoba.id /etc/nginx/sites-enabled/

# Test konfigurasi
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 5. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d orderkuota.cobacoba.id -d www.orderkuota.cobacoba.id

# Auto-renewal (optional)
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. Firewall Configuration

```bash
# Allow Nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

## 🔧 Configuration Files

### Environment Variables (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-12345"
NEXTAUTH_SECRET="your-nextauth-secret-key-change-this-in-production-67890"
NEXTAUTH_URL="https://orderkuota.cobacoba.id"
NODE_ENV="production"
```

### PM2 Ecosystem (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'asset-management',
    script: 'npm',
    args: 'start',
    cwd: '/home/riyan404/aset-opsoke',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

## 🔍 Monitoring & Troubleshooting

### Check Application Status
```bash
# PM2 status
pm2 status

# View logs
pm2 logs asset-management

# Restart aplikasi
pm2 restart asset-management
```

### Check Nginx Status
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