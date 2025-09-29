#!/bin/bash

# Deployment script for orderkuota.cobacoba.id
# This script helps setup the domain pointing and SSL certificates

echo "🚀 Starting deployment for orderkuota.cobacoba.id..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons."
   exit 1
fi

# Step 1: Build the application
print_status "Building Next.js application..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed. Please check the errors above."
    exit 1
fi

# Step 2: Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2 process manager..."
    npm install -g pm2
fi

# Step 3: Create PM2 ecosystem file
print_status "Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << EOF
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
EOF

# Step 4: Start/Restart the application with PM2
print_status "Starting application with PM2..."
pm2 delete asset-management 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

print_status "Application is now running on port 3000"

# Step 5: Instructions for domain setup
echo ""
print_status "=== DOMAIN SETUP INSTRUCTIONS ==="
echo ""
print_warning "To complete the domain setup, you need to:"
echo ""
echo "1. 📋 DNS Configuration:"
echo "   - Point orderkuota.cobacoba.id to this server's IP address"
echo "   - Add A record: orderkuota.cobacoba.id -> $(curl -s ifconfig.me)"
echo "   - Add CNAME record: www.orderkuota.cobacoba.id -> orderkuota.cobacoba.id"
echo ""
echo "2. 🔒 SSL Certificate (using Certbot):"
echo "   sudo apt update"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d orderkuota.cobacoba.id -d www.orderkuota.cobacoba.id"
echo ""
echo "3. 🌐 Nginx Configuration:"
echo "   sudo cp nginx.conf /etc/nginx/sites-available/orderkuota.cobacoba.id"
echo "   sudo ln -s /etc/nginx/sites-available/orderkuota.cobacoba.id /etc/nginx/sites-enabled/"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "4. 🔥 Firewall (if needed):"
echo "   sudo ufw allow 'Nginx Full'"
echo "   sudo ufw allow ssh"
echo "   sudo ufw enable"
echo ""
print_status "Application Status:"
pm2 status
echo ""
print_status "Application Logs:"
echo "   pm2 logs asset-management"
echo ""
print_status "Deployment completed! 🎉"
print_warning "Remember to update your DNS records to point to this server."