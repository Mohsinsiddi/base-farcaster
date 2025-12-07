'use client'

import { useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'

interface HeaderProps {
  points: number
}

export function Header({ points }: HeaderProps) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()
  const [showMenu, setShowMenu] = useState(false)

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <header className="bg-[#000814]/95 backdrop-blur-xl border-b border-[#0A5CDD]/20 px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-[38px] h-[38px]">
            <svg 
              width="38" 
              height="38" 
              viewBox="0 0 100 100" 
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M35 15 L35 40 L15 75 Q10 85 20 92 L80 92 Q90 85 85 75 L65 40 L65 15" 
                fill="#001226" 
                stroke="#0A5CDD" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <rect x="33" y="8" width="34" height="10" rx="2" fill="#0A5CDD"/>
              <path 
                d="M20 75 L35 55 L65 55 L80 75 Q85 82 78 88 L22 88 Q15 82 20 75" 
                fill="#0A5CDD" 
                fillOpacity="0.5"
              />
              <circle cx="35" cy="70" r="4" fill="#22C55E" opacity="0.8"/>
              <circle cx="50" cy="75" r="3" fill="#A855F7" opacity="0.8"/>
              <circle cx="62" cy="68" r="3.5" fill="#F59E0B" opacity="0.8"/>
              <circle cx="50" cy="32" r="3" fill="#0A5CDD"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-[17px] leading-tight">
              Chain<span className="text-[#0A5CDD]">Reaction</span>
            </span>
            <span className="text-[#6B7280] text-[9px] font-semibold tracking-[0.2em] uppercase">Labs</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2.5">
          {isConnected && (
            <div className="flex items-center gap-1.5 bg-[#0A5CDD]/20 border border-[#0A5CDD]/30 px-3 py-1.5 rounded-xl">
              <span className="text-sm">⚡</span>
              <span className="text-white font-bold text-sm">{points.toLocaleString()}</span>
            </div>
          )}

          {isConnected ? (
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 bg-[#001226] border border-[#22C55E]/40 rounded-xl px-3 py-1.5 hover:border-[#22C55E] transition-colors"
              >
                <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
                <span className="text-white text-sm font-mono">{truncate(address!)}</span>
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-[#001226] border border-[#0A5CDD]/30 rounded-xl z-50 shadow-xl overflow-hidden">
                    <button
                      onClick={() => { disconnect(); setShowMenu(false) }}
                      className="px-4 py-2.5 text-[#DC2626] hover:bg-[#DC2626]/10 flex items-center gap-2 w-full whitespace-nowrap"
                    >
                      <span>🔌</span>
                      <span className="text-sm font-medium">Disconnect</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => open()}
              className="flex items-center gap-2 bg-gradient-to-r from-[#0A5CDD] to-[#2563EB] text-white px-4 py-2.5 rounded-xl font-semibold text-sm active:scale-95 shadow-lg shadow-[#0A5CDD]/25 transition-transform"
            >
              <span>🔗</span>
              <span>Connect</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
