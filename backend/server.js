const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
const groq = new Groq({ apiKey: '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' });

// MongoDB Connection
mongoose.connect('mongodb+srv://akshat05p:kjkszpj@recyclechain.x2cps.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Schema and Model
const RecyclePlantSchema = new mongoose.Schema({
    plantName: String,
    plasticType: String,
    companyEmail: String,
    companyValuation: Number,
    recyclingCapacity: Number,
    expectedRecyclingCapacity: Number,
    plantArea: Number,
    cityName: String,
    stateName: String,
    countryName: String,
    requiredFunding: Number,
    fundingReceived: Number,
    walletAddress: String
  }, { collection: 'recycle_plants' }); // Explicit collection name


  const fundSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true },
    finalFund: { type: Number, required: true },
    description: { type: String, required: true },
    email : {type: String, required: true},
    createdAt: { type: Date, default: Date.now }
    
  });
  
  const RecyclePlant = mongoose.model('recycle_plants', RecyclePlantSchema);
  const FundApplication = mongoose.model('FundApplication', fundSchema);


//   app.post('/finalFund', async (req, res) => {
//     const { walletAddress, finalFund, description, email } = req.body;
  
//     if (!walletAddress || !finalFund || !description || !email) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'All fields (walletAddress, finalFund, description) are required.',
//       });
//     }
  
//     try {
//       // Check if the finalFund amount is reasonable (optional, based on business logic)
//       if (finalFund <= 0) {
//         return res.status(400).json({
//           status: 'error',
//           message: 'Fund amount must be greater than zero.',
//         });
//       }
  
//       // Save the fund application to the database
//       const newApplication = new FundApplication({ walletAddress, finalFund, description, email });
//       await newApplication.save();
  
//       return res.status(200).json({
//         status: 'success',
//         message: 'Fund application submitted successfully.',
//         applicationId: newApplication._id,
//       });
//     } catch (error) {
//       console.error('Error saving fund application:', error);
//       return res.status(500).json({
//         status: 'error',
//         message: 'Internal server error. Please try again later.',
//       });
//     }
//   });

const Joi = require('joi');

const fundValidationSchema = Joi.object({
  walletAddress: Joi.string().required(),
  finalFund: Joi.number().greater(0).required(),
  description: Joi.string().required(),
  email: Joi.string().email().required(),
});


app.get('/companies', async (req, res) => {
    try {
      const companies = await RecyclePlant.find();
      res.json(companies);
    } catch (error) {
      res.status(500).send('Error fetching companies');
    }
  });

app.post('/finalFund', async (req, res) => {
  const { error } = fundValidationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ status: 'error', message: error.details[0].message });
  }

  try {
    const { walletAddress, finalFund, description, email } = req.body;
    const newApplication = new FundApplication({ walletAddress, finalFund, description, email });
    await newApplication.save();

    return res.status(200).json({
      status: 'success',
      message: 'Fund application submitted successfully.',
      applicationId: newApplication._id,
    });
  } catch (err) {
    console.error('Error saving fund application:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});


  

// API Endpoint
app.post('/register-plant', async (req, res) => {
    try {
      const plant = new RecyclePlant(req.body); // Create a new document
      await plant.save(); // Save the document to the database
      
  
      // Include the plant's `_id` in the response
      res.status(200).json({
        message: 'Recycle Plant registered successfully!',
        plantId: plant._id, // Send the MongoDB ObjectId
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to register recycle plant',
        details: error.message,
      });
    }
  });

  app.get('/plants/:id', async (req, res) => {
    try {
      const plant = await RecyclePlant.findById(req.params.id); // Fetch by ObjectId
      if (!plant) {
        return res.status(404).json({ error: 'Plant not found' });
      }
      res.status(200).json(plant);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching plant', details: error.message });
    }
  });
  
  app.post('/estimate-funds', async (req, res) => {
    const { location, areaType, areaInAcres, initialCapacity, targetCapacity, recyclingDemand, recyclingCost } = req.body;
  
    try {
      // Structure the prompt for the LLM
      const prompt = `I have the following parameters for a plastic recycling facility:\nLocation: ${location}\nArea Type: ${areaType}\nArea: ${areaInAcres} acres\nInitial Capacity: ${initialCapacity} kg/day\nTarget Capacity: ${targetCapacity} kg/day\nRecycling Plastic Demand: ${recyclingDemand}\nRecycling Cost per kg: ${recyclingCost}\nCan you estimate the required funds in dollars? Please provide only the amount in dollars.`;
  
      // Call Groq's chat completion API
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful assistant trained to estimate the required funds for a plastic recycling facility. Provide only the amount in dollars.only provide single amount no extra text in response." },
          { role: "user", content: prompt }
        ],
        model: "gemma2-9b-it", // Use the model you want to query
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      });
  
      // Get the response content, which should be the dollar amount
      const responseContent = chatCompletion.choices[0]?.message?.content.trim() || 'Unable to generate response.';
      
      // Send the response with only the required amount
      res.json({ estimatedFunds: responseContent });
    } catch (error) {
      console.error("Error generating response:", error);
      res.status(500).json({ error: 'Failed to generate response from model' });
    }
  });


// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
