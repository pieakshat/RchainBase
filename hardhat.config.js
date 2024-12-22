//import { HardhatUserConfig } from "hardhat/config";
require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");

dotenv.config();

const config = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: "https://base-sepolia.infura.io/v3/a56ee2f67fa347e296cfeb0528c67f60",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 84532
    }
  }
};

module.exports = config;