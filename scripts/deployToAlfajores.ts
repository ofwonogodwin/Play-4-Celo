import { ethers } from 'hardhat';

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 DEPLOYING TO CELO ALFAJORES TESTNET');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📋 Deployment Account:', deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('💰 Account Balance:', ethers.formatEther(balance), 'CELO');
    console.log('');

    if (balance < ethers.parseEther('0.1')) {
        console.log('⚠️  WARNING: Low balance! Get test CELO from:');
        console.log('   https://faucet.celo.org/alfajores');
        console.log('');
    }

    // Deploy MockERC20 (cUSD for testing)
    console.log('📝 Step 1: Deploying MockERC20 (cUSD)...');
    const MockERC20 = await ethers.getContractFactory('MockERC20');
    const cUSD = await MockERC20.deploy('Celo Dollar', 'cUSD', ethers.parseEther('1000000'));
    await cUSD.waitForDeployment();
    const cUSDAddress = await cUSD.getAddress();
    console.log('✅ MockERC20 deployed to:', cUSDAddress);
    console.log('');

    // Deploy QuizPool
    console.log('📝 Step 2: Deploying QuizPool...');
    const QuizPool = await ethers.getContractFactory('QuizPool');
    const quizPool = await QuizPool.deploy(cUSDAddress);
    await quizPool.waitForDeployment();
    const quizPoolAddress = await quizPool.getAddress();
    console.log('✅ QuizPool deployed to:', quizPoolAddress);
    console.log('');

    // Mint some test cUSD to deployer
    console.log('📝 Step 3: Minting test cUSD to deployer...');
    const mintTx = await cUSD.mint(deployer.address, ethers.parseEther('10000'));
    await mintTx.wait();
    console.log('✅ Minted 10,000 test cUSD to:', deployer.address);
    console.log('');

    // Display summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DEPLOYMENT SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📋 CONTRACT ADDRESSES:');
    console.log('   cUSD Token:', cUSDAddress);
    console.log('   QuizPool:', quizPoolAddress);
    console.log('   Admin:', deployer.address);
    console.log('');
    console.log('🔍 View on Block Explorer:');
    console.log('   https://alfajores.celoscan.io/address/' + quizPoolAddress);
    console.log('');
    console.log('📝 NEXT STEPS:');
    console.log('');
    console.log('1. Update frontend/.env.local:');
    console.log('   NEXT_PUBLIC_QUIZ_POOL_ADDRESS=' + quizPoolAddress);
    console.log('   NEXT_PUBLIC_CUSD_ADDRESS=' + cUSDAddress);
    console.log('');
    console.log('2. Restart your frontend:');
    console.log('   npm run dev');
    console.log('');
    console.log('3. Test with MiniPay on Opera Mini mobile browser');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Save addresses to a file for easy reference
    const fs = require('fs');
    const addresses = {
        network: 'alfajores',
        chainId: 44787,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            cUSD: cUSDAddress,
            QuizPool: quizPoolAddress,
        },
        explorer: {
            cUSD: `https://alfajores.celoscan.io/address/${cUSDAddress}`,
            QuizPool: `https://alfajores.celoscan.io/address/${quizPoolAddress}`,
        },
    };

    fs.writeFileSync(
        'deployments.json',
        JSON.stringify(addresses, null, 2)
    );

    console.log('💾 Deployment info saved to deployments.json');
    console.log('');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('');
        console.error('❌ DEPLOYMENT FAILED:');
        console.error(error);
        process.exit(1);
    });
