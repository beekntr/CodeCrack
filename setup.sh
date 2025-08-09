#!/bin/bash

# CodeCrack Backend Setup Script

echo "🚀 Setting up CodeCrack Backend System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing."
    echo "   At minimum, set JWT_SECRET to a secure random string."
    read -p "Press Enter to continue after editing .env..."
fi

# Start MongoDB and Redis
echo "🗄️  Starting MongoDB and Redis..."
cd docker
docker-compose up -d mongodb redis

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Build Docker images for code execution
echo "🐳 Building Docker images for code execution..."
docker-compose build python-executor cpp-executor javascript-executor java-executor

# Initialize database
echo "💾 Initializing database..."
cd ..
npm run init-db

# Check TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
npm run typecheck

if [ $? -eq 0 ]; then
    echo "✅ Setup completed successfully!"
    echo ""
    echo "🎉 CodeCrack Backend is ready!"
    echo ""
    echo "To start the development server:"
    echo "  npm run dev"
    echo ""
    echo "Default admin credentials:"
    echo "  Email: admin@codecrack.com"
    echo "  Password: admin123"
    echo ""
    echo "API will be available at: http://localhost:8080"
else
    echo "❌ TypeScript compilation failed. Please fix the errors before starting."
fi
