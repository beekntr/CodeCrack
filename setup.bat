@echo off
REM CodeCrack Backend Setup Script for Windows

echo 🚀 Setting up CodeCrack Backend System...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your configuration before continuing.
    echo    At minimum, set JWT_SECRET to a secure random string.
    pause
)

REM Start MongoDB and Redis
echo 🗄️  Starting MongoDB and Redis...
cd docker
docker-compose up -d mongodb redis

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak

REM Build Docker images for code execution
echo 🐳 Building Docker images for code execution...
docker-compose build python-executor cpp-executor javascript-executor java-executor

REM Initialize database
echo 💾 Initializing database...
cd ..
call npm run init-db

REM Check TypeScript compilation
echo 🔍 Checking TypeScript compilation...
call npm run typecheck

if %errorlevel% equ 0 (
    echo ✅ Setup completed successfully!
    echo.
    echo 🎉 CodeCrack Backend is ready!
    echo.
    echo To start the development server:
    echo   npm run dev
    echo.
    echo Default admin credentials:
    echo   Email: admin@codecrack.com
    echo   Password: admin123
    echo.
    echo API will be available at: http://localhost:8080
) else (
    echo ❌ TypeScript compilation failed. Please fix the errors before starting.
)

pause
