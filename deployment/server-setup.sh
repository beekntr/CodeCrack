#!/bin/bash

# CodeCrack Server Setup Script
# Run this on your Ubuntu server: bash server-setup.sh

set -e

echo "🚀 Setting up CodeCrack deployment environment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker and Docker Compose
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Create application directory
sudo mkdir -p /var/www/codecrack
sudo chown $USER:$USER /var/www/codecrack

# Create logs directory
sudo mkdir -p /var/log/codecrack
sudo chown $USER:$USER /var/log/codecrack

echo "✅ Basic setup completed!"
echo "📋 Next steps:"
echo "1. Logout and login again (or run 'newgrp docker')"
echo "2. Run Docker containers setup"
echo "3. Configure Nginx"
echo "4. Setup SSL certificate"
