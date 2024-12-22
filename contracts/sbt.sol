// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Tiered Soulbound Token (SBT) Minting Contract
/// @dev Non-transferable ERC721-compliant tokens with tiered minting based on USDT payment
contract TieredSBT is ERC721URIStorage, Ownable {
    using Strings for uint256;

    struct Recipient {
        address wallet;
        uint256 fundingLeft;
    }

    IERC20 public usdtToken;
    uint256 public nextTokenId;
    uint256 public constant DISTRIBUTION_PERCENTAGE = 70; 
    Recipient[] public recipients;   // list of the struct 
    uint256 public lastDistributionTime; 
    uint256 public distributionInterval; 
    uint256 public totalAmountLeftToRaise; 
    bool public emergencyStop;  // New emergency stop flag

    enum Tier { Bronze, Silver, Gold }
    mapping(uint256 => Tier) public tokenTiers;

    event SBTMinted(address indexed to, uint256 indexed tokenId, Tier tier);
    event RecipientRemoved(address indexed recipientAddress, uint256 remainingFunding);
    event EmergencyWithdrawal(address indexed to, uint256 amount);

    constructor(
        string memory name, 
        string memory symbol,
        address usdtAddress, 
        Recipient[] memory addresses,
        uint256 _distributionInterval, 
        uint256 _totalAmountToRaise
    ) ERC721(name, symbol) Ownable(msg.sender) {
        usdtToken = IERC20(usdtAddress);            
        for(uint i = 0; i < addresses.length; i++) {
            recipients.push(addresses[i]);
        }     
        nextTokenId = 1;
        distributionInterval = _distributionInterval; 
        lastDistributionTime = block.timestamp; 
        totalAmountLeftToRaise = _totalAmountToRaise; 
        emergencyStop = false;
    }

    /// @notice Remove a recipient from the list
    /// @param recipientAddress The address of the recipient to remove
    /// @return success Whether the removal was successful
    function removeRecipient(address recipientAddress) external onlyOwner returns (bool success) {
        for (uint i = 0; i < recipients.length; i++) {
            if (recipients[i].wallet == recipientAddress) {
                // Update totalAmountLeftToRaise
                totalAmountLeftToRaise -= recipients[i].fundingLeft;
                
                // Emit event before removal
                emit RecipientRemoved(recipientAddress, recipients[i].fundingLeft);
                
                // Remove recipient by shifting array
                for (uint j = i; j < recipients.length - 1; j++) {
                    recipients[j] = recipients[j + 1];
                }
                recipients.pop();
                return true;
            }
        }
        return false;
    }

    /// @notice Emergency withdrawal of all funds
    /// @param to Address to send the funds to
    function emergencyWithdraw(address to) external onlyOwner {
        require(!emergencyStop, "Emergency withdrawal already executed");
        
        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        
        // Set emergency stop
        emergencyStop = true;
        
        // Transfer all USDT
        require(usdtToken.transfer(to, balance), "Emergency withdrawal failed");
        
        emit EmergencyWithdrawal(to, balance);
    }

    /// @notice Mint a new SBT based on USDT payment
    /// @param amount The amount of USDT paid
    function mint(uint256 amount) external {
        require(!emergencyStop, "Contract is in emergency stop mode");
        require(amount >= 200 * 10 ** 6, "Minimum payment is 200 USDT");

        // Determine the tier
        Tier tier;
        if (amount < 1000 * 10 ** 6) {
            tier = Tier.Bronze;
        } else if (amount < 10000 * 10 ** 6) {
            tier = Tier.Silver;
        } else {
            tier = Tier.Gold;
        }

        // Transfer USDT
        require(usdtToken.transferFrom(msg.sender, address(this), amount), "USDT transfer failed");

        // Mint the token
        uint256 tokenId = nextTokenId;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _generateTokenURI(tier));
        tokenTiers[tokenId] = tier;

        emit SBTMinted(msg.sender, tokenId, tier);

        nextTokenId++;
    }

    function _generateTokenURI(Tier tier) internal pure returns (string memory) {
        if (tier == Tier.Bronze) {
            return "ipfs:/Qme5vYKuzvywB32i7S2iaXkvH2XidfH6TDrqfJQWsGh4eK";
        } else if (tier == Tier.Silver) {
            return "ipfs://QmQnwENQsMUhv7zKrRtKz3o8iH2tPJb8DfpiqeZ5SyrhS2";
        } else {
            return "ipfs://QmVTkg5q66Gsta2VePGJomNGuSQmrVc4j1pn8FFq6VYhmb";
        }
    }

    function withdrawUSDT(address to, uint256 amount) external onlyOwner {
        require(!emergencyStop, "Contract is in emergency stop mode");
        require(usdtToken.transfer(to, amount), "USDT transfer failed");
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal {
        require(from == address(0) || to == address(0), "SBTs are non-transferable");
    }

    function callAllocateFunds() public onlyOwner {
        require(!emergencyStop, "Contract is in emergency stop mode");
        allocateFunds();
    }

    function allocateFunds() private {
        require(block.timestamp >= lastDistributionTime + distributionInterval, "distribution interval not reached");
        require(recipients.length > 0, "no recipients added");

        uint256 poolBalance = usdtToken.balanceOf(address(this)); 
        uint256 distributionAmount = (poolBalance * DISTRIBUTION_PERCENTAGE) / 100; 

        for (uint i = 0; i < recipients.length; i++) {
            uint256 recipientShare = (distributionAmount * recipients[i].fundingLeft) / totalAmountLeftToRaise; 
            require(usdtToken.transfer(recipients[i].wallet, recipientShare), "transfer failed");
            recipients[i].fundingLeft -= recipientShare; 
        }

        lastDistributionTime = block.timestamp; 
        totalAmountLeftToRaise -= distributionAmount; 
    }
}