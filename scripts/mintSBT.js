const hre = require("hardhat");

async function main() {
    // Contract addresses
    const SBT_CONTRACT_ADDRESS = "0x6A790aa90053f4Bf63f7B8CFdd3FB23D0D9275A5";  // Your deployed contract
    const USDT_ADDRESS = "0xBF05F0d716A82412E2dF4E96E13e285F660d3395";         // USDT contract

    // Get contract instances
    const sbtContract = await hre.ethers.getContractAt("TieredSBT", SBT_CONTRACT_ADDRESS);
    const usdtContract = await hre.ethers.getContractAt("IERC20", USDT_ADDRESS);

    // Amount to send (500 USDT with 6 decimals)
    const amount = hre.ethers.parseUnits("20000", 6);

    console.log("Approving USDT spend...");
    // Approve the SBT contract to spend USDT
    const approveTx = await usdtContract.approve(SBT_CONTRACT_ADDRESS, (2000000 * 10 ** 6).toString());
    await approveTx.wait();
    console.log("Approved USDT spend");

    console.log("Minting SBT...");
    // Mint the SBT
    const mintTx = await sbtContract.mint(amount);
    await mintTx.wait();

    console.log("Successfully minted SBT!");

    // Get the token ID of the minted SBT
    const tokenId = await sbtContract.nextTokenId() - 1n;
    console.log(`Minted token ID: ${tokenId}`);

    // Get the tier of the minted token
    const tier = await sbtContract.tokenTiers(tokenId);
    const tierNames = ["Bronze", "Silver", "Gold"];
    console.log(`Token tier: ${tierNames[tier]}`);
    console.log(`Mint Transaction Hash: ${mintTx.hash}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });