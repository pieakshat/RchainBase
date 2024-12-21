import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import walletIcon from '../assets/recyclePlantReg/wallet.png';
import digilockerIcon from '../assets/recyclePlantReg/digilocker.png';
import  register  from '../assets/recyclePlantReg/register2.svg';

const RecyclePlant = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [plantName, setPlantName] = useState('');
  const [plasticType, setPlasticType] = useState('PET');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCliIRDkQyrfH8jXl7y0vf1U61duC9yA7w',
  });

  const handleLocationFetch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log(position);
          setLocation(`Lat: ${lat}, Lng: ${lng}`);
        },
        (error) => console.error('Error fetching location:', error),
      );
    } else {
      console.error('Geolocation not supported by this browser.');
    }
  };

  const handleWalletFetch = () => {
    // Placeholder logic for fetching wallet address
    setWalletAddress('0x1234...abcd');
  };

  const handleKYC = () => {
    // Placeholder logic for KYC process
    console.log('KYC initiated');
    navigate('/dashboard');
  };

  return (
    <motion.div
      className="flex h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Left Side: Registration Form */}
      <motion.div
        className="flex flex-col justify-center items-center w-1/2 bg-green-100 p-8"
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold text-green-800 mb-4">Plastic Recycle Plant Registration</h1>
        <p className="text-lg text-green-700 mb-8">Onboard your plant on our platform</p>
        <form className="w-3/4">
          <div className="mb-6">
            <label htmlFor="plantName" className="block text-green-800 mb-2">Recycle Plant Name</label>
            <input
              type="text"
              id="plantName"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-green-300"
              placeholder="Enter plant name"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="location" className="block text-green-800 mb-2">Location</label>
            <div className="flex items-center">
              <input
                type="text"
                id="location"
                value={location}
                className="w-full p-3 border rounded-l focus:outline-none focus:ring focus:ring-green-300"
                placeholder="Fetch location"
              />
              <button
                type="button"
                onClick={handleLocationFetch}
                className="bg-green-600 text-white px-4 py-3 rounded-r hover:bg-green-700 transition"
              >
                Fetch
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="walletAddress" className="block text-green-800 mb-2">Wallet Address</label>
            <div className="flex items-center">
              <input
                type="text"
                id="walletAddress"
                value={walletAddress}
                readOnly
                className="w-full p-3 border rounded-l focus:outline-none focus:ring focus:ring-green-300"
                placeholder="Connect wallet"
              />
              <button
                type="button"
                onClick={handleWalletFetch}
                className="bg-green-600 text-white px-4 py-3 rounded-r hover:bg-green-700 transition"
              >
                <img src={walletIcon} alt="Wallet" className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="plasticType" className="block text-green-800 mb-2">Type of Plastic</label>
            <select
              id="plasticType"
              value={plasticType}
              onChange={(e) => setPlasticType(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-green-300"
            >
              <option value="PET">PET</option>
              <option value="HDPE">HDPE</option>
              <option value="PVC">PVC</option>
              <option value="LDPE">LDPE</option>
              <option value="PP">PP</option>
              <option value="PS">PS</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleKYC}
            className="flex items-center justify-center bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 transition w-full"
          >
            <img src={digilockerIcon} alt="Digilocker" className="w-8 h-7 text-3xl" />
            Register with KYC
          </button>
        </form>
      </motion.div>

      {/* Right Side: Vector Image or Map */}
      <motion.div
              className="w-1/2 bg-green-400 flex items-center justify-center"
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src={register}
                alt="Vector Illustration"
                className='w-3/4'
              />
            </motion.div>
        
    </motion.div>
  );
};

export default RecyclePlant;
