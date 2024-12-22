const hre = require("hardhat");

async function main() {
    // Get the contract factory
    const CustomToken = await hre.ethers.getContractFactory("CustomToken");

    // Get the deployer's address
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy the contract with constructor arguments
    const token = await CustomToken.deploy(
        "us dollar", // name
        "USDC",            // symbol
        deployer.address  // initialOwner
    );

    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();

    console.log("Token deployed to:", tokenAddress);
    console.log("Token name:", await token.name());
    console.log("Token symbol:", await token.symbol());
    console.log("Token decimals:", await token.decimals());
}

// Handle errors
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 