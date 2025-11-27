# 🚀 Quick Deployment Instructions

## Step 1: Setup Environment (2 minutes)

1. **Copy the environment template:**
```bash
cp .env.example .env
```

2. **Get your private key:**
   - **MetaMask**: Click account → Account Details → Export Private Key
   - **Valora/MiniPay**: Settings → Show Recovery Phrase → Use first account's private key

3. **Edit `.env` file and add your private key:**
```bash
nano .env
```

Replace this line:
```
DEPLOYER_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
```

With your actual private key:
```
DEPLOYER_PRIVATE_KEY=0xYOUR_ACTUAL_PRIVATE_KEY_HERE
```

Save and exit (Ctrl+X, then Y, then Enter)

## Step 2: Get Test Funds (2 minutes)

1. **Visit Celo Faucet:**
   https://faucet.celo.org/alfajores

2. **Connect your wallet** (the same one you exported the private key from)

3. **Request test CELO** - you need at least 0.5 CELO

## Step 3: Deploy Contract (1 minute)

```bash
npx hardhat run scripts/deployToAlfajores.ts --network alfajores
```

**Expected output:**
```
🚀 DEPLOYING TO CELO ALFAJORES TESTNET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Deployment Account: 0x1234...5678
💰 Account Balance: 1.5 CELO

📝 Step 1: Deploying MockERC20 (cUSD)...
✅ MockERC20 deployed to: 0xAbcD...1234

📝 Step 2: Deploying QuizPool...
✅ QuizPool deployed to: 0xEfGh...5678

✅ DEPLOYMENT SUCCESSFUL!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 CONTRACT ADDRESSES:
   cUSD Token: 0xAbcD...1234
   QuizPool: 0xEfGh...5678
```

**COPY THESE ADDRESSES!**

## Step 4: Update Frontend (30 seconds)

Edit `frontend/.env.local`:

```bash
nano frontend/.env.local
```

Update these lines with YOUR deployed addresses:
```
NEXT_PUBLIC_QUIZ_POOL_ADDRESS=0xEfGh...5678
NEXT_PUBLIC_CUSD_ADDRESS=0xAbcD...1234
```

## Step 5: Start the App (10 seconds)

```bash
npm run dev
```

## ✅ You're Done!

Your contracts are now live on Alfajores testnet! 🎉

### Test with MiniPay:

1. Open Opera Mini on your mobile
2. Navigate to your app
3. Connect MiniPay wallet
4. Start playing and earning!

### View on Explorer:

Visit: `https://alfajores.celoscan.io/address/YOUR_QUIZ_POOL_ADDRESS`

---

## 🆘 Common Issues

**Error: insufficient funds**
→ Get more test CELO from https://faucet.celo.org/alfajores

**Error: invalid private key**
→ Make sure your private key starts with `0x` in `.env`

**Contract not found on frontend**
→ Double-check addresses in `frontend/.env.local`

---

**Total Time: ~5 minutes** ⏱️
