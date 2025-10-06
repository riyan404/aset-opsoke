# Docker Deployment Guide

This guide explains how to deploy the Asset Management System using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)
- Node.js 18+ (for development)

## Quick Start

1. **Clone the repository**:
```bash
git clone <repository-url>
cd aset-opsoke
```

2. **Create environment file**:
```bash
cp .env.example .env
```

3. **Edit environment variables** in `.env`:
```env
NEXTAUTH_SECRET=your-super-secret-key-here
JWT_SECRET=your-jwt-secret-here
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=file:./prisma/dev.db
MAILTRAP_API_TOKEN=your-mailtrap-token
MAILTRAP_HOST=send.api.mailtrap.io
MAILTRAP_FROM_EMAIL=noreply@example.com
MAILTRAP_FROM_NAME="ManajemenAset System"
```

## Using Docker Compose (Recommended)

1. **Build and start the application**:
```bash
docker-compose up -d
```

2. **Initialize the database**:
```bash
docker-compose exec asset-management npx prisma migrate deploy
docker-compose exec asset-management npx prisma db seed
```

3. **Access the application**:
   - Open your browser and go to `http://localhost:3000`
   - Login with default credentials:
     - **Admin**: `riyannalfiansyah@gmail.com` / `admin123`
     - **User**: `user@example.com` / `user123`

## Manual Docker Build

If you prefer to build manually:

```bash
# Build the Docker image
docker build -t asset-management .

# Run the container
docker run -d \
  --name asset-management \
  -p 3000:3000 \
  -e NEXTAUTH_SECRET=your-secret \
  -e JWT_SECRET=your-jwt-secret \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e MAILTRAP_API_TOKEN=your-token \
  -e MAILTRAP_HOST=send.api.mailtrap.io \
  -e MAILTRAP_FROM_EMAIL=noreply@example.com \
  -e MAILTRAP_FROM_NAME="ManajemenAset System" \
  asset-management
```

## Production Deployment

For production deployment:

1. **Change all secrets**: Update `NEXTAUTH_SECRET` and `JWT_SECRET` with strong, unique values
2. **Update URLs**: Set `NEXTAUTH_URL` to your production domain
3. **Configure reverse proxy**: Use nginx or similar for SSL termination
4. **Database backup**: Ensure regular backups of your SQLite database
5. **Monitoring**: Set up health check monitoring on `/api/health`
6. **PM2 Process Management**: Use PM2 for production process management

### PM2 Production Setup

For production environments, use PM2 for better process management:

```bash
# Install PM2 globally
npm install -g pm2

# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Nginx Configuration

Example nginx configuration for production:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

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
    }
}
```

## Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXTAUTH_SECRET` | NextAuth.js secret key | `your-super-secret-key` | Yes |
| `JWT_SECRET` | JWT signing secret | `your-jwt-secret` | Yes |
| `NEXTAUTH_URL` | Application base URL | `https://yourdomain.com` | Yes |
| `DATABASE_URL` | Database connection string | `file:./prisma/dev.db` | Yes |
| `MAILTRAP_API_TOKEN` | Mailtrap API token | `your-api-token` | Yes |
| `MAILTRAP_HOST` | Mailtrap host | `send.api.mailtrap.io` | Yes |
| `MAILTRAP_FROM_EMAIL` | Sender email address | `noreply@example.com` | Yes |
| `MAILTRAP_FROM_NAME` | Sender name | `ManajemenAset System` | Yes |
| `NODE_ENV` | Environment mode | `production` | No |
| `PORT` | Application port | `3000` | No |

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database Security**: Ensure proper file permissions for SQLite database
3. **JWT Secrets**: Use strong, randomly generated secrets
4. **HTTPS**: Always use HTTPS in production
5. **Regular Updates**: Keep dependencies updated for security patches

## Troubleshooting

### Container won't start
- Check logs: `docker-compose logs asset-management`
- Verify environment variables are set correctly
- Ensure port 3000 is not already in use
- Check Docker daemon is running

### Database issues
- Ensure the SQLite database file exists and has proper permissions
- Run database migrations: `npx prisma migrate deploy`
- Check database seeding: `npx prisma db seed`
- Verify DATABASE_URL is correct

### Authentication issues
- Verify NEXTAUTH_SECRET and JWT_SECRET are set
- Check NEXTAUTH_URL matches your domain
- Clear browser cache and cookies
- Try incognito/private browsing mode

### Email not working
- Verify Mailtrap credentials are correct
- Check the `/api/health` endpoint for system status
- Test email functionality through the settings page
- Verify MAILTRAP_API_TOKEN is valid

### Performance issues
- Check system resources (CPU, memory)
- Monitor application logs for errors
- Use PM2 monitoring: `pm2 monit`
- Consider database optimization

### Build failures
- Clear Docker cache: `docker system prune -a`
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs for specific errors

## Health Check

The application includes a health check endpoint at `/api/health` that returns:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "ManajemenAset System",
  "version": "1.0.0",
  "database": "connected",
  "uptime": "2h 30m 45s"
}
```

## Monitoring and Logs

### Docker Logs
```bash
# View real-time logs
docker-compose logs -f asset-management

# View last 100 lines
docker-compose logs --tail=100 asset-management
```

### PM2 Monitoring
```bash
# View process status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart application
pm2 restart asset-management
```

## Backup and Recovery

### Database Backup
```bash
# Create backup
cp prisma/dev.db prisma/backup-$(date +%Y%m%d-%H%M%S).db

# Automated backup script
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d-%H%M%S)
cp prisma/dev.db "$BACKUP_DIR/backup-$DATE.db"
find "$BACKUP_DIR" -name "backup-*.db" -mtime +7 -delete
```

### Application Backup
```bash
# Backup entire application
tar -czf asset-management-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .
```

## Stopping the Application

```bash
# Stop and remove containers
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v

# Stop PM2 processes
pm2 stop all
pm2 delete all
```

## Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Run migrations if needed
docker-compose exec asset-management npx prisma migrate deploy
```

### Dependency Updates
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Rebuild Docker image
docker-compose build --no-cache
```