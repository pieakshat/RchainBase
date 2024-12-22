const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

// Replace with your Pinata API credentials
const PINATA_API_KEY = '66075d16f92bcbbfd474';
const PINATA_API_SECRET = '988afc862c9bdfe05618cdeb47b982ed28edc074a2adac66d7a4e7343d6efc2f';
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

async function uploadMetadata() {
    try {
        // Test authentication
        await pinata.testAuthentication();
        console.log('Pinata authentication successful!');

        // Upload images first
        console.log('Uploading images to IPFS...');

        const readFileStream = (filePath) => fs.createReadStream(filePath);

        const bronzeImageResult = await pinata.pinFileToIPFS(readFileStream('./assets/bronze.jpeg'), {
            pinataMetadata: {
                name: 'bronze.jpeg'
            }
        });
        const silverImageResult = await pinata.pinFileToIPFS(readFileStream('./assets/silver.jpeg'), {
            pinataMetadata: {
                name: 'silver.jpeg'
            }
        });
        const goldImageResult = await pinata.pinFileToIPFS(readFileStream('./assets/gold.jpeg'), {
            pinataMetadata: {
                name: 'gold.jpeg'
            }
        });

        console.log('Images uploaded successfully!');
        console.log(`Bronze Image Hash: ${bronzeImageResult.IpfsHash}`);
        console.log(`Silver Image Hash: ${silverImageResult.IpfsHash}`);
        console.log(`Gold Image Hash: ${goldImageResult.IpfsHash}`);

        // Create metadata for each tier
        const metadata = {
            bronze: {
                name: "Rchain Bronze SBT",
                description: "Bronze tier Soulbound Token for Rchain",
                image: `ipfs://${bronzeImageResult.IpfsHash}`,
                attributes: [
                    {
                        trait_type: "Title",
                        value: "Bronze contributor"
                    },
                    {
                        trait_type: "Tier",
                        value: "Bronze"
                    },
                    {
                        trait_type: "message",
                        value: "You're making a difference! Your contribution helps us recycle and repurpose plastic waste."
                    },
                    {
                        trait_type: "message",
                        value: "200 - 1000"
                    }
                ]
            },
            silver: {
                name: "Rchain Silver SBT",
                description: "Silver tier Soulbound Token for Rchain",
                image: `ipfs://${silverImageResult.IpfsHash}`,
                attributes: [
                    {
                        trait_type: "Title",
                        value: "Silver Innovator"
                    },
                    {
                        trait_type: "Tier",
                        value: "Silver"
                    },
                    {
                        trait_type: "message",
                        value: "Your impact is growing! You're a true environmental champion, driving significant change."
                    },
                    {
                        trait_type: "funding range",
                        value: "1000 - 10000"
                    }
                ]
            },
            gold: {
                name: "Rchain Gold SBT",
                description: "Gold tier Soulbound Token for Rchain",
                image: `ipfs://${goldImageResult.IpfsHash}`,
                attributes: [
                    {
                        trait_type: "Title",
                        value: "Gold Visionary"
                    },
                    {
                        trait_type: "Tier",
                        value: "Gold"
                    },
                    {
                        trait_type: "message",
                        value: "Wow! Your contributions are transforming the recycling industry and our planet's future."
                    },
                    {
                        trait_type: "funding range",
                        value: "10000+"
                    }
                ]
            }
        };

        console.log('Uploading metadata to IPFS...');

        // Upload metadata for each tier
        const bronzeMetadataResult = await pinata.pinJSONToIPFS(metadata.bronze);
        const silverMetadataResult = await pinata.pinJSONToIPFS(metadata.silver);
        const goldMetadataResult = await pinata.pinJSONToIPFS(metadata.gold);

        console.log('Metadata uploaded successfully!');
        console.log(`Bronze Metadata Hash: ${bronzeMetadataResult.IpfsHash}`);
        console.log(`Silver Metadata Hash: ${silverMetadataResult.IpfsHash}`);
        console.log(`Gold Metadata Hash: ${goldMetadataResult.IpfsHash}`);

        // Save hashes to a file for reference
        const hashes = {
            images: {
                bronze: bronzeImageResult.IpfsHash,
                silver: silverImageResult.IpfsHash,
                gold: goldImageResult.IpfsHash
            },
            metadata: {
                bronze: bronzeMetadataResult.IpfsHash,
                silver: silverMetadataResult.IpfsHash,
                gold: goldMetadataResult.IpfsHash
            }
        };

        fs.writeFileSync('metadata-hashes.json', JSON.stringify(hashes, null, 2));
        console.log('Hashes saved to metadata-hashes.json');

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

uploadMetadata()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });