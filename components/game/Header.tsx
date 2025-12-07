'use client'

import { useAccount } from 'wagmi'

interface HeaderProps {
  points: number
  streak: number
  level: number
  username?: string
  pfpUrl?: string
}

export function Header({ points, streak, level, username, pfpUrl }: HeaderProps) {
  const { address, isConnected } = useAccount()

  return (
    <header className="bg-[#001226] border-b border-[#0A5CDD]/20 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo + Name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#0A5CDD] to-[#2563EB] rounded-lg flex items-center justify-center">
            <span className="text-lg">⚛️</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Chain Reaction</p>
            <p className="text-[#6B7280] text-xs leading-tight">Labs</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#0A0A0A] px-2 py-1 rounded-lg">
            <span className="text-sm">🔥</span>
            <span className="text-white text-sm font-bold">{streak}</span>
          </div>
          <div className="flex items-center gap-1 bg-[#0A0A0A] px-2 py-1 rounded-lg">
            <span className="text-sm">⭐</span>
            <span className="text-white text-sm font-bold">{points.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 bg-[#0A5CDD]/20 px-2 py-1 rounded-lg">
            <span className="text-[#0A5CDD] text-sm font-bold">Lv.{level}</span>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          {pfpUrl ? (
            <img 
              src={pfpUrl} 
              alt={username || 'Profile'} 
              className="w-8 h-8 rounded-full object-cover border border-[#0A5CDD]/50"
            />
          ) : (
            <div className="w-8 h-8 bg-[#1F2937] rounded-full flex items-center justify-center">
              {isConnected ? (
                <span className="text-xs text-[#6B7280]">
                  {address?.slice(2, 4).toUpperCase()}
                </span>
              ) : (
                <span className="text-[#6B7280]">👤</span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
