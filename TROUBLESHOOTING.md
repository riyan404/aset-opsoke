# Troubleshooting Guide

Panduan pemecahan masalah untuk Asset Management System.

## 🚨 Masalah Umum & Solusi

### 1. Authentication Issues

#### Problem: Login gagal dengan kredensial yang benar
**Symptoms:**
- Error "Invalid credentials" meskipun password benar
- Redirect loop pada halaman login
- Session tidak tersimpan

**Solutions:**
```bash
# 1. Periksa environment variables
cat .env | grep -E "(NEXTAUTH_SECRET|JWT_SECRET|NEXTAUTH_URL)"

# 2. Clear browser cache dan cookies
# - Buka Developer Tools (F12)
# - Application/Storage tab
# - Clear storage untuk domain

# 3. Restart aplikasi
pm2 restart asset-management

# 4. Periksa database user
npx prisma studio
# Cek tabel User, pastikan password ter-hash dengan benar
```

#### Problem: JWT Token expired atau invalid
**Symptoms:**
- Error "Invalid token" pada API calls
- Automatic logout setelah beberapa waktu
- 401 Unauthorized errors

**Solutions:**
```bash
# 1. Periksa JWT_SECRET consistency
grep JWT_SECRET .env

# 2. Clear semua sessions
# Hapus semua cookies dan localStorage

# 3. Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. Update .env dan restart
pm2 restart asset-management
```

### 2. Database Issues

#### Problem: Database connection failed
**Symptoms:**
- Error "Can't reach database server"
- Prisma client initialization failed
- ENOENT: no such file or directory

**Solutions:**
```bash
# 1. Periksa database file exists
ls -la prisma/dev.db

# 2. Periksa permissions
chmod 644 prisma/dev.db
chown $USER:$USER prisma/dev.db

# 3. Regenerate Prisma client
npx prisma generate

# 4. Run migrations
npx prisma migrate deploy

# 5. Seed database jika kosong
npx prisma db seed
```

#### Problem: Database locked atau corrupted
**Symptoms:**
- Error "database is locked"
- Slow query performance
- Data inconsistency

**Solutions:**
```bash
# 1. Check for running processes
lsof prisma/dev.db

# 2. Kill blocking processes
kill -9 <PID>

# 3. Backup dan repair database
cp prisma/dev.db prisma/backup.db
echo "PRAGMA integrity_check;" | sqlite3 prisma/dev.db

# 4. Vacuum database
echo "VACUUM;" | sqlite3 prisma/dev.db

# 5. Restart aplikasi
pm2 restart asset-management
```

### 3. Email System Issues

#### Problem: Email tidak terkirim
**Symptoms:**
- Email tidak sampai ke recipient
- Error pada email sending
- Mailtrap API errors

**Solutions:**
```bash
# 1. Test Mailtrap credentials
curl -X POST \
  https://send.api.mailtrap.io/api/send \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from": {"email": "test@example.com"},
    "to": [{"email": "recipient@example.com"}],
    "subject": "Test",
    "text": "Test email"
  }'

# 2. Periksa environment variables
grep MAILTRAP .env

# 3. Test melalui health endpoint
curl http://localhost:3000/api/health

# 4. Check application logs
pm2 logs asset-management | grep -i mail
```

### 4. File Upload Issues

#### Problem: File upload gagal
**Symptoms:**
- Error "File too large"
- Upload progress stuck
- File tidak tersimpan

**Solutions:**
```bash
# 1. Periksa disk space
df -h

# 2. Periksa permissions upload directory
ls -la public/uploads/
chmod 755 public/uploads/

# 3. Periksa file size limits
# Edit next.config.ts untuk increase limits

# 4. Clear temporary files
find /tmp -name "upload_*" -mtime +1 -delete
```

### 5. Performance Issues

#### Problem: Aplikasi lambat atau hang
**Symptoms:**
- Long response times
- High CPU/memory usage
- Timeout errors

**Solutions:**
```bash
# 1. Monitor resources
htop
pm2 monit

# 2. Check memory usage
free -h
pm2 show asset-management

# 3. Restart aplikasi
pm2 restart asset-management

# 4. Optimize database
echo "ANALYZE;" | sqlite3 prisma/dev.db
echo "VACUUM;" | sqlite3 prisma/dev.db

# 5. Clear Next.js cache
rm -rf .next/cache
npm run build
```

