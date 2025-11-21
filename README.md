#  Play-4-Celo Now

**A mobile-first quiz and play-to-earn platform built on Celo blockchain**

Play-4-Celo is a production-ready hackathon starter that combines interactive quizzes with blockchain rewards. Players compete in real-time quiz battles, answer questions correctly and quickly, and earn cUSD tokens on the Celo network.

[![Built for Celo](https://img.shields.io/badge/Built%20for-Celo-35D07F)](https://celo.org)
[![MiniPay Compatible](https://img.shields.io/badge/MiniPay-Compatible-FCFF52)](https://minipay.opera.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Features

- ✅ **Mobile-First Design** - Optimized for MiniPay and mobile wallets
- 💰 **Play-to-Earn** - Win cUSD rewards by answering questions correctly
- ⚡ **Real-Time Competition** - Compete with other players in live quiz battles
- 🔐 **Secure Smart Contracts** - Audited Solidity contracts with comprehensive tests
- 🎯 **Multiple Categories** - Blockchain, Football, and Smart Contracts quizzes
- 📊 **Leaderboards** - Track your performance and climb the ranks
- 🌐 **Celo Native** - Built specifically for the Celo ecosystem

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Smart Contracts](#smart-contracts)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Deployment](#deployment)
- [Testing](#testing)
- [Demo Flow](#demo-flow)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

---

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **MetaMask** or **MiniPay** wallet
- **Celo Alfajores Testnet** tokens - [Faucet](https://faucet.celo.org)

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Play-4-Celo.git
cd Play-4-Celo
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all project dependencies (root + frontend + backend)
npm run install:all
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
nano .env
```

**⚠️ Important:** Update these values in `.env`:
- `DEPLOYER_PRIVATE_KEY` - Your wallet private key (keep this secret!)
- `ALFAJORES_RPC_URL` - Celo Alfajores RPC endpoint
- Other configuration as needed

### 4. Start Local Development

```bash
# Terminal 1: Start Hardhat local node
npm run node

# Terminal 2: Deploy contracts to local network
npm run deploy:local

# Terminal 3: Start backend server
npm run backend:dev

# Terminal 4: Start frontend
npm run frontend:dev
```

Visit `http://localhost:3000` to see the app running! 🎉

---

## 📁 Project Structure

```
play-4-celo/
├── contracts/              # Solidity smart contracts
│   ├── QuizPool.sol       # Main reward pool contract
│   └── MockERC20.sol      # Mock cUSD for testing
├── scripts/               # Deployment and admin scripts
│   ├── deploy.ts          # Contract deployment script
│   └── payoutAdmin.ts     # Winner payout script
├── test/                  # Contract tests
│   └── QuizPool.test.ts   # Comprehensive test suite
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Next.js pages
│   │   ├── styles/        # Global styles
│   │   └── data/          # Questions dataset
│   ├── public/            # Static assets
│   └── package.json
├── backend/               # Express.js backend server
│   ├── src/
│   │   └── server.ts      # Main server file
│   └── package.json
├── hardhat.config.ts      # Hardhat configuration
├── package.json           # Root package.json
└── README.md             # This file
```

---

## 📜 Smart Contracts

### QuizPool.sol

The main contract that manages the reward pool and payouts.

**Key Features:**
- ✅ Deposit entry fees (user or admin)
- ✅ Secure winner payouts (admin-only)
- ✅ Emergency withdraw function
- ✅ Admin transfer capability
- ✅ Event logging for transparency

**Main Functions:**

```solidity
// Deposit cUSD into the pool
function deposit(uint256 amount) external

// Admin deposits funds
function adminDeposit(uint256 amount) external onlyAdmin

// Pay winners after a game
function payoutWinners(address[] winners, uint256[] amounts) external onlyAdmin

// Emergency withdraw (admin only)
function emergencyWithdraw() external onlyAdmin

// Transfer admin rights
function transferAdmin(address newAdmin) external onlyAdmin
```

**Events:**
- `Deposit(address indexed from, uint256 amount, uint256 timestamp)`
- `WinnerPaid(address indexed winner, uint256 amount, uint256 timestamp)`
- `Payout(address indexed admin, uint256 totalAmount, uint256 winnersCount, uint256 timestamp)`
- `EmergencyWithdraw(address indexed admin, uint256 amount, uint256 timestamp)`
- `OwnerChanged(address indexed oldOwner, address indexed newOwner, uint256 timestamp)`

---

## 💻 Frontend Setup

### Technology Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first styling
- **React Query** - Data fetching
- **Ethers.js** - Ethereum/Celo interaction
- **Zustand** - State management

### Running Frontend Locally

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Key Pages

- `/` - Home page with wallet connection
- `/rooms` - Browse and join quiz rooms
- `/room/[id]` - Room lobby and game waiting area
- `/play/[roundId]` - Active quiz gameplay
- `/admin` - Admin dashboard for payouts
- `/profile` - User profile with badges and stats

---

## 🖥️ Backend Setup

### Technology Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **CORS** - Cross-origin support
- **UUID** - Unique ID generation

### Running Backend Locally

```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### API Endpoints

#### Game Management
- `GET /health` - Health check
- `POST /api/rooms` - Create a new room
- `GET /api/rooms` - Get all active rooms
- `GET /api/rooms/:roomId` - Get room details
- `POST /api/rooms/:roomId/join` - Join a room
- `POST /api/rooms/:roomId/start` - Start the game (host only)
- `POST /api/rooms/:roomId/submit` - Submit answers
- `POST /api/rooms/:roomId/finish` - Finish game and calculate winners

#### Questions
- `GET /api/questions/:category` - Get questions for a category

#### Admin
- `GET /api/admin/payout/:roomId` - Get payout data for winners

---

## 🚀 Deployment

### Deploy to Alfajores Testnet

**Step 1: Get Test Tokens**

Visit the [Celo Alfajores Faucet](https://faucet.celo.org) and get:
- CELO (for gas fees)
- cUSD (for testing payments)

**Step 2: Configure Environment**

Update `.env` with your Alfajores configuration:

```env
ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
DEPLOYER_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_CUSD_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
```

**Step 3: Deploy Smart Contracts**

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Alfajores
npm run deploy:alfajores
```

After deployment, update your frontend `.env` with the contract address:

```env
NEXT_PUBLIC_QUIZ_POOL_ADDRESS=0xYourDeployedContractAddress
```

**Step 4: Verify Contract (Optional)**

```bash
npx hardhat verify --network alfajores YOUR_CONTRACT_ADDRESS YOUR_CUSD_ADDRESS
```

### Deploy Frontend (Vercel)

```bash
cd frontend

# Build
npm run build

# Deploy to Vercel
vercel deploy --prod
```

### Deploy Backend

You can deploy the backend to:
- **Heroku**
- **Railway**
- **DigitalOcean**
- **AWS/GCP/Azure**

Example for Railway:

```bash
cd backend
railway init
railway up
```

---

## 🧪 Testing

### Run Contract Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npx hardhat coverage

# Run tests with gas reporting
REPORT_GAS=true npm test
```

### Test Coverage

The test suite includes:
- ✅ Contract deployment
- ✅ Deposit functionality
- ✅ Payout mechanisms
- ✅ Access control
- ✅ Emergency functions
- ✅ Edge cases
- ✅ Event emissions

---

## 🎬 Demo Flow

### For Hackathon Judges

**Complete Demo Script (5-10 minutes)**

#### 1. Setup (1 minute)
```bash
# Clone and install
git clone https://github.com/yourusername/Play-4-Celo.git
cd Play-4-Celo
npm run install:all

# Start all services
npm run start:dev
```

#### 2. Smart Contract Demo (2 minutes)
```bash
# Show contract tests passing
npm test

# Deploy to Alfajores
npm run deploy:alfajores
```

#### 3. Frontend Demo (3 minutes)
- Open `http://localhost:3000`
- Connect wallet (MetaMask or MiniPay)
- Create a quiz room
- Select category (Blockchain/Football/Solidity)
- Join with multiple test wallets
- Play the quiz
- Show leaderboard with scores

#### 4. Backend & Payout Demo (2 minutes)
- Show backend API responses
- Demonstrate admin payout calculation
- Execute payout transaction
- Verify winners received cUSD

#### 5. Mobile Demo (2 minutes)
- Open on mobile device or use browser DevTools
- Show responsive mobile-first design
- Demonstrate MiniPay compatibility
- Show touch-optimized UI

---

## 🔐 Environment Variables

### Root `.env`

```env
# Network Configuration
ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
DEPLOYER_PRIVATE_KEY=your_wallet_private_key

# Contract Addresses
NEXT_PUBLIC_QUIZ_POOL_ADDRESS=deployed_contract_address
NEXT_PUBLIC_CUSD_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1

# Backend
PORT=3001
NODE_ENV=development

# Frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=44787
```

### Important Notes

- ⚠️ **Never commit `.env` to version control**
- ⚠️ **Keep your private keys secure**
- ⚠️ **Use different wallets for testnet and mainnet**
- ⚠️ **Rotate keys if compromised**

---

## 🏗️ Architecture

### System Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│   Frontend  │────────▶│   Backend   │────────▶│  Blockchain │
│  (Next.js)  │         │  (Express)  │         │    (Celo)   │
│             │         │             │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │                        │
      │                       │                        │
      ▼                       ▼                        ▼
  User Wallet          Game Logic            Smart Contracts
  WalletConnect      Scoring Engine          Reward Pool
   MiniPay           Matchmaking             cUSD Payments
```

### Data Flow

1. **User Actions** → Frontend captures wallet interaction
2. **Game Logic** → Backend orchestrates quiz flow
3. **Score Calculation** → Backend computes winners
4. **Payout Trigger** → Admin calls smart contract
5. **Token Transfer** → Contract distributes cUSD to winners

### Security Model

- **Frontend**: Read-only blockchain interaction for user data
- **Backend**: Stateless game orchestration (no funds held)
- **Smart Contract**: Only entity that holds and distributes funds
- **Admin**: Single point of control with transparent event logging

---

## 🔒 Security Considerations

### Smart Contract Security

✅ **Access Control**: Only admin can trigger payouts
✅ **Input Validation**: All parameters are validated
✅ **Event Logging**: All critical actions emit events
✅ **Reentrancy Protection**: Uses checks-effects-interactions pattern
✅ **Emergency Functions**: Admin can recover funds if needed

### Backend Security

⚠️ **Production Recommendations**:
- Use database instead of in-memory storage
- Implement rate limiting
- Add authentication middleware
- Validate all inputs
- Use HTTPS only
- Implement CORS properly

### Anti-Cheat Measures

**Current Implementation**:
- Server-side score calculation
- Time-based bonuses
- Question randomization

**Future Enhancements** (TODO):
- Question encryption
- Server-side timing validation
- IP/wallet address rate limiting
- Captcha for suspicious activity
- Multi-signature for large payouts

---

## 🎯 Game Rules

### Scoring System

- **Correct Answer**: 100 points
- **Speed Bonus**: Up to 50 points (faster = more points)
- **Total per Question**: Max 150 points
- **Penalty for Wrong Answer**: 0 points

### Prize Distribution

- **3+ Players**:
  - 🥇 1st Place: 50% of prize pool
  - 🥈 2nd Place: 30% of prize pool
  - 🥉 3rd Place: 20% of prize pool

- **2 Players**:
  - 🥇 1st Place: 60% of prize pool
  - 🥈 2nd Place: 40% of prize pool

- **1 Player**:
  - 🥇 Winner takes all: 100% of prize pool

---

## 📱 Mobile Optimization

### MiniPay Integration

Play-4-Celo is optimized for Opera MiniPay:

- ✅ Mobile-first responsive design
- ✅ Touch-optimized interactions
- ✅ Low data usage
- ✅ Fast loading times
- ✅ Safe area insets for notched devices
- ✅ PWA-ready (Progressive Web App)

### Browser Compatibility

- ✅ Chrome/Brave (Desktop & Mobile)
- ✅ Firefox
- ✅ Safari/iOS
- ✅ Opera Mini with MiniPay
- ✅ Samsung Internet

---

## 🛠️ Development Scripts

### Root Commands

```bash
npm run node              # Start Hardhat local node
npm run compile           # Compile smart contracts
npm test                  # Run contract tests
npm run deploy:local      # Deploy to local network
npm run deploy:alfajores  # Deploy to Alfajores testnet
npm run payout:local      # Run payout script (local)
npm run payout:alfajores  # Run payout script (Alfajores)
npm run install:all       # Install all dependencies
npm run start:dev         # Start all services concurrently
npm run clean             # Clean all build artifacts
```

### Frontend Commands

```bash
cd frontend
npm run dev               # Start development server
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Lint code
npm run type-check        # TypeScript type checking
```

### Backend Commands

```bash
cd backend
npm run dev               # Start development server
npm run build             # Compile TypeScript
npm run start             # Start production server
```

---

## 📊 Questions Dataset

The app includes 12 questions per category:

- **Blockchain & Celo** (12 questions)
- **Football** (12 questions)
- **Smart Contracts/Solidity** (12 questions)

### Adding New Questions

Edit `frontend/src/data/questions.json`:

```json
{
  "category_name": [
    {
      "id": "unique_id",
      "q": "Your question here?",
      "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": 0
    }
  ]
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Write comprehensive tests
- Document complex logic
- Use meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Celo Foundation** - For the amazing blockchain platform
- **MiniPay Team** - For mobile-first wallet innovation
- **Hardhat** - For excellent development tools
- **Next.js Team** - For the amazing React framework
- **OpenZeppelin** - For security best practices

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/Play-4-Celo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/Play-4-Celo/discussions)
- **Discord**: [Join our community](#)
- **Email**: support@play4celo.com

---

## 🎉 Hackathon Pitch (60 seconds)

**Play-4-Celo** brings play-to-earn gaming to the masses with mobile-first quiz battles on Celo.

**The Problem**: Traditional quiz apps don't reward players, and crypto games are too complex for newcomers.

**Our Solution**: A simple, mobile-optimized quiz platform where anyone can:
- Connect their MiniPay wallet in seconds
- Compete in fun trivia battles
- Earn real cUSD rewards instantly

**Why Celo?** Mobile-first blockchain perfect for emerging markets. Fast, cheap transactions with phone number mapping make it accessible to everyone.

**Tech Highlights**:
- Secure smart contracts with comprehensive tests
- Mobile-first responsive design
- Real-time multiplayer orchestration
- Multiple quiz categories

**Traction**: Ready for immediate deployment with complete test coverage and production-ready code.

**Call to Action**: Try it now at play4celo.com and start earning while learning!

---

## 🚀 Roadmap

### Phase 1: MVP ✅
- [x] Smart contract development
- [x] Frontend with wallet connection
- [x] Backend game orchestration
- [x] Basic quiz categories
- [x] Payout system

### Phase 2: Enhancement (Q1 2024)
- [ ] User authentication
- [ ] Profile system with badges
- [ ] Weekly leaderboards
- [ ] More quiz categories
- [ ] Social sharing features

### Phase 3: Scale (Q2 2024)
- [ ] Multi-language support
- [ ] Tournament mode
- [ ] Referral system
- [ ] Mobile apps (iOS/Android)
- [ ] Integration with more wallets

### Phase 4: Ecosystem (Q3 2024)
- [ ] NFT badges and achievements
- [ ] DAO governance
- [ ] Community-created quizzes
- [ ] Sponsor integration
- [ ] Cross-chain expansion

---

**Built with ❤️ for the Celo Minipay Hackathon 2025**

*Made by developers, for the community*
