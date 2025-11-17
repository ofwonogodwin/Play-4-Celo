#!/bin/bash

# Play-4-Celo Setup Script
# This script automates the initial setup process

set -e

echo "🎮 Play-4-Celo Setup Script"
echo "=========================="
echo ""

# Check Node.js
echo "📦 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Node.js version is too old. Please upgrade to v18 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
echo "This may take a few minutes..."
echo ""

npm install
npm run install:all

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Setup environment
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your actual values."
    echo ""
    echo "⚠️  IMPORTANT: Update DEPLOYER_PRIVATE_KEY in .env before deploying!"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your private key and configuration"
echo "2. Run 'npm run start:dev' to start all services"
echo "3. Visit http://localhost:3000 in your browser"
echo ""
echo "For detailed instructions, see QUICKSTART.md"
echo ""
echo "Happy hacking! 🚀"
