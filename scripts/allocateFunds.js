const hre = require("hardhat");

async function main() {
    try {
        // Get the contract instance
        const contractAddress = "0x35b78504bBAdBe7ab6d244725Ec685a7C7402398"; // Replace with your deployed contract address
        const contract = await hre.ethers.getContractAt("TieredSBT", contractAddress);

        console.log("Starting fund allocation process...");

        // Call the callAllocateFunds function
        const tx = await contract.callAllocateFunds();

        // Wait for the transaction to be mined
        console.log("Transaction sent. Waiting for confirmation...");
        const receipt = await tx.wait();

        console.log("\nFunds allocated successfully!");
        console.log("Transaction hash:", receipt.hash);
        console.log("Gas used:", receipt.gasUsed.toString());

        // Get updated balances for recipients
        console.log("\nUpdated recipient information:");
        let index = 0;
        while (true) {
            try {
                const recipient = await contract.recipients(index);
                console.log(`\nRecipient ${index + 1}:`);
                console.log(`  Address: ${recipient.wallet}`);
                console.log(`  Funding Left: ${hre.ethers.formatUnits(recipient.fundingLeft, 6)} USDT`);
                index++;
            } catch (error) {
                break;
            }
        }

        // Get total amount left to raise
        const totalLeft = await contract.totalAmountLeftToRaise();
        console.log(`\nTotal amount left to raise: ${hre.ethers.formatUnits(totalLeft, 6)} USDT`);

        // Get last distribution time
        const lastDistributionTime = await contract.lastDistributionTime();
        const lastDistributionDate = new Date(Number(lastDistributionTime) * 1000);
        console.log(`Last distribution time: ${lastDistributionDate.toLocaleString()}`);

    } catch (error) {
        if (error.message.includes("distribution interval not reached")) {
            console.error("\nError: Distribution interval has not been reached yet.");

            // Get distribution interval and last distribution time to show when next distribution is possible
            const distributionInterval = await contract.distributionInterval();
            const lastDistributionTime = await contract.lastDistributionTime();
            const nextDistributionTime = new Date((Number(lastDistributionTime) + Number(distributionInterval)) * 1000);

            console.log(`Next distribution possible after: ${nextDistributionTime.toLocaleString()}`);
        } else if (error.message.includes("no recipients added")) {
            console.error("\nError: No recipients have been added to the contract.");
        } else {
            console.error("\nError allocating funds:", error);
        }
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

//module.exports = { allocateFunds }; 