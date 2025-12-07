'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState } from 'react'

interface HeaderProps {
  points: number
  streak: number
  level: number
  username?: string
  pfpUrl?: string
}

export function Header({ points, streak, level, username, pfpUrl }: HeaderProps) {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [showDropdown, setShowDropdown] = useState(false)

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const handleConnect = () => {
    const connector = connectors[0]
    if (connector) {
      connect({ connector })
    }
  }

  return (
    <header className="bg-[#000814] border-b border-[#0A5CDD]/20 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left - Logo/Title */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚗️</span>
          <span className="text-white font-bold text-lg hidden sm:block">Chain Reaction</span>
        </div>

        {/* Center - Stats (only show when connected) */}
        {isConnected && (
          <div className="flex items-center gap-3">
            {/* Streak */}
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-[#F59E0B]/20 px-2.5 py-1 rounded-lg">
                <span className="text-sm">🔥</span>
                <span className="text-[#F59E0B] font-bold text-sm">{streak}</span>
              </div>
            )}
            
            {/* Points */}
            <div className="flex items-center gap-1 bg-[#0A5CDD]/20 px-2.5 py-1 rounded-lg">
              <span className="text-sm">⚡</span>
              <span className="text-[#0A5CDD] font-bold text-sm">{points.toLocaleString()}</span>
            </div>
            
            {/* Level */}
            <div className="flex items-center gap-1 bg-[#22C55E]/20 px-2.5 py-1 rounded-lg">
              <span className="text-[#22C55E] font-bold text-sm">Lv.{level}</span>
            </div>
          </div>
        )}

        {/* Right - Profile or Connect */}
        {isConnected ? (
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 bg-[#001226] border border-[#0A5CDD]/30 rounded-xl px-3 py-1.5 hover:border-[#0A5CDD] transition-colors"
            >
              {/* Avatar */}
              {pfpUrl ? (
                <img src={pfpUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0A5CDD] to-[#22C55E] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {username?.[0]?.toUpperCase() || address?.slice(2, 4).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Name/Address */}
              <span className="text-white text-sm font-medium hidden sm:block">
                {username || truncateAddress(address!)}
              </span>
              
              <span className="text-[#6B7280] text-xs">▼</span>
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#001226] border border-[#0A5CDD]/30 rounded-xl overflow-hidden z-50 shadow-xl">
                  <div className="p-3 border-b border-[#0A5CDD]/20">
                    <p className="text-[#6B7280] text-xs">Connected as</p>
                    <p className="text-white text-sm font-mono truncate">{truncateAddress(address!)}</p>
                  </div>
                  <button
                    onClick={() => { disconnect(); setShowDropdown(false) }}
                    className="w-full px-3 py-2.5 text-left text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors flex items-center gap-2"
                  >
                    <span>🔌</span>
                    <span className="text-sm font-medium">Disconnect</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Connect Button - Show when not connected */
          <button
            onClick={handleConnect}
            className="flex items-center gap-2 bg-gradient-to-r from-[#0A5CDD] to-[#2563EB] text-white px-4 py-2 rounded-xl font-medium text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#0A5CDD]/20"
          >
            <span>🔗</span>
            <span>Connect</span>
          </button>
        )}
      </div>
    </header>
  )
}
