import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Admin script to payout winners after a game round
 * 
 * Usage:
 * 1. Create a winners.json file with the structure:
 *    {
 *      "winners": [
 *        { "address": "0x...", "amount": "100" },
 *        { "address": "0x...", "amount": "50" }
 *      ]
 *    }
 * 2. Run: npx hardhat run scripts/payoutAdmin.ts --network alfajores
 */

interface Winner {
    address: string;
    amount: string;
}

interface WinnersData {
    winners: Winner[];
}

async function main() {
    console.log("💰 Starting payout process...\n");

    // Get signer (admin)
    const [admin] = await ethers.getSigners();
    console.log("👤 Admin account:", admin.address);

    // Load deployment info
    const deploymentsDir = path.join(__dirname, "../deployments");
    const latestPath = path.join(deploymentsDir, "latest.json");

    if (!fs.existsSync(latestPath)) {
        throw new Error("❌ No deployment found. Please deploy the contract first.");
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(latestPath, "utf-8"));
    const quizPoolAddress = deploymentInfo.quizPoolAddress;
    const cUSDAddress = deploymentInfo.cUSDAddress;

    console.log("📍 QuizPool address:", quizPoolAddress);
    console.log("💵 cUSD address:", cUSDAddress);

    // Get contract instance
    const quizPool = await ethers.getContractAt("QuizPool", quizPoolAddress);

    // Verify admin
    const contractAdmin = await quizPool.admin();
    if (contractAdmin.toLowerCase() !== admin.address.toLowerCase()) {
        throw new Error(`❌ Not authorized. Contract admin is ${contractAdmin}`);
    }

    console.log("✅ Admin verified\n");

    // Load winners data
    const winnersPath = path.join(__dirname, "../data/winners.json");

    if (!fs.existsSync(winnersPath)) {
        console.log("⚠️  No winners.json found. Creating example file...");

        const exampleData: WinnersData = {
            winners: [
                { address: "0x1234567890123456789012345678901234567890", amount: "100" },
                { address: "0x2234567890123456789012345678901234567890", amount: "50" },
                { address: "0x3234567890123456789012345678901234567890", amount: "25" },
            ],
        };

        const dataDir = path.join(__dirname, "../data");
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(winnersPath, JSON.stringify(exampleData, null, 2));
        console.log("📄 Example winners.json created at:", winnersPath);
        console.log("⚠️  Please update with actual winner addresses and amounts, then run again.");
        return;
    }

    const winnersData: WinnersData = JSON.parse(fs.readFileSync(winnersPath, "utf-8"));

    if (!winnersData.winners || winnersData.winners.length === 0) {
        throw new Error("❌ No winners found in winners.json");
    }

    console.log(`📋 Processing ${winnersData.winners.length} winners:\n`);

    // Prepare arrays for contract call
    const addresses: string[] = [];
    const amounts: bigint[] = [];
    let totalPayout = 0n;

    for (const winner of winnersData.winners) {
        const address = winner.address;
        const amount = ethers.parseEther(winner.amount);

        addresses.push(address);
        amounts.push(amount);
        totalPayout += amount;

        console.log(`   ${address}: ${winner.amount} cUSD`);
    }

    console.log(`\n💵 Total payout: ${ethers.formatEther(totalPayout)} cUSD`);

    // Check contract balance
    const balance = await quizPool.getBalance();
    console.log(`📊 Contract balance: ${ethers.formatEther(balance)} cUSD`);

    if (balance < totalPayout) {
        throw new Error(`❌ Insufficient contract balance. Need ${ethers.formatEther(totalPayout)} cUSD`);
    }

    // Confirm payout
    console.log("\n⏳ Initiating payout transaction...");

    const tx = await quizPool.payoutWinners(addresses, amounts);
    console.log("📤 Transaction sent:", tx.hash);

    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();

    console.log("✅ Transaction confirmed!");
    console.log("   Block:", receipt?.blockNumber);
    console.log("   Gas used:", receipt?.gasUsed.toString());

    // Get updated balance
    const newBalance = await quizPool.getBalance();
    console.log(`\n📊 New contract balance: ${ethers.formatEther(newBalance)} cUSD`);

    // Save payout record
    const payoutRecord = {
        txHash: tx.hash,
        blockNumber: receipt?.blockNumber,
        timestamp: new Date().toISOString(),
        winners: winnersData.winners,
        totalPayout: ethers.formatEther(totalPayout),
        gasUsed: receipt?.gasUsed.toString(),
    };

    const payoutsDir = path.join(__dirname, "../data/payouts");
    if (!fs.existsSync(payoutsDir)) {
        fs.mkdirSync(payoutsDir, { recursive: true });
    }

    const payoutFilename = `payout-${Date.now()}.json`;
    const payoutPath = path.join(payoutsDir, payoutFilename);
    fs.writeFileSync(payoutPath, JSON.stringify(payoutRecord, null, 2));

    console.log("\n📄 Payout record saved to:", payoutPath);
    console.log("\n🎉 Payout completed successfully!");

    // Archive winners.json
    const archiveDir = path.join(__dirname, "../data/archive");
    if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
    }

    const archivePath = path.join(archiveDir, `winners-${Date.now()}.json`);
    fs.copyFileSync(winnersPath, archivePath);
    console.log("📦 Winners file archived to:", archivePath);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Payout failed:", error);
        process.exit(1);
    });
