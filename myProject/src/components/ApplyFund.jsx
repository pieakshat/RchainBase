import React, { useState, useEffect } from 'react';

const ApplyFund = () => {
  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estimatedFund, setEstimatedFund] = useState(0);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  

  const plantId = new URLSearchParams(window.location.search).get('plantId');

  const fetchPlantData = async () => {
    if (!plantId) {
      setError('No plantId provided in the query parameters.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/plants/${plantId}`);
      if (!response.ok) {
        throw new Error(`Error fetching plant data: ${response.statusText}`);
      }
      const data = await response.json();
      setPlantData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreaType = async (location) => {
    try {
      const response = await fetch(`https://api.location-service.com/area-type?location=${location}`); // Replace with real API
      if (!response.ok) {
        throw new Error('Failed to fetch area type');
      }
      const { areaType } = await response.json();
      return areaType; // "developed", "developing", or "underdeveloped"
    } catch (error) {
      console.error('Error determining area type:', error);
      return 'unknown';
    }
  };

  const estimateFunds = async () => {
    if (!plantData) {
      setError('Plant data is unavailable.');
      return;
    }

    const area = "developed"; // Replace with determined area type if needed


    try {
      const response = await fetch('http://localhost:5000/estimate-funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: plantData.cityName,
          areaType: area, // Replace with determined area type if needed
          areaInAcres: plantData.areaInAcres,
          initialCapacity: plantData.initialCapacity,
          targetCapacity: plantData.targetCapacity,
          recyclingDemand: plantData.recyclingDemand,
          recyclingCost: plantData.recyclingCost,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to estimate funds');
      }

      const { estimatedFunds } = await response.json();
      setEstimatedFund(estimatedFunds);
      console.log('Estimated Funds:', estimatedFunds);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plantData || !estimatedFund) {
      setError('Plant data or estimated fund is unavailable.');
      return;
    }

    console.log(typeof(parseInt(amount,10)));
    console.log(typeof(parseInt(estimatedFund,10)));

    console.log(parseInt(amount,10));
    console.log(parseInt(estimatedFund,10));

    if (parseInt(amount,10) > parseInt(estimatedFund.replace(/,/g, ''), 10)) {
      setError('Entered amount is significantly higher than the estimated funds.');
      return;
    }

    console.log(plantData.companyEmail);

    try {
      const response = await fetch('http://localhost:5000/finalFund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: plantData.walletAddress,
          finalFund: amount,
          email: plantData.companyEmail,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to apply for funds');
      }

      setSuccessMessage('Application submitted successfully!');
      setAmount('');
      setDescription('');
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchPlantData();
  }, [plantId]);

  useEffect(() => {
    if (plantData) {
      estimateFunds();
      
    }
  }, [plantData]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Apply for Funds</h1>
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-md rounded-lg p-6">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount (USD)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="mt-1 p-2 border rounded w-full focus:ring focus:ring-green-300 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 p-2 border rounded w-full focus:ring focus:ring-green-300 focus:outline-none"
            rows={4}
          ></textarea>
        </div>
        <p>
          <strong>Estimated Funds:</strong> {estimatedFund ? `$${estimatedFund}` : 'Calculating...'}
        </p>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:ring focus:ring-green-300 focus:outline-none"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default ApplyFund;
  