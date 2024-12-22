const hre = require("hardhat");

async function main() {
    // Sample USDT address (using USDT address on Ethereum mainnet)
    // Replace this with the appropriate address for your target network
    const USDT_ADDRESS = "0xBF05F0d716A82412E2dF4E96E13e285F660d3395";

    // Sample recipients data
    const recipients = [
        {
            wallet: "0x9D0616E0DA062907A0E64c44bD09d0A3DD2e3408", // the owner address 
            fundingLeft: ethers.parseUnits("100000", 6)  // 100,000 USDT (6 decimals)
        },
        {
            wallet: "0x7144b814a473017612Ac9f6Bbd287147e500953F", // the dumb address
            fundingLeft: ethers.parseUnits("200000", 6)  // 200,000 USDT
        },
        {
            wallet: "0x294eeED3dB92Df78460CbF21B1F3E07F138411Ce", // the coimbase address 
            fundingLeft: ethers.parseUnits("300000", 6)  // 300,000 USDT
        }
    ];

    // Other constructor parameters
    const NAME = "Rchain";
    const SYMBOL = "RCH";
    const DISTRIBUTION_INTERVAL = 60; // set to 60 seconds for testing purposes
    const TOTAL_AMOUNT_TO_RAISE = ethers.parseUnits("600000", 6); // 600,000 USDT

    console.log("Deploying TieredSBT contract...");

    const TieredSBT = await hre.ethers.getContractFactory("TieredSBT");
    const sbt = await TieredSBT.deploy(
        NAME,
        SYMBOL,
        USDT_ADDRESS,
        recipients,
        DISTRIBUTION_INTERVAL,
        TOTAL_AMOUNT_TO_RAISE
    );

    await sbt.waitForDeployment();
    const address = await sbt.getAddress();

    console.log(`TieredSBT deployed to: ${address}`);
    console.log("Constructor parameters:");
    console.log(`- Name: ${NAME}`);
    console.log(`- Symbol: ${SYMBOL}`);
    console.log(`- USDT Address: ${USDT_ADDRESS}`);
    console.log(`- Distribution Interval: ${DISTRIBUTION_INTERVAL} seconds`);
    console.log(`- Total Amount to Raise: ${TOTAL_AMOUNT_TO_RAISE.toString()} USDT (in smallest units)`);
    console.log("- Recipients:");
    recipients.forEach((recipient, index) => {
        console.log(`  ${index + 1}. Address: ${recipient.wallet}`);
        console.log(`     Funding Left: ${recipient.fundingLeft.toString()} USDT (in smallest units)`);
    });

    // Verify contract on Etherscan (if not on localhost)
    // if (network.name !== "localhost" && network.name !== "hardhat") {
    //     console.log("Waiting for block confirmations...");
    //     await sbt.waitForDeployment(); // Wait for 6 block confirmations

    //     console.log("Verifying contract...");
    //     await hre.run("verify:verify", {
    //         address: address,
    //         constructorArguments: [
    //             NAME,
    //             SYMBOL,
    //             USDT_ADDRESS,
    //             recipients,
    //             DISTRIBUTION_INTERVAL,
    //             TOTAL_AMOUNT_TO_RAISE
    //         ],
    //     });
    // }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });