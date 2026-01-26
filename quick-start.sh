#!/bin/bash

echo "🚀 AI Mandi - Quick Start Script"
echo "================================"

echo ""
echo "📦 Installing dependencies..."
npm run install:all

echo ""
echo "🔧 Setting up environment..."
if [ ! -f "backend/.env" ]; then
    cp "backend/.env.example" "backend/.env"
    echo "✅ Backend .env created"
fi

if [ ! -f "frontend/.env" ]; then
    cp "frontend/.env.example" "frontend/.env"
    echo "✅ Frontend .env created"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 Starting AI Mandi..."
echo "  - Backend: http://localhost:3001"
echo "  - Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""

npm run dev