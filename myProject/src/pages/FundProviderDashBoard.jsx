'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaLeaf } from 'react-icons/fa'
import ConnectWalletButton from '../components/ConnectWalletButton'
import FundingForm from '../components/FundingForm'
import SBTCards from '../components/SBTCards'
import PreviousFunds from '../components/PreviousFunds'
import TrustBuildingSection from '../components/TrustBuildingSection'

const FundProviderDashboard = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [totalFunded, setTotalFunded] = useState(0)

  const handleConnect = () => {
    // Implement actual wallet connection logic here
    setIsConnected(true)
  }

  const handleFund = (amount) => {
    setTotalFunded(prev => prev + amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 text-white">
      <header className="bg-green-800 shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaLeaf className="text-3xl text-green-400" />
            <h1 className="text-3xl font-bold">EcoFund Dashboard</h1>
          </div>
          <ConnectWalletButton onConnect={handleConnect} isConnected={isConnected} />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isConnected ? (
            <>
              <FundingForm onFund={handleFund} />
              <TrustBuildingSection />
              <SBTCards />
              <PreviousFunds />
            </>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-4xl font-bold mb-4">Welcome to EcoFund</h2>
              <p className="text-xl mb-8">Connect your wallet to start making a difference!</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

export default FundProviderDashboard

