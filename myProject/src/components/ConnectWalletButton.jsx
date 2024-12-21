import React from 'react'
import { FaWallet } from 'react-icons/fa'

// interface ConnectWalletButtonProps {
//   onConnect: () => void
//   isConnected: boolean
// }

const ConnectWalletButton = ({ onConnect, isConnected }) => {
  return (
    <button
      onClick={onConnect}
      className={`px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 flex items-center justify-center ${
        isConnected ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
      }`}
    >
      <FaWallet className="mr-2" />
      {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
    </button>
  )
}

export default ConnectWalletButton

