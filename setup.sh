#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# 🧪 Chain Reaction Labs - Complete Setup with Header
# ═══════════════════════════════════════════════════════════════════════════════

echo "🧪 Setting up Chain Reaction Labs..."

# ═══════════════════════════════════════════════════════════════════════════════
# 1. CREATE HEADER COMPONENT
# ═══════════════════════════════════════════════════════════════════════════════

cat > components/game/Header.tsx << 'EOF'
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
EOF

echo "✅ Created components/game/Header.tsx"

# ═══════════════════════════════════════════════════════════════════════════════
# 2. UPDATE GAME INDEX EXPORTS
# ═══════════════════════════════════════════════════════════════════════════════

cat > components/game/index.ts << 'EOF'
export { SplashScreen } from './SplashScreen'
export { Navbar } from './Navbar'
export { GameArena } from './GameArena'
export { Profile } from './Profile'
export { Header } from './Header'
EOF

echo "✅ Updated components/game/index.ts"

# ═══════════════════════════════════════════════════════════════════════════════
# 3. UPDATE APP.TSX WITH HEADER
# ═══════════════════════════════════════════════════════════════════════════════

cat > components/pages/app.tsx << 'EOF'
'use client'

import { useState, useEffect } from 'react'
import { SafeAreaContainer } from '@/components/safe-area-container'
import { SplashScreen, Navbar, GameArena, Profile, Header } from '@/components/game'

type Screen = 'splash' | 'lab' | 'ranks' | 'profile'

// Try to use Farcaster SDK, fallback to local mode
function useFarcasterOrLocal() {
  const [context, setContext] = useState<any>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const sdk = (await import('@farcaster/miniapp-sdk')).default
        const ctx = await sdk.context
        
        if (ctx) {
          setContext(ctx)
          setIsSDKLoaded(true)
          await sdk.actions.ready()
        } else {
          setIsSDKLoaded(true)
        }
      } catch (e) {
        console.log('Running in local mode')
        setIsSDKLoaded(true)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  return { context, isLoading, isSDKLoaded }
}

export default function App() {
  const { context, isLoading, isSDKLoaded } = useFarcasterOrLocal()
  const [screen, setScreen] = useState<Screen>('splash')
  const [points, setPoints] = useState(1250)
  const [streak, setStreak] = useState(0)
  const [discoveries, setDiscoveries] = useState<any[]>([])
  const [earnedBadges, setEarnedBadges] = useState<string[]>(['first'])

  // Calculate level from points
  const level = Math.floor(points / 500) + 1

  const handleSplashComplete = () => setScreen('lab')

  const handleReaction = (success: boolean, compound: any) => {
    if (success && compound) {
      setPoints(prev => prev + compound.points)
      setStreak(prev => prev + 1)
      if (!discoveries.find(d => d.formula === compound.formula)) {
        setDiscoveries(prev => [...prev, compound])
        if (discoveries.length === 0) setEarnedBadges(prev => [...prev, 'first'])
        if (discoveries.length + 1 >= 5) setEarnedBadges(prev => [...prev, 'chemist'])
      }
    } else {
      setStreak(0)
    }
  }

  if (isLoading) {
    return (
      <SafeAreaContainer insets={context?.client?.safeAreaInsets}>
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#000814]">
          <div className="text-2xl text-white">Loading...</div>
        </div>
      </SafeAreaContainer>
    )
  }

  if (!isSDKLoaded) {
    return (
      <SafeAreaContainer insets={context?.client?.safeAreaInsets}>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#000814]">
          <h1 className="text-xl font-bold text-center text-white">
            Please open in Farcaster app
          </h1>
        </div>
      </SafeAreaContainer>
    )
  }

  if (screen === 'splash') {
    return (
      <SafeAreaContainer insets={context?.client?.safeAreaInsets}>
        <SplashScreen onComplete={handleSplashComplete} />
      </SafeAreaContainer>
    )
  }

  return (
    <SafeAreaContainer insets={context?.client?.safeAreaInsets}>
      <div className="min-h-screen bg-[#000814] text-white flex flex-col">
        {/* Header */}
        <Header points={points} streak={streak} level={level} />
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {screen === 'lab' && <GameArena points={points} streak={streak} onReaction={handleReaction} />}
          {(screen === 'ranks' || screen === 'profile') && <Profile points={points} discoveries={discoveries} earnedBadges={earnedBadges} />}
        </div>
        
        {/* Navbar */}
        <Navbar activeTab={screen === 'lab' ? 'lab' : screen === 'ranks' ? 'ranks' : 'profile'} onTabChange={(tab) => setScreen(tab)} />
      </div>
    </SafeAreaContainer>
  )
}
EOF

echo "✅ Updated components/pages/app.tsx"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🎉 Done! Header added!"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📁 Files created/updated:"
echo "   ✓ components/game/Header.tsx - Header component"
echo "   ✓ components/game/index.ts - Added Header export"
echo "   ✓ components/pages/app.tsx - Added Header to layout"
echo ""
echo "🎨 Header includes:"
echo "   • ⚗️ Logo + Chain Reaction LABS text"
echo "   • 🔥 Streak counter"
echo "   • ⭐ Points (comma formatted)"
echo "   • 🎖️ Level (calculated from points)"
echo "   • 💚 Wallet connect/disconnect with dropdown"
echo ""