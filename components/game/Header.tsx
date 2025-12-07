'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HeaderProps {
  points: number
  streak: number
  level: number
}

export function Header({ points, streak, level }: HeaderProps) {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [showDropdown, setShowDropdown] = useState(false)
  
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const handleConnect = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] })
    }
  }

  return (
    <header className="bg-gradient-to-r from-[#000814] via-[#001528] to-[#000814] border-b border-[#0A5CDD]/30 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A5CDD] to-[#2563EB] flex items-center justify-center shadow-lg shadow-[#0A5CDD]/30">
            <span className="text-xl">⚗️</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Chain Reaction</h1>
            <p className="text-[#0A5CDD] text-[10px] font-medium tracking-wider">LABS</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          {/* Streak */}
          <div className="flex items-center gap-1 bg-[#1F2937]/80 px-2 py-1.5 rounded-lg">
            <span className="text-orange-400 text-sm">🔥</span>
            <span className="text-white text-xs font-bold">{streak}</span>
          </div>
          
          {/* Points */}
          <div className="flex items-center gap-1 bg-[#1F2937]/80 px-2 py-1.5 rounded-lg">
            <span className="text-yellow-400 text-sm">⭐</span>
            <span className="text-white text-xs font-bold">{points.toLocaleString()}</span>
          </div>
          
          {/* Level */}
          <div className="flex items-center gap-1 bg-gradient-to-r from-[#0A5CDD]/20 to-[#2563EB]/20 border border-[#0A5CDD]/50 px-2 py-1.5 rounded-lg">
            <span className="text-sm">🎖️</span>
            <span className="text-[#0A5CDD] text-xs font-bold">Lv.{level}</span>
          </div>

          {/* Wallet */}
          <div className="relative">
            {isConnected && address ? (
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 bg-[#22C55E]/20 border border-[#22C55E]/50 px-2 py-1.5 rounded-lg"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-[#22C55E] text-xs font-medium">{formatAddress(address)}</span>
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-1 bg-[#0A5CDD] px-3 py-1.5 rounded-lg"
              >
                <span className="text-white text-xs font-medium">Connect</span>
              </button>
            )}

            {/* Dropdown */}
            <AnimatePresence>
              {showDropdown && isConnected && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-[#1F2937] border border-[#374151] rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-[#374151]">
                    <p className="text-[#6B7280] text-[10px] uppercase tracking-wider mb-1">Connected Wallet</p>
                    <p className="text-white text-xs font-mono">{address}</p>
                  </div>
                  <div className="p-2">
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <span className="text-[#6B7280] text-xs">Level</span>
                      <span className="text-white text-xs font-bold">🎖️ {level}</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <span className="text-[#6B7280] text-xs">Points</span>
                      <span className="text-white text-xs font-bold">⭐ {points.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      disconnect()
                      setShowDropdown(false)
                    }}
                    className="w-full p-2 text-[#DC2626] text-xs font-medium hover:bg-[#DC2626]/10 border-t border-[#374151]"
                  >
                    Disconnect
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
