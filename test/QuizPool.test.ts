import { expect } from "chai";
import { ethers } from "hardhat";
import { QuizPool } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("QuizPool", function () {
    let quizPool: QuizPool;
    let mockCUSD: any;
    let admin: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let user3: SignerWithAddress;

    const INITIAL_SUPPLY = ethers.parseEther("10000");

    beforeEach(async function () {
        // Get signers
        [admin, user1, user2, user3] = await ethers.getSigners();

        // Deploy mock cUSD token (ERC20)
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        mockCUSD = await MockERC20.deploy("Celo Dollar", "cUSD", INITIAL_SUPPLY);
        await mockCUSD.waitForDeployment();

        // Deploy QuizPool contract
        const QuizPoolFactory = await ethers.getContractFactory("QuizPool");
        quizPool = await QuizPoolFactory.deploy(await mockCUSD.getAddress());
        await quizPool.waitForDeployment();

        // Distribute tokens to users
        await mockCUSD.transfer(user1.address, ethers.parseEther("1000"));
        await mockCUSD.transfer(user2.address, ethers.parseEther("1000"));
        await mockCUSD.transfer(user3.address, ethers.parseEther("1000"));
    });

    describe("Deployment", function () {
        it("Should set the correct admin", async function () {
            expect(await quizPool.admin()).to.equal(admin.address);
        });

        it("Should set the correct cUSD address", async function () {
            expect(await quizPool.cUSD()).to.equal(await mockCUSD.getAddress());
        });

        it("Should emit OwnerChanged event on deployment", async function () {
            const QuizPoolFactory = await ethers.getContractFactory("QuizPool");
            await expect(QuizPoolFactory.deploy(await mockCUSD.getAddress()))
                .to.emit(QuizPoolFactory, "OwnerChanged");
        });

        it("Should revert if cUSD address is zero", async function () {
            const QuizPoolFactory = await ethers.getContractFactory("QuizPool");
            await expect(
                QuizPoolFactory.deploy(ethers.ZeroAddress)
            ).to.be.revertedWith("QuizPool: Invalid cUSD address");
        });
    });

    describe("Deposits", function () {
        const depositAmount = ethers.parseEther("100");

        it("Should allow users to deposit funds", async function () {
            await mockCUSD.connect(user1).approve(await quizPool.getAddress(), depositAmount);

            await expect(quizPool.connect(user1).deposit(depositAmount))
                .to.emit(quizPool, "Deposit")
                .withArgs(user1.address, depositAmount, await time.latest() + 1);

            expect(await quizPool.totalDeposits()).to.equal(depositAmount);
            expect(await quizPool.getBalance()).to.equal(depositAmount);
        });

        it("Should revert deposit if amount is zero", async function () {
            await expect(
                quizPool.connect(user1).deposit(0)
            ).to.be.revertedWith("QuizPool: Amount must be greater than 0");
        });

        it("Should revert deposit without approval", async function () {
            await expect(
                quizPool.connect(user1).deposit(depositAmount)
            ).to.be.reverted;
        });

        it("Should allow admin to deposit funds", async function () {
            await mockCUSD.connect(admin).approve(await quizPool.getAddress(), depositAmount);

            await expect(quizPool.connect(admin).adminDeposit(depositAmount))
                .to.emit(quizPool, "Deposit")
                .withArgs(admin.address, depositAmount, await time.latest() + 1);
        });

        it("Should revert adminDeposit if not admin", async function () {
            await mockCUSD.connect(user1).approve(await quizPool.getAddress(), depositAmount);

            await expect(
                quizPool.connect(user1).adminDeposit(depositAmount)
            ).to.be.revertedWith("QuizPool: Only admin can call this function");
        });

        it("Should accumulate multiple deposits", async function () {
            await mockCUSD.connect(user1).approve(await quizPool.getAddress(), depositAmount);
            await quizPool.connect(user1).deposit(depositAmount);

            await mockCUSD.connect(user2).approve(await quizPool.getAddress(), depositAmount);
            await quizPool.connect(user2).deposit(depositAmount);

            expect(await quizPool.totalDeposits()).to.equal(depositAmount * 2n);
        });
    });

    describe("Payouts", function () {
        const depositAmount = ethers.parseEther("1000");

        beforeEach(async function () {
            // Admin deposits funds for payout
            await mockCUSD.connect(admin).approve(await quizPool.getAddress(), depositAmount);
            await quizPool.connect(admin).adminDeposit(depositAmount);
        });

        it("Should allow admin to payout winners", async function () {
            const winners = [user1.address, user2.address];
            const amounts = [ethers.parseEther("300"), ethers.parseEther("200")];

            await expect(quizPool.connect(admin).payoutWinners(winners, amounts))
                .to.emit(quizPool, "Payout")
                .and.to.emit(quizPool, "WinnerPaid");

            expect(await mockCUSD.balanceOf(user1.address)).to.equal(
                ethers.parseEther("1000") + amounts[0]
            );
            expect(await mockCUSD.balanceOf(user2.address)).to.equal(
                ethers.parseEther("1000") + amounts[1]
            );
        });

        it("Should update totalPayouts correctly", async function () {
            const winners = [user1.address, user2.address];
            const amounts = [ethers.parseEther("300"), ethers.parseEther("200")];

            await quizPool.connect(admin).payoutWinners(winners, amounts);

            expect(await quizPool.totalPayouts()).to.equal(ethers.parseEther("500"));
        });

        it("Should revert if not admin", async function () {
            const winners = [user1.address];
            const amounts = [ethers.parseEther("100")];

            await expect(
                quizPool.connect(user1).payoutWinners(winners, amounts)
            ).to.be.revertedWith("QuizPool: Only admin can call this function");
        });

        it("Should revert if arrays length mismatch", async function () {
            const winners = [user1.address, user2.address];
            const amounts = [ethers.parseEther("100")];

            await expect(
                quizPool.connect(admin).payoutWinners(winners, amounts)
            ).to.be.revertedWith("QuizPool: Arrays length mismatch");
        });

        it("Should revert if no winners provided", async function () {
            await expect(
                quizPool.connect(admin).payoutWinners([], [])
            ).to.be.revertedWith("QuizPool: No winners provided");
        });

        it("Should revert if insufficient balance", async function () {
            const winners = [user1.address];
            const amounts = [ethers.parseEther("2000")]; // More than deposited

            await expect(
                quizPool.connect(admin).payoutWinners(winners, amounts)
            ).to.be.revertedWith("QuizPool: Insufficient balance");
        });

        it("Should revert if winner address is zero", async function () {
            const winners = [ethers.ZeroAddress];
            const amounts = [ethers.parseEther("100")];

            await expect(
                quizPool.connect(admin).payoutWinners(winners, amounts)
            ).to.be.revertedWith("QuizPool: Invalid winner address");
        });

        it("Should revert if amount is zero", async function () {
            const winners = [user1.address];
            const amounts = [0];

            await expect(
                quizPool.connect(admin).payoutWinners(winners, amounts)
            ).to.be.revertedWith("QuizPool: Invalid amount");
        });

        it("Should handle multiple payouts correctly", async function () {
            // First payout
            await quizPool.connect(admin).payoutWinners(
                [user1.address],
                [ethers.parseEther("300")]
            );

            // Second payout
            await quizPool.connect(admin).payoutWinners(
                [user2.address],
                [ethers.parseEther("200")]
            );

            expect(await quizPool.totalPayouts()).to.equal(ethers.parseEther("500"));
        });
    });

    describe("Emergency Withdraw", function () {
        const depositAmount = ethers.parseEther("500");

        beforeEach(async function () {
            await mockCUSD.connect(admin).approve(await quizPool.getAddress(), depositAmount);
            await quizPool.connect(admin).adminDeposit(depositAmount);
        });

        it("Should allow admin to emergency withdraw", async function () {
            const initialBalance = await mockCUSD.balanceOf(admin.address);

            await expect(quizPool.connect(admin).emergencyWithdraw())
                .to.emit(quizPool, "EmergencyWithdraw")
                .withArgs(admin.address, depositAmount, await time.latest() + 1);

            expect(await mockCUSD.balanceOf(admin.address)).to.equal(
                initialBalance + depositAmount
            );
            expect(await quizPool.getBalance()).to.equal(0);
        });

        it("Should revert if not admin", async function () {
            await expect(
                quizPool.connect(user1).emergencyWithdraw()
            ).to.be.revertedWith("QuizPool: Only admin can call this function");
        });

        it("Should revert if no balance to withdraw", async function () {
            await quizPool.connect(admin).emergencyWithdraw();

            await expect(
                quizPool.connect(admin).emergencyWithdraw()
            ).to.be.revertedWith("QuizPool: No balance to withdraw");
        });
    });

    describe("Admin Transfer", function () {
        it("Should allow admin to transfer ownership", async function () {
            await expect(quizPool.connect(admin).transferAdmin(user1.address))
                .to.emit(quizPool, "OwnerChanged")
                .withArgs(admin.address, user1.address, await time.latest() + 1);

            expect(await quizPool.admin()).to.equal(user1.address);
        });

        it("Should revert if not admin", async function () {
            await expect(
                quizPool.connect(user1).transferAdmin(user2.address)
            ).to.be.revertedWith("QuizPool: Only admin can call this function");
        });

        it("Should revert if new admin is zero address", async function () {
            await expect(
                quizPool.connect(admin).transferAdmin(ethers.ZeroAddress)
            ).to.be.revertedWith("QuizPool: Invalid new admin address");
        });

        it("Should allow new admin to perform admin functions", async function () {
            await quizPool.connect(admin).transferAdmin(user1.address);

            const depositAmount = ethers.parseEther("100");
            await mockCUSD.connect(user1).approve(await quizPool.getAddress(), depositAmount);

            await expect(quizPool.connect(user1).adminDeposit(depositAmount))
                .to.emit(quizPool, "Deposit");
        });
    });

    describe("View Functions", function () {
        it("Should return correct balance", async function () {
            expect(await quizPool.getBalance()).to.equal(0);

            const depositAmount = ethers.parseEther("500");
            await mockCUSD.connect(user1).approve(await quizPool.getAddress(), depositAmount);
            await quizPool.connect(user1).deposit(depositAmount);

            expect(await quizPool.getBalance()).to.equal(depositAmount);
        });

        it("Should return correct pool stats", async function () {
            const depositAmount = ethers.parseEther("1000");
            await mockCUSD.connect(admin).approve(await quizPool.getAddress(), depositAmount);
            await quizPool.connect(admin).adminDeposit(depositAmount);

            const payoutAmount = ethers.parseEther("300");
            await quizPool.connect(admin).payoutWinners([user1.address], [payoutAmount]);

            const [balance, deposits, payouts] = await quizPool.getPoolStats();

            expect(balance).to.equal(depositAmount - payoutAmount);
            expect(deposits).to.equal(depositAmount);
            expect(payouts).to.equal(payoutAmount);
        });
    });
});
