'use client'
// @ts-ignore
import { createPublicClient, http } from 'view'
// @ts-ignore
import { mainnet } from 'viem/chains'
import { createContext, useContext, useEffect, useState } from 'react'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

interface WalletContextType {
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  connect: async () => {},
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)

  const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        setAddress(accounts[0])
      } catch (err) {
        console.error('Failed to connect:', err)
      }
    } else {
      alert('Please install MetaMask!')
    }
  }

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAddress(accounts[0] || null)
      })
    }
  }, [])

  return (
    <WalletContext.Provider value={{
      address,
      isConnected: !!address,
      connect
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)

