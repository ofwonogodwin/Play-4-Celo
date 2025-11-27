# 🚀 Deployment Guide - QuizPool to Celo Alfajores

This guide will help you deploy the QuizPool smart contract to Celo Alfajores testnet and integrate it with your Play-4-Celo frontend.

## 📋 Prerequisites

1. **Celo Wallet** with Alfajores testnet CELO
   - Get test CELO from: https://faucet.celo.org/alfajores
   - You need at least 0.5 CELO for deployment

2. **Private Key** from your wallet
   - MetaMask: Account Details → Export Private Key
   - Valora: Settings → Recovery Phrase → Export Private Key

## 🔧 Step 1: Configure Environment

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Edit `.env` and add your private key:

```env
PRIVATE_KEY=your_private_key_here_without_0x_prefix
ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
```

⚠️ **IMPORTANT**: Never commit `.env` to git! It's in `.gitignore` for safety.

## 🚀 Step 2: Deploy Contracts

### Option A: Using the Deploy Script (Recommended)

```bash
./deploy.sh
```

### Option B: Manual Deployment

```bash
# 1. Compile contracts
npx hardhat compile

# 2. Deploy to Alfajores
npx hardhat run scripts/deploy.ts --network alfajores
```

## 📝 Step 3: Save Deployment Addresses

After deployment, you'll see output like:

```
Deploying contracts with account: 0x1234...5678
Account balance: 1.5 CELO

Deploying MockERC20 (cUSD)...
MockERC20 deployed to: 0xAbcD...1234

Deploying QuizPool...
QuizPool deployed to: 0xEfGh...5678

Deployment Summary:
- cUSD Token: 0xAbcD...1234
- QuizPool: 0xEfGh...5678
- Admin: 0x1234...5678
```

**Copy these addresses!** You'll need them for the next step.

## 🎨 Step 4: Update Frontend Environment

1. Open `frontend/.env.local`

2. Update with your deployed contract addresses:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=44787
NEXT_PUBLIC_QUIZ_POOL_ADDRESS=0xEfGh...5678
NEXT_PUBLIC_CUSD_ADDRESS=0xAbcD...1234
```

3. Save the file

## 🔄 Step 5: Restart Frontend

```bash
# Kill existing processes
lsof -ti:3000,3001 | xargs kill -9 2>/dev/null || true

# Start both frontend and backend
npm run dev
```

## ✅ Step 6: Verify Deployment

### Check on Block Explorer

Visit: https://alfajores.celoscan.io/address/YOUR_QUIZPOOL_ADDRESS

You should see:
- Contract creation transaction
- Contract code (if verified)
- Initial balance: 0 cUSD

### Test Contract Functions

1. **Connect MiniPay Wallet**
   - Open app in Opera Mini on mobile
   - Click "Connect MiniPay"
   - Approve connection

2. **Test Deposit**
   ```tsx
   import { useCeloWallet } from '@/contexts/CeloWalletContext';
   import { depositToPool, parseCUSD } from '@/lib/contract';

   const { kit } = useCeloWallet();
   await depositToPool(kit, parseCUSD('1')); // Deposit 1 cUSD
   ```

3. **Check Pool Balance**
   ```tsx
   import { getPoolBalance, formatCUSD } from '@/lib/contract';
   
   const balance = await getPoolBalance(kit);
   console.log('Pool:', formatCUSD(balance));
   ```

## 📱 Step 7: Test with MiniPay

### On Mobile:

1. **Install Opera Mini** (if not already installed)
   - Download from Play Store/App Store

2. **Get Test Funds**
   - Visit: https://faucet.celo.org/alfajores
   - Connect your MiniPay wallet
   - Request test CELO and cUSD

3. **Open Your App**
   - Navigate to: http://YOUR_IP:3000
   - Or use ngrok for HTTPS: `npx ngrok http 3000`

4. **Test Wallet Connection**
   - Should auto-detect MiniPay
   - Click "📱 Connect MiniPay"
   - Approve connection
   - See your address and balance

5. **Test Game Flow**
   - Create a room with entry fee
   - Join as another player
   - Complete quiz
   - Winners receive cUSD prizes!

## 🔍 Troubleshooting

### Deployment Fails

```
Error: insufficient funds for intrinsic transaction cost
```
**Solution**: Get more test CELO from faucet

```
Error: cannot estimate gas
```
**Solution**: Check your RPC URL and network connection

### Frontend Can't Connect

```
Error: Contract not deployed on network
```
**Solution**: 
1. Verify contract address in `.env.local`
2. Check you're on Alfajores (chainId: 44787)
3. Restart frontend

### MiniPay Not Detected

**Solution**:
1. Ensure you're using Opera Mini browser
2. Check console for "MiniPay wallet detected" log
3. Try disconnecting and reconnecting

## 🎮 Contract Addresses (Reference)

### Alfajores Testnet

```
Network: Celo Alfajores
Chain ID: 44787
RPC: https://alfajores-forno.celo-testnet.org
Explorer: https://alfajores.celoscan.io

Official cUSD: 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
(You can use this instead of deploying MockERC20)
```

## 📚 Useful Commands

```bash
# Check account balance
npx hardhat run scripts/checkBalance.ts --network alfajores

# Verify contract on explorer
npx hardhat verify --network alfajores DEPLOYED_ADDRESS

# Call contract functions
npx hardhat run scripts/payoutAdmin.ts --network alfajores

# Get contract info
npx hardhat console --network alfajores
```

## 🎯 Next Steps After Deployment

1. ✅ Contracts deployed to Alfajores
2. ✅ Frontend environment updated
3. ✅ MiniPay wallet connected
4. 🎮 Start playing and testing!
5. 💰 Distribute prizes to winners
6. 🚀 Deploy to mainnet when ready

## 🔐 Security Checklist

- [ ] Never commit `.env` file
- [ ] Use separate wallet for deployment (not your main wallet)
- [ ] Test all functions on testnet first
- [ ] Verify contract code on Celoscan
- [ ] Set up proper admin access controls
- [ ] Test emergency withdraw function
- [ ] Monitor contract for unusual activity

## 💡 Tips

- **Use Official cUSD**: Instead of deploying MockERC20, you can use the official Alfajores cUSD address: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`

- **Fund Your Contract**: Send some cUSD to the QuizPool contract for prize pools:
  ```bash
  npx hardhat run scripts/fundPool.ts --network alfajores
  ```

- **Monitor Gas Costs**: Deployment costs ~0.1-0.3 CELO on Alfajores

- **Mobile Testing**: Use ngrok for HTTPS to test on real mobile devices

## 🆘 Need Help?

- Celo Docs: https://docs.celo.org
- Celo Discord: https://chat.celo.org
- Alfajores Faucet: https://faucet.celo.org
- Block Explorer: https://alfajores.celoscan.io

---

**Ready to deploy?** Run `./deploy.sh` and follow the prompts! 🚀
