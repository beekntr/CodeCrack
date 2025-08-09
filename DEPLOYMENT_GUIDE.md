# 🚀 CodeCrack Production Deployment Guide

Complete step-by-step guide to deploy CodeCrack to Ubuntu server with CI/CD pipeline.

## 📋 Prerequisites

- Ubuntu 20.04+ server with sudo access
- Domain name pointing to your server (codecrack.kshitijsinghbhati.in)
- GitHub repository access
- SSH key pair for GitHub Actions

## 🔧 Phase 1: Server Initial Setup

### Step 1: Connect to your server
```bash
ssh your-username@122.162.241.146
```

### Step 2: Run initial setup script
```bash
# Download and run the setup script
wget https://raw.githubusercontent.com/beekntr/CodeCrack/main/deployment/server-setup.sh
chmod +x server-setup.sh
bash server-setup.sh
```

### Step 3: Logout and login again
```bash
logout
ssh your-username@122.162.241.146
```

## 🚀 Phase 2: Application Deployment

### Step 1: Run deployment script
```bash
# Download and run deployment script
wget https://raw.githubusercontent.com/beekntr/CodeCrack/main/deployment/deploy.sh
chmod +x deploy.sh
bash deploy.sh
```

### Step 2: Configure environment variables
```bash
# Edit the production environment file
nano /var/www/codecrack/.env.production

# Generate secure secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 24  # For passwords
```

### Step 3: Update Google OAuth credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new OAuth 2.0 credentials
3. Add authorized redirect URI: `https://codecrack.kshitijsinghbhati.in/api/auth/google/callback`
4. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.production`

### Step 4: Restart application
```bash
cd /var/www/codecrack
pm2 reload codecrack-api
```

## 🔐 Phase 3: SSL Certificate Setup

### Automatic setup (if not done during deployment)
```bash
sudo certbot --nginx -d codecrack.kshitijsinghbhati.in
```

### Manual verification
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 🔄 Phase 4: CI/CD Pipeline Setup

### Step 1: Generate SSH key for GitHub Actions
```bash
# On your local machine or server
ssh-keygen -t rsa -b 4096 -C "github-actions@codecrack"
```

### Step 2: Add public key to server
```bash
# Copy public key to server's authorized_keys
ssh-copy-id -i ~/.ssh/github_actions_key.pub your-username@122.162.241.146
```

### Step 3: Configure GitHub repository secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `SSH_PRIVATE_KEY`: Content of the private key file
- `SSH_USERNAME`: Your server username

### Step 4: Test deployment pipeline
```bash
# Make a small change and push to main branch
git add .
git commit -m "test deployment"
git push origin main
```

## 📊 Phase 5: Monitoring and Maintenance

### Application monitoring
```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs codecrack-api

# Restart application
pm2 reload codecrack-api
```

### System monitoring
```bash
# Check Docker containers
docker-compose -f /var/www/codecrack/deployment/docker-compose.prod.yml ps

# View Nginx logs
sudo tail -f /var/log/nginx/codecrack_error.log

# Check system resources
htop
df -h
```

### Database backup
```bash
# Create backup script
sudo tee /var/backups/codecrack/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec codecrack_mongodb mongodump --out /backup/codecrack_$DATE
EOF

sudo chmod +x /var/backups/codecrack/backup.sh

# Add to crontab for daily backups
echo "0 2 * * * /var/backups/codecrack/backup.sh" | sudo crontab -
```

## 🧪 Phase 6: Testing Deployment

### Health checks
```bash
# Test health endpoint
curl https://codecrack.kshitijsinghbhati.in/health

# Test API endpoint
curl https://codecrack.kshitijsinghbhati.in/api/health
```

### Application testing
1. Visit https://codecrack.kshitijsinghbhati.in
2. Test user registration/login
3. Test problem solving functionality
4. Test leaderboard functionality

## 🔧 Troubleshooting

### Common issues and solutions

#### 1. Application not starting
```bash
# Check PM2 logs
pm2 logs codecrack-api

# Check environment variables
cat /var/www/codecrack/.env.production

# Restart with verbose logging
pm2 delete codecrack-api
NODE_ENV=production pm2 start /var/www/codecrack/dist/server/node-build.mjs --name codecrack-api
```

#### 2. Database connection issues
```bash
# Check MongoDB container
docker logs codecrack_mongodb

# Test MongoDB connection
docker exec -it codecrack_mongodb mongo -u codecrack_admin -p
```

#### 3. SSL certificate issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

#### 4. Nginx configuration issues
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

## 📱 Phase 7: Frontend Deployment (Optional)

If you want to serve the frontend from the same server:

### Build and deploy frontend
```bash
cd /var/www/codecrack

# Build frontend for production
VITE_API_BASE_URL=https://codecrack.kshitijsinghbhati.in npm run build:client

# Copy to web directory
sudo mkdir -p /var/www/codecrack/frontend
sudo cp -r dist/spa/* /var/www/codecrack/frontend/
sudo chown -R www-data:www-data /var/www/codecrack/frontend
```

### Configure domain for frontend
Update your DNS to point `codecrack.kshitijsinghbhati.in` to your server and the configuration is already set.

## 🎉 Deployment Complete!

Your CodeCrack application should now be running at:
- **Frontend & API**: https://codecrack.kshitijsinghbhati.in

### Next steps:
1. Set up monitoring (consider using services like Datadog, New Relic, or simple uptime monitors)
2. Configure log aggregation
3. Set up automated backups
4. Consider implementing Blue-Green deployments for zero-downtime updates

### Support:
- Check application logs: `pm2 logs codecrack-api`
- Monitor system resources: `htop` and `df -h`
- View deployment logs in GitHub Actions tab

## 🔒 Security Checklist

- [ ] Changed all default passwords
- [ ] Generated secure JWT secret
- [ ] Configured production Google OAuth credentials
- [ ] Set up SSL certificates
- [ ] Configured firewall rules
- [ ] Set appropriate file permissions (600 for .env files)
- [ ] Enabled fail2ban for SSH protection
- [ ] Regular security updates scheduled
