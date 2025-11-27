# MiniPay Wallet Integration - Play-4-Celo

## ✅ Completed Integration

### 1. **Dependencies Installed**
```bash
npm install @celo/react-celo @celo-tools/use-contractkit @celo/contractkit @walletconnect/web3-provider viem
```

### 2. **Files Created**

#### **`frontend/src/providers/WalletProvider.tsx`**
- Main wallet provider wrapping the entire app
- Configures Celo Alfajores testnet
- Detects MiniPay browser
- Includes WalletConnect support

#### **`frontend/src/contexts/CeloWalletContext.tsx`**
- React context for wallet state management
- Provides: `address`, `isConnected`, `isMiniPay`, `balance`, `connect()`, `disconnect()`, `kit`
- Automatically fetches and updates CELO balance
- MiniPay detection logic

#### **`frontend/src/components/ConnectMiniPay.tsx`**
- Ready-to-use wallet connection component
- Auto-detects MiniPay and shows appropriate UI
- Displays wallet address and balance
- Styled with your existing Tailwind classes
- Uses your existing Button component

#### **`frontend/src/lib/contract.ts`**
- Helper functions for QuizPool contract interactions
- `getQuizPoolContract()` - Get contract instance
- `getCUSDContract()` - Get cUSD token contract
- `depositToPool()` - Deposit cUSD to pool
- `getPoolBalance()` - Check pool balance
- `isAdmin()` - Verify admin status
- `payoutWinners()` - Distribute prizes (admin only)
- `formatCUSD()` & `parseCUSD()` - Amount formatting

### 3. **App Configuration**

#### **`frontend/src/pages/_app.tsx`**
Updated to wrap entire app with:
```tsx
<WalletProvider>
  <QueryClientProvider>
    {/* Your app */}
  </QueryClientProvider>
</WalletProvider>
```

### 4. **Environment Variables**
Already configured in `frontend/.env.local`:
```env
NEXT_PUBLIC_QUIZ_POOL_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CUSD_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
```

## 🎯 How to Use MiniPay Integration

### **In Any Component:**

```tsx
import { useCeloWallet } from '@/contexts/CeloWalletContext';

export default function MyComponent() {
  const { address, isConnected, isMiniPay, balance, connect, disconnect, kit } = useCeloWallet();

  return (
    <div>
      {!isConnected ? (
        <button onClick={connect}>
          {isMiniPay ? '📱 Connect MiniPay' : 'Connect Wallet'}
        </button>
      ) : (
        <div>
          <p>Address: {address}</p>
          <p>Balance: {balance} CELO</p>
          {isMiniPay && <span>Using MiniPay!</span>}
          <button onClick={disconnect}>Disconnect</button>
        </div>
      )}
    </div>
  );
}
```

### **Using Contract Functions:**

```tsx
import { useCeloWallet } from '@/contexts/CeloWalletContext';
import { depositToPool, getPoolBalance, formatCUSD, parseCUSD } from '@/lib/contract';

export default function PoolComponent() {
  const { kit, isConnected } = useCeloWallet();

  const handleDeposit = async () => {
    if (!kit) return;
    
    try {
      const amount = parseCUSD('10'); // 10 cUSD
      await depositToPool(kit, amount);
      alert('Deposit successful!');
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const checkBalance = async () => {
    if (!kit) return;
    
    const balance = await getPoolBalance(kit);
    console.log('Pool balance:', formatCUSD(balance));
  };

  return (
    <div>
      <button onClick={handleDeposit}>Deposit 10 cUSD</button>
      <button onClick={checkBalance}>Check Pool Balance</button>
    </div>
  );
}
```

## 🔧 Integration with Existing UI

### **Option 1: Use ConnectMiniPay Component**
Already styled with your existing design:

```tsx
import ConnectMiniPay from '@/components/ConnectMiniPay';

<ConnectMiniPay />
```

### **Option 2: Use in Existing Components**
Replace your current `useWallet()` hook with `useCeloWallet()`:

```tsx
// Old
import { useWallet } from '@/utils/wallet';
const { wallet, connect } = useWallet();

// New
import { useCeloWallet } from '@/contexts/CeloWalletContext';
const { address, connect, kit } = useCeloWallet();
```

## 📱 MiniPay Detection

The integration automatically detects:
- MiniPay browser environment
- MiniPay wallet provider
- Falls back to WalletConnect/Valora if MiniPay not available

Detection happens in:
- `WalletProvider.tsx` - Logs to console
- `CeloWalletContext.tsx` - Provides `isMiniPay` boolean
- `ConnectMiniPay.tsx` - Changes button text/icon

## 🎮 Next Steps

1. **Deploy QuizPool Contract** to Alfajores testnet
2. **Update** `NEXT_PUBLIC_QUIZ_POOL_ADDRESS` in `.env.local`
3. **Test** wallet connection with MiniPay on mobile
4. **Integrate** payment logic into your game flow
5. **Add** prize distribution after quiz completion

## 🚀 Testing MiniPay

1. Open app in Opera Mini browser on mobile
2. MiniPay should be auto-detected
3. Click "Connect MiniPay" button
4. Approve connection in MiniPay
5. Your UI will show connected address + balance

## 📚 Available Functions

### Wallet Functions:
- `connect()` - Connect wallet
- `disconnect()` - Disconnect wallet
- `address` - User's wallet address
- `balance` - Current CELO balance
- `isConnected` - Connection status
- `isMiniPay` - MiniPay detection
- `kit` - Celo ContractKit instance

### Contract Functions:
- `depositToPool(kit, amount)` - Deposit to pool
- `getPoolBalance(kit)` - Get pool balance
- `isAdmin(kit, address)` - Check admin
- `payoutWinners(kit, winners, amounts)` - Pay winners
- `formatCUSD(wei)` - Format amount
- `parseCUSD(amount)` - Parse to Wei

## ⚠️ Important Notes

1. **No UI Changes**: All existing UI components remain unchanged
2. **Wallet Provider**: Wraps entire app in `_app.tsx`
3. **Contract Integration**: Ready to use with deployed contracts
4. **MiniPay First**: Prioritizes MiniPay when detected
5. **Fallback Support**: Works with Valora and other Celo wallets

## 🎨 Your UI Integration

The `ConnectMiniPay` component is already styled to match your existing design:
- Uses your `Button` component
- Matches your color scheme (celo-green, etc.)
- Responsive design
- Shows balance and MiniPay badge
- Clean disconnect functionality

You can drop it anywhere in your app without breaking existing styles!
