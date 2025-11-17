# 🚀 Quick Start Guide

Get Play-4-Celo running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm
npm --version

# Check git
git --version
```

## Step-by-Step Setup

### 1. Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/Play-4-Celo.git
cd Play-4-Celo

# Install all dependencies
npm install
npm run install:all

# This installs:
# - Root dependencies (Hardhat, testing tools)
# - Frontend dependencies (Next.js, React, TailwindCSS)
# - Backend dependencies (Express, CORS)
```

### 2. Environment Setup (1 minute)

```bash
# Copy environment template
cp .env.example .env

# Edit with your values (use nano, vim, or any editor)
nano .env
```

**Minimum required changes:**
```env
DEPLOYER_PRIVATE_KEY=your_metamask_private_key_here
```

### 3. Start Everything (2 minutes)

**Option A: All-in-One (Recommended)**
```bash
npm run start:dev
```

This starts:
- Hardhat local blockchain (port 8545)
- Backend server (port 3001)
- Frontend development server (port 3000)

**Option B: Separate Terminals**
```bash
# Terminal 1: Blockchain
npm run node

# Terminal 2: Deploy contracts
npm run deploy:local

# Terminal 3: Backend
npm run backend:dev

# Terminal 4: Frontend
npm run frontend:dev
```

### 4. Open Your Browser

Visit: **http://localhost:3000**

You should see the Play-4-Celo homepage! 🎉

## Next Steps

1. **Connect Wallet**: Click "Connect Wallet" button
2. **Get Test Tokens**: Use Celo Alfajores faucet
3. **Create Room**: Choose a quiz category
4. **Play**: Answer questions and earn rewards!

## Troubleshooting

### "Cannot find module" errors
```bash
npm run clean
npm run install:all
```

### Port already in use
```bash
# Change ports in .env:
PORT=3002  # for backend
# Frontend uses port 3000 by default
```

### Wallet connection issues
- Make sure MetaMask is installed
- Switch to Celo Alfajores network
- Check that you have test tokens

## Test the Smart Contracts

```bash
npm test
```

Expected output: All tests passing ✅

## Deploy to Alfajores Testnet

```bash
# Get test tokens from faucet first!
# Visit: https://faucet.celo.org

# Deploy
npm run deploy:alfajores

# Update .env with deployed contract address
```

## Need Help?

- Check the main [README.md](README.md)
- Open an [issue](https://github.com/yourusername/Play-4-Celo/issues)
- Join our Discord community

Happy coding! 🎮💰
