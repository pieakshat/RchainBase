import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import walletIcon from '../assets/recyclePlantReg/wallet.png';
import digilockerIcon from '../assets/recyclePlantReg/digilocker.png';
import  register  from '../assets/recyclePlantReg/register2.svg';
import { Mongoose } from 'mongoose';
// import { Mongo } from 'mongodb';

// const MongoClient = Mongo.MongoClient;




const RecyclePlant = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  
  const [walletAddress, setWalletAddress] = useState('');
  const [plantName, setPlantName] = useState('');
  const [plasticType, setPlasticType] = useState('PET');
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyValuation, setCompanyValuation] = useState("");
  const [recyclingCapacity, setRecyclingCapacity] = useState("");
  const [expectedRecyclingCapacity, setExpectedRecyclingCapacity] = useState("");
  const [plantArea , setPlantArea] = useState(0);
  const [cityName, setCityName] = useState("");
  const [stateName, setStateName] = useState("");
  const [countryName, setCountryName] = useState("");

  

 

  

  




  

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCliIRDkQyrfH8jXl7y0vf1U61duC9yA7w',
  });
  

  const handleLocationFetch = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
  
          try {
            // Fetch the reverse geocoded address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
  
            if (!response.ok) {
              throw new Error("Failed to fetch address");
            }
  
            const data = await response.json();
  
            console.log(data);
            // Extract relevant address details
            const { address } = data;
  
            // Format the address
            const formattedAddress = `
              ${address.amenity || ""}, ${address.road || ""}, ${address.neighbourhood || ""}, 
              ${address.village || address.city || ""}, ${address.state_district || address.state || ""}, 
              ${address.country || ""} (${address.postcode || ""})
            `.replace(/\s+/g, " ").trim(); // Clean up extra spaces
            setCityName(address.city);
            setStateName(address.state);
            setCountryName(address.country);

          
            let area = (parseFloat(data.boundingbox[1]) - parseFloat(data.boundingbox[0])) * (parseFloat(data.boundingbox[3]) - parseFloat(data.boundingbox[2]));
            // area in square acre
            area = area * 247.105;

            
            setPlantArea(area);


  
            // Set the formatted address
            setLocation(formattedAddress);

            console.log("City Name: ", cityName);
            console.log("State Name: ", stateName);
            console.log("Country Name: ", countryName);
            console.log("Plant Area: ", plantArea);

          } catch (error) {
            console.error("Error fetching address:", error);
            setLocation("Unable to fetch address");
          }
        },
        (error) => {
          console.error("Error fetching location:", error);
          setLocation("Error fetching location");
        }
      );
    } else {
      console.error("Geolocation not supported by this browser.");
      setLocation("Geolocation not supported by this browser.");
    }
  };
  

  const handleWalletFetch = async () => {
    if (window.ethereum) {
      try {
        // Request wallet connection
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Set the first account as the wallet address
        setWalletAddress(accounts[0]);
        console.log('Connected Wallet Address:', accounts[0]);
      } catch (error) {
        console.error('Error fetching wallet:', error.message);
      }
    } else {
      console.error('MetaMask is not installed. Please install it to connect your wallet.');
      alert('MetaMask is not installed. Please install it to connect your wallet.');
    }
  };
  
  const requiredFunding = 0;
  const fundingReceived = 0;

  const handleKYC = async () => {
    const data = {
      plantName,
      plasticType,
      companyEmail,
      companyValuation,
      recyclingCapacity,
      expectedRecyclingCapacity,
      plantArea,
      cityName,
      stateName,
      countryName,  
      walletAddress,
      requiredFunding,
      fundingReceived
    };
  
    try {
      const response = await fetch('http://localhost:5000/register-plant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),

      });

      console.log("Data: ", data);
  
      if (response.ok) {
        const result = await response.json();
        console.log('Success:', result.message);
        alert('Plant registered successfully!');
        navigate(`/PlantDashboard?plantId=${result.plantId}`);
      } else {
        console.error('Failed to register plant');
        alert('Failed to register plant.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while registering the plant.');
    }
  };
  

  return (
    <motion.div
      className="flex h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="flex flex-col justify-center items-center w-1/2 bg-green-100 p-8"
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold text-green-800 mb-4">Plastic Recycle Plant Registration</h1>
        <p className="text-lg text-green-700 mb-8">🍀 Onboard your 🏭 on our platform 🍀</p>
        <form className="w-3/4 space-y-4">
          <input
            type="text"
            value={plantName}
            onChange={(e) => setPlantName(e.target.value)}
            className="w-full p-3 border rounded-md shadow-sm focus:ring focus:ring-green-300"
            placeholder="Plant Name"
          />
          <input
            type="email"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            className="w-full p-3 border rounded-md shadow-sm focus:ring focus:ring-green-300"
            placeholder="Company Email"
          />
          <input
            type="number"
            value={companyValuation}
            onChange={(e) => setCompanyValuation(e.target.value)}
            className="w-full p-3 border rounded-md shadow-sm focus:ring focus:ring-green-300"
            placeholder="Company Valuation (in Cr)"
          />
          <input
            type="number"
            value={recyclingCapacity}
            onChange={(e) => setRecyclingCapacity(e.target.value)}
            className="w-full p-3 border rounded-md shadow-sm focus:ring focus:ring-green-300"
            placeholder="Recycling Capacity (tons/year)"
          />
          <input
            type="number"
            value={expectedRecyclingCapacity}
            onChange={(e) => setExpectedRecyclingCapacity(e.target.value)}
            className="w-full p-3 border rounded-md shadow-sm focus:ring focus:ring-green-300"
            placeholder="Expected Capacity After Expansion (tons/year)"
          />
          <div className="flex">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 border rounded-l-md shadow-sm focus:ring focus:ring-green-300"
              placeholder="Location"
            />
            <button
              type="button"
              onClick={handleLocationFetch}
              className="px-4 bg-green-600 text-white rounded-r-md"
            >
              Fetch
            </button>
          </div>
          <div className="flex">
            <input
              type="text"
              value={walletAddress}
              readOnly
              className="w-full p-3 border rounded-l-md shadow-sm focus:ring focus:ring-green-300"
              placeholder="Wallet Address"
            />
            <button
              type="button"
              onClick={handleWalletFetch}
              className="px-4 bg-green-600 text-white rounded-r-md"
            >
              <img src={walletIcon} alt="Wallet" className="w-6" />
            </button>
          </div>
          <select
            value={plasticType}
            onChange={(e) => setPlasticType(e.target.value)}
            className="w-full p-3 border rounded-md shadow-sm focus:ring focus:ring-green-300"
          >
            <option value="PET">PET</option>
            <option value="HDPE">HDPE</option>
            <option value="PVC">PVC</option>
            <option value="LDPE">LDPE</option>
            <option value="PP">PP</option>
            <option value="PS">PS</option>
            <option value="Other">Other</option>
          </select>
          <button
            type="button"
            onClick={handleKYC}
            className="flex items-center justify-center bg-green-600 text-white p-2 w-56 rounded-md hover:bg-green-700 transition"
          >
            <img src={digilockerIcon} alt="Digilocker" className="w-10 h-10" />
            Register with KYC
          </button>
        </form>
      </motion.div>
      <motion.div
        className="w-1/2 flex items-center justify-center bg-green-300"
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img src={register} alt="Illustration" className="w-3/4" />
      </motion.div>
    </motion.div>
  );
};

export default RecyclePlant;
