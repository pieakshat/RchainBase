const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function coordinateFundingAndNotifications() {
    try {
        // Step 1: Allocate funds
        console.log('Initiating fund allocation...');
        const allocationResponse = await axios.post(`${BASE_URL}/allocate-funds`);
        const transactionHash = allocationResponse.data.transactionHash;
        console.log('Funds allocated successfully. Transaction hash:', transactionHash);

        // Step 2: Get all recipient emails
        console.log('Fetching recipient emails...');
        const emailsResponse = await axios.get(`${BASE_URL}/emails`);
        const recipientEmails = emailsResponse.data;
        console.log(`Found ${recipientEmails.length} recipient emails`);

        // Step 3: Send notification emails to all recipients
        console.log('Sending notification emails...');
        const emailNotificationResponse = await axios.post(`${BASE_URL}/send-emails`, {
            toAddresses: recipientEmails,
            txnHash: transactionHash
        });
        console.log('Email notifications sent successfully');

        // Return the complete results
        return {
            allocation: allocationResponse.data,
            recipientCount: recipientEmails.length,
            emailNotification: emailNotificationResponse.data
        };
    } catch (error) {
        console.error('Error in funding allocation process:', error.message);
        if (error.response) {
            console.error('Server response:', error.response.data);
        }
        throw error;
    }
}

// Execute the coordination
console.log('Starting funding allocation and notification process...');
coordinateFundingAndNotifications()
    .then(results => {
        console.log('Complete process finished successfully');
        console.log('Results:', JSON.stringify(results, null, 2));
    })
    .catch(error => {
        console.error('Process failed:', error.message);
        process.exit(1);
    });