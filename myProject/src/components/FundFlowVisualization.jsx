import React from 'react'
import { motion } from 'framer-motion'
import { FaArrowRight, FaRecycle, FaTree } from 'react-icons/fa'

const FundFlowVisualization = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white text-gray-800 p-6 rounded-lg shadow-md mb-8"
    >
      <h2 className="text-2xl font-bold mb-4">Fund Flow Visualization</h2>
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-blue-100 p-4 rounded-lg text-center"
        >
          <h3 className="font-bold mb-2">Fund Provider</h3>
          <p>Contributes funds</p>
        </motion.div>
        <FaArrowRight className="text-2xl text-green-600" />
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-green-100 p-4 rounded-lg text-center"
        >
          <h3 className="font-bold mb-2">Recycling Plant</h3>
          <p>Receives funds</p>
          <FaRecycle className="text-4xl text-green-600 mx-auto mt-2" />
        </motion.div>
        <FaArrowRight className="text-2xl text-green-600" />
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-yellow-100 p-4 rounded-lg text-center"
        >
          <h3 className="font-bold mb-2">Environmental Impact</h3>
          <p>Reduced plastic waste</p>
          <FaTree className="text-4xl text-green-600 mx-auto mt-2" />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default FundFlowVisualization

