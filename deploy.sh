#!/bin/bash

# Deploy QuizPool Contract to Celo Alfajores Testnet
# This script will deploy the contract and update the frontend .env.local file

echo "🚀 Deploying QuizPool to Celo Alfajores..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your PRIVATE_KEY before continuing!"
    echo "   Get your private key from MetaMask or Valora"
    exit 1
fi

# Compile contracts
echo "📝 Compiling contracts..."
npx hardhat compile

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi

echo "✅ Compilation successful!"

# Deploy to Alfajores
echo "🌍 Deploying to Alfajores testnet..."
npx hardhat run scripts/deploy.ts --network alfajores

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the deployed QuizPool address from above"
echo "2. Update frontend/.env.local with the new address"
echo "3. Restart your frontend: npm run dev"
echo ""
echo "🎮 Your contracts are now live on Alfajores testnet!"
