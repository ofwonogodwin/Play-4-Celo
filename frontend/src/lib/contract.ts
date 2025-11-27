import { ethers } from 'ethers';
import { CeloContract } from '@celo/contractkit';

// QuizPool ABI (add the actual ABI from your compiled contract)
const QUIZ_POOL_ABI = [
    'function deposit(uint256 amount) external',
    'function adminDeposit(uint256 amount) external',
    'function payoutWinners(address[] memory winners, uint256[] memory amounts) external',
    'function emergencyWithdraw() external',
    'function transferAdmin(address newAdmin) external',
    'function poolBalance() external view returns (uint256)',
    'function admin() external view returns (address)',
    'event Deposited(address indexed user, uint256 amount)',
    'event Payout(address indexed winner, uint256 amount)',
    'event AdminTransferred(address indexed previousAdmin, address indexed newAdmin)',
];

// Contract addresses (update these after deployment)
export const CONTRACTS = {
    QUIZ_POOL: process.env.NEXT_PUBLIC_QUIZ_POOL_ADDRESS || '0x0000000000000000000000000000000000000000',
    CUSD: process.env.NEXT_PUBLIC_CUSD_ADDRESS || '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
};

/**
 * Get QuizPool contract instance
 * @param kit - Celo ContractKit instance
 * @returns QuizPool contract instance
 */
export async function getQuizPoolContract(kit: any) {
    const provider = new ethers.BrowserProvider(kit.web3.currentProvider);
    const signer = await provider.getSigner();
    
    return new ethers.Contract(CONTRACTS.QUIZ_POOL, QUIZ_POOL_ABI, signer);
}

/**
 * Get cUSD token contract instance
 * @param kit - Celo ContractKit instance
 * @returns cUSD token contract instance
 */
export async function getCUSDContract(kit: any) {
    const stableToken = await kit.contracts.getStableToken();
    return stableToken;
}

/**
 * Deposit cUSD into QuizPool
 * @param kit - Celo ContractKit instance
 * @param amount - Amount in cUSD (in Wei)
 */
export async function depositToPool(kit: any, amount: string) {
    try {
        const quizPool = await getQuizPoolContract(kit);
        const cUSD = await getCUSDContract(kit);
        
        // First approve QuizPool to spend cUSD
        const approveTx = await cUSD.approve(CONTRACTS.QUIZ_POOL, amount).send();
        await approveTx.waitReceipt();
        
        // Then deposit
        const depositTx = await quizPool.deposit(amount);
        await depositTx.wait();
        
        return depositTx;
    } catch (error) {
        console.error('Deposit error:', error);
        throw error;
    }
}

/**
 * Get pool balance
 * @param kit - Celo ContractKit instance
 * @returns Pool balance in Wei
 */
export async function getPoolBalance(kit: any): Promise<string> {
    try {
        const quizPool = await getQuizPoolContract(kit);
        const balance = await quizPool.poolBalance();
        return balance.toString();
    } catch (error) {
        console.error('Error fetching pool balance:', error);
        return '0';
    }
}

/**
 * Check if address is admin
 * @param kit - Celo ContractKit instance
 * @param address - Address to check
 * @returns True if address is admin
 */
export async function isAdmin(kit: any, address: string): Promise<boolean> {
    try {
        const quizPool = await getQuizPoolContract(kit);
        const adminAddress = await quizPool.admin();
        return adminAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
        console.error('Error checking admin:', error);
        return false;
    }
}

/**
 * Payout winners (admin only)
 * @param kit - Celo ContractKit instance
 * @param winners - Array of winner addresses
 * @param amounts - Array of amounts (in Wei)
 */
export async function payoutWinners(kit: any, winners: string[], amounts: string[]) {
    try {
        const quizPool = await getQuizPoolContract(kit);
        const tx = await quizPool.payoutWinners(winners, amounts);
        await tx.wait();
        return tx;
    } catch (error) {
        console.error('Payout error:', error);
        throw error;
    }
}

/**
 * Format cUSD amount from Wei to readable string
 * @param amountWei - Amount in Wei
 * @returns Formatted string (e.g., "10.50 cUSD")
 */
export function formatCUSD(amountWei: string): string {
    const amount = ethers.formatUnits(amountWei, 18);
    return `${parseFloat(amount).toFixed(2)} cUSD`;
}

/**
 * Parse cUSD amount to Wei
 * @param amount - Amount as string (e.g., "10.5")
 * @returns Amount in Wei
 */
export function parseCUSD(amount: string): string {
    return ethers.parseUnits(amount, 18).toString();
}
