const express = require('express');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3000;

const uri = "mongodb+srv://akshat05p:kjkszpj@recyclechain.x2cps.mongodb.net/";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("Connection error:", err));

// Load ABI from file
const abiPath = path.join(__dirname, './abi/sbt.json');
const abiJSON = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const abi = abiJSON.abi || abiJSON;

// Contract setup
const provider = new ethers.JsonRpcProvider('https://base-sepolia.infura.io/v3/a56ee2f67fa347e296cfeb0528c67f60');
const contractAddress = '0x35b78504bBAdBe7ab6d244725Ec685a7C7402398';
const privateKey = '0xd72b7b085dbc92d0113f9fbfc9af9ba022e8d868dd1c5aa41fc60d864166f33e';    // test wallet
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, abi, wallet);

app.use(express.json());

// Endpoint to call allocateFunds and track transfers
app.post('/allocate-funds', async (req, res) => {
    try {
        // Get initial state
        const initialBalances = await Promise.all(
            (await getRecipients()).map(async (recipient) => ({
                address: recipient.wallet,
                initialFunding: recipient.fundingLeft
            }))
        );

        // Call the allocateFunds function
        const tx = await contract.callAllocateFunds();
        console.log('Transaction sent:', tx.hash);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log('Transaction successful:', receipt);

        // Get final state
        const finalBalances = await Promise.all(
            (await getRecipients()).map(async (recipient) => ({
                address: recipient.wallet,
                finalFunding: recipient.fundingLeft
            }))
        );

        // Calculate transfers
        const transfers = initialBalances.map((initial, index) => {
            const final = finalBalances[index];
            return {
                recipientAddress: initial.address,
                fundingBefore: initial.initialFunding.toString(),
                fundingAfter: final.finalFunding.toString(),
                amountTransferred: (BigInt(initial.initialFunding) - BigInt(final.finalFunding)).toString()
            };
        });

        // Get contract state
        const [poolBalance, totalAmountLeftToRaise, lastDistributionTime] = await Promise.all([
            contract.usdtToken().then(usdtAddress => {
                const usdtContract = new ethers.Contract(
                    usdtAddress,
                    ['function balanceOf(address) view returns (uint256)'],
                    provider
                );
                return usdtContract.balanceOf(contractAddress);
            }),
            contract.totalAmountLeftToRaise(),
            contract.lastDistributionTime()
        ]);

        res.status(200).send({
            message: 'Funds allocated successfully',
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            transfers: transfers,
            contractState: {
                poolBalance: poolBalance.toString(),
                totalAmountLeftToRaise: totalAmountLeftToRaise.toString(),
                lastDistributionTime: lastDistributionTime.toString(),
                lastDistributionTimeFormatted: new Date(Number(lastDistributionTime) * 1000).toISOString()
            }
        });
    } catch (error) {
        console.error('Error allocating funds:', error);
        res.status(500).send({
            message: 'Error allocating funds',
            error: error.message
        });
    }
});

// Helper function to get recipients
async function getRecipients() {
    const recipients = [];
    let i = 0;

    while (true) {
        try {
            const recipient = await contract.recipients(i);
            recipients.push({
                wallet: recipient.wallet,
                fundingLeft: recipient.fundingLeft
            });
            i++;
        } catch (error) {
            break;
        }
    }

    return recipients;
}

// Endpoint to get all recipients and their funding status
app.get('/recipients', async (req, res) => {
    try {
        const recipients = await getRecipients();

        // Get USDT contract instance
        const usdtAddress = await contract.usdtToken();
        const usdtContract = new ethers.Contract(
            usdtAddress,
            ['function balanceOf(address) view returns (uint256)'],
            provider
        );

        // Get contract state
        const [poolBalance, totalAmountLeftToRaise, lastDistributionTime, distributionInterval] = await Promise.all([
            usdtContract.balanceOf(contractAddress),
            contract.totalAmountLeftToRaise(),
            contract.lastDistributionTime(),
            contract.distributionInterval()
        ]);

        const nextDistributionTime = Number(lastDistributionTime) + Number(distributionInterval);

        res.status(200).send({
            recipients: recipients.map(r => ({
                address: r.wallet,
                fundingLeft: r.fundingLeft.toString()
            })),
            contractState: {
                poolBalance: poolBalance.toString(),
                totalAmountLeftToRaise: totalAmountLeftToRaise.toString(),
                lastDistributionTime: lastDistributionTime.toString(),
                lastDistributionTimeFormatted: new Date(Number(lastDistributionTime) * 1000).toISOString(),
                nextDistributionTime: nextDistributionTime.toString(),
                nextDistributionTimeFormatted: new Date(nextDistributionTime * 1000).toISOString(),
                distributionInterval: distributionInterval.toString()
            }
        });
    } catch (error) {
        console.error('Error getting recipients:', error);
        res.status(500).send({
            message: 'Error getting recipients',
            error: error.message
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});