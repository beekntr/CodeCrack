#!/bin/bash

# CodeCrack Production Deployment Script
# Run this script on your Ubuntu server after initial setup

set -e

echo "🚀 Starting CodeCrack production deployment..."

# Configuration
DEPLOY_USER="codecrack"
APP_DIR="/var/www/codecrack"
BACKUP_DIR="/var/backups/codecrack"
DOCKER_DIR="$APP_DIR/deployment"

# Create backup directory
sudo mkdir -p $BACKUP_DIR
sudo chown $USER:$USER $BACKUP_DIR

# Create application user (if not exists)
if ! id "$DEPLOY_USER" &>/dev/null; then
    sudo useradd -m -s /bin/bash $DEPLOY_USER
    sudo usermod -aG docker $DEPLOY_USER
    echo "✅ Created application user: $DEPLOY_USER"
fi

# Create application directory
sudo mkdir -p $APP_DIR
sudo chown $DEPLOY_USER:$DEPLOY_USER $APP_DIR

echo "📦 Cloning repository..."
# Clone or update repository
if [ ! -d "$APP_DIR/.git" ]; then
    sudo -u $DEPLOY_USER git clone https://github.com/beekntr/CodeCrack.git $APP_DIR
else
    cd $APP_DIR
    sudo -u $DEPLOY_USER git pull origin main
fi

cd $APP_DIR

echo "📝 Setting up environment..."
# Copy environment file
if [ ! -f .env.production ]; then
    cp deployment/.env.production .env.production
    echo "⚠️  Please edit .env.production with your actual secrets!"
    echo "⚠️  File location: $APP_DIR/.env.production"
fi

# Install Node.js dependencies
echo "📦 Installing dependencies..."
sudo -u $DEPLOY_USER npm ci

# Build the application
echo "🔨 Building application..."
sudo -u $DEPLOY_USER npm run build

# Setup Docker containers
echo "🐳 Setting up Docker containers..."
cd $DOCKER_DIR

# Create environment file for Docker
cat > .env << EOF
MONGO_ROOT_PASSWORD=\${MONGO_ROOT_PASSWORD:-CodeCrack2025!SecurePassword}
REDIS_PASSWORD=\${REDIS_PASSWORD:-CodeCrack2025!RedisPassword}
EOF

# Build and start Docker containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to be ready
echo "⏳ Waiting for containers to start..."
sleep 30

# Setup PM2
echo "⚙️  Setting up PM2..."
sudo npm install -g pm2

# Copy PM2 ecosystem config
cp deployment/ecosystem.config.json $APP_DIR/

# Start application with PM2
cd $APP_DIR
pm2 delete codecrack-api 2>/dev/null || true
pm2 start ecosystem.config.json

# Setup PM2 startup
pm2 startup
pm2 save

# Setup Nginx
echo "🌐 Setting up Nginx..."
sudo cp deployment/nginx-codecrack.conf /etc/nginx/sites-available/codecrack
sudo ln -sf /etc/nginx/sites-available/codecrack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt (if not already done)
if [ ! -f "/etc/letsencrypt/live/api.orbittrails.com/fullchain.pem" ]; then
    echo "🔒 Setting up SSL certificate..."
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d api.orbittrails.com
fi

# Setup log rotation
sudo tee /etc/logrotate.d/codecrack > /dev/null << EOF
/var/log/codecrack/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 $DEPLOY_USER $DEPLOY_USER
    postrotate
        pm2 reload codecrack-api > /dev/null 2>&1 || true
    endscript
}
EOF

# Create systemd service for PM2
sudo tee /etc/systemd/system/codecrack.service > /dev/null << EOF
[Unit]
Description=CodeCrack Application
After=network.target

[Service]
Type=forking
User=$DEPLOY_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/pm2 start ecosystem.config.json
ExecStop=/usr/bin/pm2 stop ecosystem.config.json
ExecReload=/usr/bin/pm2 reload ecosystem.config.json
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable codecrack

echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit environment file: $APP_DIR/.env.production"
echo "2. Configure your secrets (MongoDB URI, JWT secret, Google OAuth, etc.)"
echo "3. Restart the application: pm2 reload codecrack-api"
echo "4. Test the deployment: curl https://api.orbittrails.com/health"
echo ""
echo "📊 Monitor your application:"
echo "- PM2 status: pm2 status"
echo "- PM2 logs: pm2 logs codecrack-api"
echo "- Nginx logs: sudo tail -f /var/log/nginx/codecrack_error.log"
echo "- Application logs: tail -f /var/log/codecrack/combined.log"
