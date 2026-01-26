@echo off
echo 🚀 AI Mandi - Quick Start Script
echo ================================

echo.
echo 📦 Installing dependencies...
call npm run install:all

echo.
echo 🔧 Setting up environment...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo ✅ Backend .env created
)

if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env"
    echo ✅ Frontend .env created
)

echo.
echo 🎉 Setup complete!
echo.
echo 🚀 Starting AI Mandi...
echo   - Backend: http://localhost:3001
echo   - Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop the servers
echo.

call npm run dev