### 6. Build & Deployment Issues

#### Problem: Build gagal
**Symptoms:**
- npm run build errors
- TypeScript compilation errors
- Missing dependencies

**Solutions:**
```bash
# 1. Clear cache
rm -rf .next node_modules package-lock.json
npm install

# 2. Fix TypeScript errors
npm run type-check

# 3. Update dependencies
npm audit fix
npm update

# 4. Check Node.js version
node --version
# Ensure Node.js 18+

# 5. Rebuild from scratch
git clean -fdx
npm install
npm run build
```

#### Problem: PM2 process crashed
**Symptoms:**
- Application not responding
- PM2 shows "errored" status
- Automatic restarts failing

**Solutions:**
```bash
# 1. Check PM2 status
pm2 status

# 2. View error logs
pm2 logs asset-management --err

# 3. Delete and recreate process
pm2 delete asset-management
pm2 start ecosystem.config.js

# 4. Check ecosystem config
cat ecosystem.config.js

# 5. Monitor for stability
pm2 monit
```

### 7. Nginx & SSL Issues

#### Problem: 502 Bad Gateway
**Symptoms:**
- Nginx returns 502 error
- Cannot reach application
- Upstream connection failed

**Solutions:**
```bash
# 1. Check if app is running
pm2 status
curl http://localhost:3000

# 2. Check Nginx configuration
sudo nginx -t

# 3. Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# 4. Restart services
pm2 restart asset-management
sudo systemctl restart nginx

# 5. Check firewall
sudo ufw status
```

#### Problem: SSL Certificate issues
**Symptoms:**
- HTTPS not working
- Certificate expired warnings
- Mixed content errors

**Solutions:**
```bash
# 1. Check certificate status
sudo certbot certificates

# 2. Renew certificate
sudo certbot renew --force-renewal

# 3. Test SSL configuration
openssl s_client -connect yourdomain.com:443

# 4. Update Nginx config
sudo nginx -t
sudo systemctl reload nginx

# 5. Check certificate auto-renewal
sudo certbot renew --dry-run
```

## 🔧 Diagnostic Commands

### System Health Check
```bash
#!/bin/bash
echo "=== System Health Check ==="

echo "1. Disk Space:"
df -h

echo "2. Memory Usage:"
free -h

echo "3. CPU Load:"
uptime

echo "4. PM2 Status:"
pm2 status

echo "5. Nginx Status:"
sudo systemctl status nginx --no-pager

echo "6. Database Check:"
ls -la prisma/dev.db

echo "7. Application Health:"
curl -s http://localhost:3000/api/health | jq .

echo "8. SSL Certificate:"
sudo certbot certificates
```

### Application Logs Analysis
```bash
#!/bin/bash
echo "=== Log Analysis ==="

echo "1. PM2 Logs (last 50 lines):"
pm2 logs asset-management --lines 50

echo "2. Nginx Access Logs:"
sudo tail -n 20 /var/log/nginx/access.log

echo "3. Nginx Error Logs:"
sudo tail -n 20 /var/log/nginx/error.log

echo "4. System Logs:"
sudo journalctl -u nginx --no-pager -n 10
```

### Database Diagnostics
```bash
#!/bin/bash
echo "=== Database Diagnostics ==="

echo "1. Database File Info:"
ls -la prisma/dev.db
file prisma/dev.db

echo "2. Database Size:"
du -h prisma/dev.db

echo "3. Database Integrity:"
echo "PRAGMA integrity_check;" | sqlite3 prisma/dev.db

echo "4. Table Count:"
echo "SELECT name FROM sqlite_master WHERE type='table';" | sqlite3 prisma/dev.db

echo "5. User Count:"
echo "SELECT COUNT(*) as user_count FROM User;" | sqlite3 prisma/dev.db
```

## 🚀 Performance Optimization

### Database Optimization
```bash
# 1. Analyze database
echo "ANALYZE;" | sqlite3 prisma/dev.db

# 2. Vacuum database
echo "VACUUM;" | sqlite3 prisma/dev.db

# 3. Check database size
du -h prisma/dev.db

# 4. Optimize queries (check slow queries)
echo "PRAGMA compile_options;" | sqlite3 prisma/dev.db
```

