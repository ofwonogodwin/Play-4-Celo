import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("🚀 Starting QuizPool deployment...\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

    // Get cUSD address from environment or use default for Alfajores
    const cUSDAddress = process.env.NEXT_PUBLIC_CUSD_ADDRESS || "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
    console.log("💵 Using cUSD address:", cUSDAddress);

    // Deploy QuizPool
    console.log("\n⏳ Deploying QuizPool contract...");
    const QuizPoolFactory = await ethers.getContractFactory("QuizPool");
    const quizPool = await QuizPoolFactory.deploy(cUSDAddress);
    await quizPool.waitForDeployment();

    const quizPoolAddress = await quizPool.getAddress();
    console.log("✅ QuizPool deployed to:", quizPoolAddress);

    // Verify admin
    const admin = await quizPool.admin();
    console.log("👤 Contract admin:", admin);

    // Save deployment info
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        chainId: Number((await ethers.provider.getNetwork()).chainId),
        quizPoolAddress: quizPoolAddress,
        cUSDAddress: cUSDAddress,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        blockNumber: await ethers.provider.getBlockNumber(),
    };

    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const filename = `deployment-${deploymentInfo.chainId}-${Date.now()}.json`;
    const filepath = path.join(deploymentsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

    // Also save latest deployment
    const latestPath = path.join(deploymentsDir, "latest.json");
    fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n📄 Deployment info saved to:", filepath);
    console.log("📄 Latest deployment info saved to:", latestPath);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Summary:");
    console.log("   QuizPool:", quizPoolAddress);
    console.log("   cUSD:", cUSDAddress);
    console.log("   Network:", deploymentInfo.network);
    console.log("   Chain ID:", deploymentInfo.chainId);

    console.log("\n⚠️  IMPORTANT: Update your frontend .env with:");
    console.log(`   NEXT_PUBLIC_QUIZ_POOL_ADDRESS=${quizPoolAddress}`);
    console.log(`   NEXT_PUBLIC_CUSD_ADDRESS=${cUSDAddress}`);

    // Verification instructions
    if (deploymentInfo.chainId === 44787 || deploymentInfo.chainId === 42220) {
        console.log("\n🔍 To verify on Celoscan, run:");
        console.log(`   npx hardhat verify --network ${deploymentInfo.chainId === 44787 ? 'alfajores' : 'celo'} ${quizPoolAddress} ${cUSDAddress}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
