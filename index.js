const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://akshat05p:kjkszpj@recyclechain.x2cps.mongodb.net/";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("Connection error:", err));

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

app.get("/recycle-plants", async (req, res) => {
    try {
        const plants = await RecyclePlant.find({});
        res.json(plants);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));