### Application Optimization
```bash
# 1. Enable PM2 cluster mode
pm2 delete asset-management
pm2 start ecosystem.config.js --instances max

# 2. Enable Nginx gzip compression
# (Already included in nginx config)

# 3. Optimize Next.js build
npm run build -- --profile

# 4. Clear application cache
rm -rf .next/cache
```

### System Optimization
```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Clean system cache
sudo apt autoremove -y
sudo apt autoclean

# 3. Optimize swap usage
sudo sysctl vm.swappiness=10

# 4. Monitor system resources
htop
iotop
```

## 📊 Monitoring & Alerts

### Setup Monitoring Script
```bash
#!/bin/bash
# monitor.sh - Run every 5 minutes via cron

LOG_FILE="/var/log/asset-management-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check if application is responding
if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo "$DATE - Application not responding, restarting..." >> $LOG_FILE
    pm2 restart asset-management
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$DATE - Disk usage high: ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 80 ]; then
    echo "$DATE - Memory usage high: ${MEM_USAGE}%" >> $LOG_FILE
fi
```

Add to crontab:
```bash
crontab -e
# Add: */5 * * * * /path/to/monitor.sh
```

## 🆘 Emergency Recovery

### Complete System Recovery
```bash
#!/bin/bash
echo "=== Emergency Recovery ==="

# 1. Stop all services
pm2 stop all
sudo systemctl stop nginx

# 2. Backup current state
cp prisma/dev.db prisma/emergency-backup-$(date +%Y%m%d-%H%M%S).db

# 3. Reset application
git stash
git pull origin main
npm install
npm run build

# 4. Reset database (if needed)
# npx prisma migrate reset --force
# npx prisma db seed

# 5. Restart services
pm2 start ecosystem.config.js
sudo systemctl start nginx

# 6. Verify recovery
curl http://localhost:3000/api/health
```

### Rollback to Previous Version
```bash
#!/bin/bash
echo "=== Rollback Procedure ==="

# 1. Stop services
pm2 stop asset-management

# 2. Restore from backup
cp prisma/backup-YYYYMMDD-HHMMSS.db prisma/dev.db

# 3. Checkout previous version
git log --oneline -10
git checkout <previous-commit-hash>

# 4. Rebuild
npm install
npm run build

# 5. Restart
pm2 start ecosystem.config.js
```

## 📞 Getting Help

### Log Collection for Support
```bash
#!/bin/bash
# collect-logs.sh - Collect all relevant logs for support

SUPPORT_DIR="support-logs-$(date +%Y%m%d-%H%M%S)"
mkdir -p $SUPPORT_DIR

# System info
uname -a > $SUPPORT_DIR/system-info.txt
node --version >> $SUPPORT_DIR/system-info.txt
npm --version >> $SUPPORT_DIR/system-info.txt

# Application logs
pm2 logs asset-management --lines 100 > $SUPPORT_DIR/pm2-logs.txt
pm2 show asset-management > $SUPPORT_DIR/pm2-info.txt

# System logs
sudo journalctl -u nginx --no-pager -n 50 > $SUPPORT_DIR/nginx-journal.log
sudo tail -n 100 /var/log/nginx/error.log > $SUPPORT_DIR/nginx-error.log

# Configuration files
cp .env.example $SUPPORT_DIR/
cp ecosystem.config.js $SUPPORT_DIR/
cp next.config.ts $SUPPORT_DIR/

# Database info
echo "PRAGMA table_info(User);" | sqlite3 prisma/dev.db > $SUPPORT_DIR/db-schema.txt

# Create archive
tar -czf $SUPPORT_DIR.tar.gz $SUPPORT_DIR
echo "Support logs collected: $SUPPORT_DIR.tar.gz"
```

### Contact Information
- **Documentation**: README.md, DOCKER_DEPLOYMENT.md, DOMAIN_DEPLOYMENT.md
- **Health Check**: `http://localhost:3000/api/health`
- **Database Admin**: `npx prisma studio`
- **Process Monitor**: `pm2 monit`

Untuk bantuan lebih lanjut, kumpulkan log menggunakan script di atas dan hubungi tim development.