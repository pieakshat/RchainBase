// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CustomToken is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        mint(msg.sender, 2000000 * 10**6);
        mint(0x7144b814a473017612Ac9f6Bbd287147e500953F, 2000000 * 10**6);
        mint(0x7144b814a473017612Ac9f6Bbd287147e500953F, 2000000 * 10**6);
        mint(0x294eeED3dB92Df78460CbF21B1F3E07F138411Ce, 2000000 * 10**6);
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Example: To mint 1 token, call mint with amount = 1000000 (1 * 10^6)
}