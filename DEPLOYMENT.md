# 🚀 Deployment Guide

Complete guide to deploying Play-4-Celo to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deploy Smart Contracts](#deploy-smart-contracts)
3. [Deploy Backend](#deploy-backend)
4. [Deploy Frontend](#deploy-frontend)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Get Test Funds

Visit [Celo Alfajores Faucet](https://faucet.celo.org):
- Get CELO (for gas fees)
- Get cUSD (for testing payments)

### 2. Prepare Wallets

You'll need:
- **Deployer Wallet**: For deploying contracts
- **Admin Wallet**: For managing payouts (can be same as deployer)
- **Test Wallets**: 2-3 wallets for testing (optional)

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

Required values:
```env
DEPLOYER_PRIVATE_KEY=your_private_key_here
ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
NEXT_PUBLIC_CUSD_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
```

---

## Deploy Smart Contracts

### Step 1: Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 2 Solidity files successfully
```

### Step 2: Run Tests

```bash
npm test
```

All tests should pass ✅

### Step 3: Deploy to Alfajores

```bash
npm run deploy:alfajores
```

Expected output:
```
🚀 Starting QuizPool deployment...
📝 Deploying contracts with account: 0x...
💰 Account balance: 5.0 ETH
💵 Using cUSD address: 0x874069...
⏳ Deploying QuizPool contract...
✅ QuizPool deployed to: 0xYourContractAddress
📄 Deployment info saved to: deployments/latest.json
```

### Step 4: Save Contract Address

Copy the deployed contract address and update your `.env`:

```env
NEXT_PUBLIC_QUIZ_POOL_ADDRESS=0xYourDeployedContractAddress
```

### Step 5: Verify Contract (Optional)

```bash
npx hardhat verify --network alfajores \
  YOUR_CONTRACT_ADDRESS \
  0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
```

View your verified contract at:
`https://alfajores.celoscan.io/address/YOUR_CONTRACT_ADDRESS`

---

## Deploy Backend

### Option 1: Railway

```bash
cd backend

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set PORT=3001
railway variables set NODE_ENV=production

# Deploy
railway up
```

Your backend will be available at: `https://your-app.railway.app`

### Option 2: Heroku

```bash
cd backend

# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create play4celo-backend

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Option 3: DigitalOcean App Platform

1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository
4. Select the `backend` folder
5. Set environment variables:
   - `PORT=3001`
   - `NODE_ENV=production`
6. Deploy

### Option 4: Docker (Any Platform)

```bash
cd backend

# Create Dockerfile
cat > Dockerfile << EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
EOF

# Build image
docker build -t play4celo-backend .

# Run locally to test
docker run -p 3001:3001 play4celo-backend

# Push to registry (Docker Hub, GCR, etc.)
docker tag play4celo-backend your-username/play4celo-backend
docker push your-username/play4celo-backend
```

---

## Deploy Frontend

### Option 1: Vercel (Recommended)

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

Environment variables to set in Vercel dashboard:
```
NEXT_PUBLIC_QUIZ_POOL_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_CUSD_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
NEXT_PUBLIC_CHAIN_ID=44787
```

### Option 2: Netlify

```bash
cd frontend

# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Option 3: GitHub Pages (Static Export)

```bash
cd frontend

# Add to next.config.js:
# output: 'export'

# Build
npm run build

# The 'out' directory can be deployed to GitHub Pages
```

### Option 4: Self-Hosted

```bash
cd frontend

# Build
npm run build

# Copy .next folder to your server

# Run with PM2
npm install -g pm2
pm2 start npm --name "play4celo-frontend" -- start
pm2 save
```

---

## Post-Deployment

### 1. Update Frontend Configuration

Make sure frontend .env points to production backend:

```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-production-url.com
```

### 2. Test the Full Flow

1. **Connect Wallet**
   - Visit your deployed frontend
   - Connect with MetaMask/MiniPay
   - Switch to Celo Alfajores network

2. **Create Room**
   - Choose a category
   - Set entry fee (optional)
   - Create room

3. **Join & Play**
   - Join with another wallet (or same)
   - Start the game
   - Answer questions

4. **Test Payout**
   - Finish the game
   - Check backend response
   - Execute admin payout
   - Verify tokens received

### 3. Monitor Logs

**Backend:**
```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# PM2
pm2 logs
```

**Frontend:**
```bash
# Vercel
vercel logs

# Netlify
netlify logs
```

### 4. Set Up Analytics (Optional)

Add analytics to track usage:
- Google Analytics
- Mixpanel
- Plausible
- Umami

### 5. Domain Configuration

**Custom Domain:**
1. Purchase domain (Namecheap, GoDaddy, etc.)
2. Add DNS records:
   - Frontend: Point to Vercel/Netlify
   - Backend: Point to Railway/Heroku
3. Enable SSL/HTTPS

---

## Troubleshooting

### Contract Deployment Fails

**Problem:** Transaction reverts or fails
```bash
# Check your balance
npx hardhat run scripts/checkBalance.ts --network alfajores

# Increase gas limit in hardhat.config.ts
alfajores: {
  gas: 10000000,
  gasPrice: 20000000000
}
```

### Frontend Can't Connect to Backend

**Problem:** CORS errors

**Solution:** Update backend CORS settings:
```typescript
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:3000'],
  credentials: true
}));
```

### Wallet Connection Issues

**Problem:** MetaMask not connecting

**Solution:**
1. Check network configuration
2. Add Celo Alfajores manually:
   - Network Name: Celo Alfajores
   - RPC URL: https://alfajores-forno.celo-testnet.org
   - Chain ID: 44787
   - Currency: CELO
   - Block Explorer: https://alfajores.celoscan.io

### Transaction Failures

**Problem:** Transactions fail

**Solutions:**
- Check you have enough CELO for gas
- Verify contract address is correct
- Check cUSD approval before deposits
- Increase gas limit

### Backend Not Responding

**Problem:** 500 errors

**Solutions:**
- Check logs for errors
- Verify environment variables
- Restart the service
- Check database/storage

---

## Production Checklist

Before going live:

- [ ] Smart contracts deployed and verified
- [ ] Backend deployed with environment variables
- [ ] Frontend deployed and connected to backend
- [ ] All environment variables configured
- [ ] SSL/HTTPS enabled
- [ ] Custom domain configured (optional)
- [ ] Analytics set up (optional)
- [ ] Error monitoring enabled
- [ ] Backup admin wallet secured
- [ ] Test transactions completed successfully
- [ ] Documentation updated with live URLs
- [ ] Social media accounts created (optional)
- [ ] Community channels set up (optional)

---

## Mainnet Deployment

**⚠️ WARNING: Test thoroughly on Alfajores first!**

### Differences for Mainnet

1. **Network Configuration**
```env
CELO_RPC_URL=https://forno.celo.org
NEXT_PUBLIC_CHAIN_ID=42220
```

2. **Contract Addresses**
```env
# Mainnet cUSD
NEXT_PUBLIC_CUSD_ADDRESS=0x765DE816845861e75A25fCA122bb6898B8B1282a
```

3. **Deploy Command**
```bash
npm run deploy:celo
```

4. **Additional Considerations**
- Use a multisig wallet for admin
- Consider contract upgrade mechanism
- Have emergency pause functionality
- Get professional security audit
- Set up monitoring and alerts
- Have incident response plan

---

## Support

Need help with deployment?

- Check the main [README.md](README.md)
- Review [QUICKSTART.md](QUICKSTART.md)
- Open an [issue](https://github.com/yourusername/Play-4-Celo/issues)
- Join our [Discord](#)

---

**Remember:** Always test on Alfajores before deploying to mainnet!

Good luck with your deployment! 🚀
