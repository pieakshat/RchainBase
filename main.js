const express = require('express');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = "mongodb+srv://akshat05p:kjkszpj@recyclechain.x2cps.mongodb.net/";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("Connection error:", err));

// MongoDB Schema
const recyclePlantSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
    },
    finalFund: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

const RecyclePlant = mongoose.model("fundapplications", recyclePlantSchema);

// Blockchain Setup
const abiPath = path.join(__dirname, './abi/sbt.json');
const abiJSON = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const abi = abiJSON.abi || abiJSON;

const provider = new ethers.JsonRpcProvider('https://base-sepolia.infura.io/v3/a56ee2f67fa347e296cfeb0528c67f60');
const contractAddress = '0x35b78504bBAdBe7ab6d244725Ec685a7C7402398';
const privateKey = '0xd72b7b085dbc92d0113f9fbfc9af9ba022e8d868dd1c5aa41fc60d864166f33e';
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, abi, wallet);

// Email Configuration
async function sendEmails(toAddresses, txnHash) {
    try {
        if (!Array.isArray(toAddresses) || toAddresses.length === 0) {
            throw new Error("Recipient addresses must be a non-empty array.");
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "a7.akshat7@gmail.com",
                pass: "pmot bknd wxmn rdjk"
            }
        });

        const mailOptions = {
            from: "a7.akshat7@gmail.com",
            to: toAddresses.join(","),
            subject: "About Your New Funding",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Funding Update</h2>
                    <p>The latest round of funding is complete.</p>
                    <p>View your transaction here: 
                        <a href="https://base-sepolia.blockscout.com/tx/${txnHash}">
                            https://base-sepolia.blockscout.com/tx/${txnHash}
                        </a>
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Emails sent: ", info.response);
        return info.response;
    } catch (err) {
        console.error("Error sending emails:", err.message);
        throw err;
    }
}

// Helper function to get recipients from contract
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

// Routes

// Get all recycle plants from MongoDB
app.get("/recycle-plants", async (req, res) => {
    try {
        const plants = await RecyclePlant.find({});
        res.json(plants);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Send emails
app.post("/send-emails", async (req, res) => {
    try {
        const { toAddresses, txnHash } = req.body;

        if (!toAddresses || !txnHash) {
            return res.status(400).json({
                message: "Missing required fields: toAddresses or txnHash."
            });
        }

        const response = await sendEmails(toAddresses, txnHash);
        res.json({
            message: "Emails sent successfully!",
            response
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to send emails",
            error: err.message
        });
    }
});

app.get("/emails", async (req, res) => {
    try {
        // Use projection to only get email fields
        const emails = await RecyclePlant.find({}, { email: 1, _id: 0 });
        // Map the results to get just an array of email strings
        const emailList = emails.map(item => item.email);
        res.json(emailList);
    } catch (err) {
        res.status(500).json({
            message: "Failed to retrieve emails",
            error: err.message
        });
    }
});

// Allocate funds and track transfers
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

        // Automatically send emails to recipients
        const recipientEmails = (await RecyclePlant.find({
            walletAddress: { $in: transfers.map(t => t.recipientAddress) }
        })).map(plant => plant.email);

        if (recipientEmails.length > 0) {
            await sendEmails(recipientEmails, tx.hash);
        }

        res.status(200).send({
            message: 'Funds allocated successfully',
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            transfers: transfers,
            emailsSent: recipientEmails,
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

// Get contract recipients and state
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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});