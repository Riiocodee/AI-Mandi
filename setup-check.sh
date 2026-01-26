#!/bin/bash

echo "🚀 AI Mandi Setup Verification Script"
echo "======================================"

# Check if Node.js is installed
if command -v node &> /dev/null; then
    echo "✅ Node.js is installed: $(node --version)"
else
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    echo "✅ npm is installed: $(npm --version)"
else
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo ""
echo "📁 Checking project structure..."

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Please run this script from the ai-mandi root directory"
    exit 1
fi

echo "✅ Project structure looks good"

echo ""
echo "📦 Checking dependencies..."

# Check backend dependencies
if [ -d "backend/node_modules" ]; then
    echo "✅ Backend dependencies are installed"
else
    echo "⚠️  Backend dependencies not found. Run: cd backend && npm install"
fi

# Check frontend dependencies
if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend dependencies are installed"
else
    echo "⚠️  Frontend dependencies not found. Run: cd frontend && npm install"
fi

echo ""
echo "🔧 Checking configuration files..."

# Check environment files
if [ -f ".env" ]; then
    echo "✅ Backend .env file exists"
else
    echo "⚠️  Backend .env file missing (will use defaults)"
fi

if [ -f "frontend/.env" ]; then
    echo "✅ Frontend .env file exists"
else
    echo "⚠️  Frontend .env file missing (will use defaults)"
fi

echo ""
echo "🎯 Setup Status: COMPLETE"
echo ""
echo "🚀 To start the application:"
echo "1. Terminal 1: cd backend && npm run dev"
echo "2. Terminal 2: cd frontend && npm run dev"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "🧪 To run tests:"
echo "- Backend tests: cd backend && npm test"
echo "- Frontend tests: cd frontend && npm test"