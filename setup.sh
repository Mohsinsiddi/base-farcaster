#!/bin/bash

echo "🧪 Chain Reaction - Phase 6: Enhanced Lab Page"
echo "==============================================="

mkdir -p components/game

# ============================================
# 1. ENHANCED GAME ARENA
# ============================================
cat > components/game/GameArena.tsx << 'EOF'
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useMintMolecule, MOLECULE_NFT_ADDRESS } from '@/lib/hooks/useContract'
import { 
  ATOMS, 
  COMPOUNDS,
  checkCompound, 
  formatFormula, 
  RARITY_COLORS, 
  RARITY_GLOW,
  generateTokenURI,
  type RolledCompound,
  type Rarity,
  type Compound
} from '@/lib/gameData'

interface GameArenaProps {
  points: number
  streak: number
  onReaction: (success: boolean, compound: RolledCompound | null) => void
  onMintSuccess?: (compound: RolledCompound, txHash: string) => void
  recentDiscoveries?: string[] // formulas already discovered
}

type GameState = 'idle' | 'reacting' | 'reveal' | 'minting' | 'success' | 'failed'

const MIXING_GIF = 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDc1aTEydHkwMTF0bHdiNWJmaGR3dG11NXBrYzFma2o5djY5cThpcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lUpphqmQnj4TVC/giphy.gif'

// Streak multiplier bonuses
const getStreakMultiplier = (streak: number): number => {
  if (streak >= 10) return 2.0
  if (streak >= 7) return 1.5
  if (streak >= 5) return 1.25
  if (streak >= 3) return 1.1
  return 1.0
}

const getStreakLabel = (streak: number): string => {
  if (streak >= 10) return '🔥 UNSTOPPABLE'
  if (streak >= 7) return '⚡ ON FIRE'
  if (streak >= 5) return '💥 HOT'
  if (streak >= 3) return '✨ WARMING UP'
  return ''
}

export function GameArena({ points, streak, onReaction, onMintSuccess, recentDiscoveries = [] }: GameArenaProps) {
  const [selectedAtoms, setSelectedAtoms] = useState<string[]>([])
  const [gameState, setGameState] = useState<GameState>('idle')
  const [result, setResult] = useState<RolledCompound | null>(null)
  const [showRarityReveal, setShowRarityReveal] = useState(false)
  const [revealedRarity, setRevealedRarity] = useState<Rarity | null>(null)
  const [isNewDiscovery, setIsNewDiscovery] = useState(false)
  const [bubbles, setBubbles] = useState<{id: number, x: number, size: number, delay: number}[]>([])

  const { address, isConnected } = useAccount()
  const { mint, hash, isPending, isConfirming, isSuccess, error, reset } = useMintMolecule()

  // Generate bubbles for test tube animation
  useEffect(() => {
    const newBubbles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 2
    }))
    setBubbles(newBubbles)
  }, [selectedAtoms.length])

  // Get atom counts
  const atomCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    selectedAtoms.forEach(atom => {
      counts[atom] = (counts[atom] || 0) + 1
    })
    return counts
  }, [selectedAtoms])

  // Check for potential compound match (preview)
  const potentialCompound = useMemo((): Compound | null => {
    if (selectedAtoms.length === 0) return null
    
    // Check exact match first
    const exactMatch = COMPOUNDS.find(c => {
      const keys1 = Object.keys(c.atoms).sort()
      const keys2 = Object.keys(atomCounts).sort()
      if (keys1.length !== keys2.length) return false
      return keys1.every(key => c.atoms[key] === atomCounts[key])
    })
    if (exactMatch) return exactMatch

    // Check partial match (could become a compound)
    const partialMatch = COMPOUNDS.find(c => {
      return Object.entries(atomCounts).every(([atom, count]) => {
        return c.atoms[atom] !== undefined && c.atoms[atom] >= count
      })
    })
    return partialMatch || null
  }, [selectedAtoms, atomCounts])

  const isExactMatch = potentialCompound && Object.keys(atomCounts).length === Object.keys(potentialCompound.atoms).length &&
    Object.entries(atomCounts).every(([atom, count]) => potentialCompound.atoms[atom] === count)

  // Handle mint success
  useEffect(() => {
    if (isSuccess && hash && result) {
      setGameState('success')
      saveMintToDatabase(result, hash)
      onMintSuccess?.(result, hash)
    }
  }, [isSuccess, hash, result])

  // Handle mint error
  useEffect(() => {
    if (error) {
      console.error('Mint error:', error)
      setGameState('reveal')
    }
  }, [error])

  const saveMintToDatabase = async (compound: RolledCompound, txHash: string) => {
    try {
      await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          formula: compound.formula,
          name: compound.name,
          rarity: compound.rarity,
          points: compound.points,
          txHash,
        })
      })
    } catch (err) {
      console.error('Failed to save mint:', err)
    }
  }

  const addAtom = (symbol: string) => {
    if (selectedAtoms.length < 24 && gameState === 'idle') {
      setSelectedAtoms([...selectedAtoms, symbol])
    }
  }

  const removeAtom = (index: number) => {
    if (gameState === 'idle') {
      setSelectedAtoms(selectedAtoms.filter((_, i) => i !== index))
    }
  }

  const removeLastAtom = () => {
    if (gameState === 'idle' && selectedAtoms.length > 0) {
      setSelectedAtoms(selectedAtoms.slice(0, -1))
    }
  }

  const clearAtoms = () => {
    setSelectedAtoms([])
    setResult(null)
    setGameState('idle')
    setShowRarityReveal(false)
    setRevealedRarity(null)
    setIsNewDiscovery(false)
    reset()
  }

  const handleReact = () => {
    if (selectedAtoms.length === 0) return
    
    setGameState('reacting')
    
    setTimeout(() => {
      const compound = checkCompound(selectedAtoms)
      setResult(compound)
      
      if (compound) {
        const isNew = !recentDiscoveries.includes(compound.formula)
        setIsNewDiscovery(isNew)
        setGameState('reveal')
        animateRarityReveal(compound.rarity)
        onReaction(true, compound)
      } else {
        setGameState('failed')
        onReaction(false, null)
      }
    }, 2500)
  }

  const animateRarityReveal = (finalRarity: Rarity) => {
    setShowRarityReveal(true)
    const rarities: Rarity[] = ['common', 'rare', 'epic', 'legendary']
    let iterations = 0
    const maxIterations = 15
    
    const interval = setInterval(() => {
      iterations++
      const randomRarity = rarities[Math.floor(Math.random() * rarities.length)]
      setRevealedRarity(randomRarity)
      
      if (iterations >= maxIterations) {
        clearInterval(interval)
        setRevealedRarity(finalRarity)
      }
    }, 100)
  }

  const handleMint = async () => {
    if (!result || !isConnected || !address) return
    
    setGameState('minting')
    
    const tokenURI = generateTokenURI(
      result.formula,
      result.name,
      result.rarity,
      result.points
    )
    
    await mint(
      result.formula,
      result.name,
      result.rarity,
      result.points,
      tokenURI
    )
  }

  const truncateHash = (hash: string) => 
    `${hash.slice(0, 6)}...${hash.slice(-4)}`

  const streakMultiplier = getStreakMultiplier(streak)
  const streakLabel = getStreakLabel(streak)

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Streak Banner */}
      {streak >= 3 && (
        <div 
          className="mx-4 mt-2 py-2 px-4 rounded-xl text-center text-sm font-bold animate-pulse"
          style={{
            background: streak >= 10 ? 'linear-gradient(90deg, #F59E0B20, #DC262620, #F59E0B20)' :
                       streak >= 5 ? 'linear-gradient(90deg, #F59E0B20, #F59E0B10)' : '#F59E0B10',
            color: '#F59E0B'
          }}
        >
          {streakLabel} • {streakMultiplier}x BONUS
        </div>
      )}

      {/* Main Lab Area */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Test Tube Workspace */}
        <div className="bg-[#001226] border border-[#0A5CDD]/30 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[#6B7280] text-xs">REACTION CHAMBER</p>
            <p className="text-[#6B7280] text-xs">{selectedAtoms.length}/24 atoms</p>
          </div>
          
          {/* Test Tube SVG */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <svg width="120" height="160" viewBox="0 0 120 160">
                {/* Test tube outline */}
                <path
                  d="M30 10 L30 120 Q30 150 60 150 Q90 150 90 120 L90 10"
                  fill="none"
                  stroke="#0A5CDD"
                  strokeWidth="3"
                  opacity="0.5"
                />
                
                {/* Liquid fill based on atoms */}
                {selectedAtoms.length > 0 && (
                  <path
                    d={`M32 ${130 - (selectedAtoms.length * 4)} L32 120 Q32 148 60 148 Q88 148 88 120 L88 ${130 - (selectedAtoms.length * 4)}`}
                    fill={potentialCompound && isExactMatch ? RARITY_COLORS[potentialCompound.baseRarity] + '40' : '#0A5CDD20'}
                    className="transition-all duration-300"
                  >
                    <animate
                      attributeName="d"
                      values={`M32 ${130 - (selectedAtoms.length * 4)} L32 120 Q32 148 60 148 Q88 148 88 120 L88 ${130 - (selectedAtoms.length * 4)};
                               M32 ${128 - (selectedAtoms.length * 4)} L32 120 Q32 148 60 148 Q88 148 88 120 L88 ${132 - (selectedAtoms.length * 4)};
                               M32 ${130 - (selectedAtoms.length * 4)} L32 120 Q32 148 60 148 Q88 148 88 120 L88 ${130 - (selectedAtoms.length * 4)}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </path>
                )}
                
                {/* Bubbles */}
                {selectedAtoms.length > 0 && bubbles.map(bubble => (
                  <circle
                    key={bubble.id}
                    cx={bubble.x}
                    cy="140"
                    r={bubble.size}
                    fill="#0A5CDD"
                    opacity="0.3"
                  >
                    <animate
                      attributeName="cy"
                      values={`140;${40 + Math.random() * 20};140`}
                      dur={`${2 + bubble.delay}s`}
                      repeatCount="indefinite"
                      begin={`${bubble.delay}s`}
                    />
                    <animate
                      attributeName="opacity"
                      values="0.3;0.6;0"
                      dur={`${2 + bubble.delay}s`}
                      repeatCount="indefinite"
                      begin={`${bubble.delay}s`}
                    />
                  </circle>
                ))}
                
                {/* Cork/top */}
                <rect x="25" y="2" width="70" height="12" rx="3" fill="#8B4513" opacity="0.8" />
              </svg>
              
              {/* Atom badges on tube */}
              <div className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-wrap gap-1 justify-center max-w-[80px]">
                {Object.entries(atomCounts).map(([atom, count]) => {
                  const atomData = ATOMS.find(a => a.symbol === atom)!
                  return (
                    <div
                      key={atom}
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: atomData.bgColor, color: atomData.color }}
                    >
                      {atom}
                      {count > 1 && <span className="text-[10px]">×{count}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Formula Display */}
          <div className="text-center mb-2">
            <p className="text-white text-3xl font-mono font-bold tracking-wider">
              {selectedAtoms.length > 0 ? formatFormula(atomCounts) : '—'}
            </p>
          </div>

          {/* Compound Preview/Hint */}
          <div className="text-center min-h-[40px]">
            {selectedAtoms.length === 0 ? (
              <p className="text-[#4B5563] text-sm">Add atoms to start building</p>
            ) : isExactMatch && potentialCompound ? (
              <div className="animate-pulse">
                <p className="text-[#22C55E] font-medium">{potentialCompound.name}</p>
                <p className="text-[#6B7280] text-xs">Ready to react! 🧪</p>
              </div>
            ) : potentialCompound ? (
              <div>
                <p className="text-[#6B7280] text-sm">Building towards...</p>
                <p className="text-[#0A5CDD] text-sm font-medium">{potentialCompound.name}?</p>
              </div>
            ) : (
              <p className="text-[#DC2626] text-sm">Unknown combination</p>
            )}
          </div>

          {/* Reacting Overlay */}
          {gameState === 'reacting' && (
            <div className="absolute inset-0 bg-[#000814]/95 rounded-2xl flex flex-col items-center justify-center z-10">
              <img 
                src={MIXING_GIF} 
                alt="Mixing..." 
                className="w-40 h-40 object-cover rounded-xl mb-4"
              />
              <p className="text-[#0A5CDD] animate-pulse font-bold text-lg">Reacting...</p>
              <p className="text-[#6B7280] text-sm mt-1">Molecules combining</p>
            </div>
          )}

          {/* Rarity Reveal Overlay */}
          {(gameState === 'reveal' || gameState === 'minting' || gameState === 'success') && result && showRarityReveal && (
            <div className="absolute inset-0 bg-[#000814]/95 rounded-2xl flex flex-col items-center justify-center z-10">
              {/* New Discovery Badge */}
              {isNewDiscovery && gameState === 'reveal' && (
                <div className="absolute top-4 right-4 bg-[#22C55E] text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce">
                  ✨ NEW DISCOVERY!
                </div>
              )}
              
              <div 
                className="text-7xl mb-4 transition-all duration-100"
                style={{ 
                  filter: revealedRarity === result.rarity ? `drop-shadow(${RARITY_GLOW[revealedRarity]})` : 'none',
                  transform: gameState === 'reveal' && revealedRarity !== result.rarity ? 'scale(1.2) rotate(5deg)' : 'scale(1)'
                }}
              >
                {revealedRarity === 'legendary' ? '👑' : 
                 revealedRarity === 'epic' ? '🔮' : 
                 revealedRarity === 'rare' ? '💎' : '⚗️'}
              </div>
              
              <p 
                className="text-3xl font-black mb-2 transition-colors duration-100 tracking-wider"
                style={{ color: revealedRarity ? RARITY_COLORS[revealedRarity] : '#fff' }}
              >
                {revealedRarity?.toUpperCase()}
              </p>
              
              <p className="text-white text-2xl font-bold mb-1">{result.name}</p>
              <p className="text-[#6B7280] font-mono">{result.formula}</p>
              
              {revealedRarity === result.rarity && (
                <div className="mt-4 text-center">
                  <p 
                    className="text-2xl font-black animate-bounce"
                    style={{ color: RARITY_COLORS[result.rarity] }}
                  >
                    +{Math.floor(result.points * streakMultiplier)} pts
                  </p>
                  {streakMultiplier > 1 && (
                    <p className="text-[#F59E0B] text-sm">
                      ({result.points} × {streakMultiplier} streak bonus)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Failed Overlay */}
          {gameState === 'failed' && (
            <div className="absolute inset-0 bg-[#000814]/95 rounded-2xl flex flex-col items-center justify-center z-10">
              <div className="text-7xl mb-4 animate-pulse">💨</div>
              <p className="text-[#DC2626] font-bold text-2xl">Reaction Failed!</p>
              <p className="text-[#6B7280] text-sm mt-2">Unknown compound</p>
              <p className="text-[#4B5563] text-xs mt-4">💡 Tip: Try H₂O or NaCl</p>
            </div>
          )}
        </div>

        {/* Quick Suggestions */}
        {gameState === 'idle' && selectedAtoms.length === 0 && (
          <div className="mt-4">
            <p className="text-[#6B7280] text-xs mb-2 text-center">QUICK START</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {[
                { formula: 'H₂O', atoms: ['H', 'H', 'O'], name: 'Water' },
                { formula: 'NaCl', atoms: ['Na', 'Cl'], name: 'Salt' },
                { formula: 'CO₂', atoms: ['C', 'O', 'O'], name: 'CO₂' },
              ].map(suggestion => (
                <button
                  key={suggestion.formula}
                  onClick={() => setSelectedAtoms(suggestion.atoms)}
                  className="bg-[#001226] border border-[#0A5CDD]/30 rounded-lg px-3 py-2 text-sm hover:border-[#0A5CDD] transition-colors"
                >
                  <span className="text-white font-mono">{suggestion.formula}</span>
                  <span className="text-[#6B7280] text-xs ml-2">{suggestion.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Success Card */}
        {gameState === 'success' && result && hash && (
          <div 
            className="mt-4 p-4 rounded-xl text-center border"
            style={{ 
              backgroundColor: `${RARITY_COLORS[result.rarity]}15`,
              borderColor: `${RARITY_COLORS[result.rarity]}50`
            }}
          >
            <div className="text-5xl mb-2">🎉</div>
            <p className="text-white font-bold text-xl">NFT Minted!</p>
            <p 
              className="text-sm mt-1 font-medium"
              style={{ color: RARITY_COLORS[result.rarity] }}
            >
              {result.rarity.toUpperCase()} {result.name}
            </p>
            <a
              href={`https://basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 bg-[#0A5CDD] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0A5CDD]/80 transition-colors"
            >
              View on BaseScan ↗
            </a>
          </div>
        )}

        {/* Minting Status */}
        {gameState === 'minting' && (
          <div className="mt-4 p-4 rounded-xl text-center bg-[#0A5CDD]/20 border border-[#0A5CDD]/50">
            <div className="text-3xl mb-2 animate-spin">⚛️</div>
            <p className="text-[#0A5CDD] font-medium">
              {isPending ? 'Confirm in wallet...' : isConfirming ? 'Confirming on Base...' : 'Processing...'}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && gameState === 'reveal' && (
          <div className="mt-4 p-3 rounded-xl text-center bg-[#DC2626]/20 border border-[#DC2626]/50">
            <p className="text-[#DC2626] text-sm">
              {error.message.includes('rejected') ? 'Transaction rejected' : 'Mint failed. Try again.'}
            </p>
          </div>
        )}
      </div>

      {/* Atom Palette */}
      <div className="px-4 pb-3">
        <div className="bg-[#001226] border border-[#0A5CDD]/30 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[#6B7280] text-xs">ELEMENTS</p>
            {selectedAtoms.length > 0 && (
              <button
                onClick={removeLastAtom}
                className="text-[#6B7280] text-xs hover:text-white transition-colors"
              >
                ⌫ Undo
              </button>
            )}
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            {ATOMS.map(atom => {
              const count = atomCounts[atom.symbol] || 0
              return (
                <button
                  key={atom.symbol}
                  onClick={() => addAtom(atom.symbol)}
                  disabled={gameState !== 'idle' || selectedAtoms.length >= 24}
                  className="relative w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold shadow-lg transition-all active:scale-90 hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
                  style={{ 
                    backgroundColor: atom.bgColor, 
                    color: atom.color, 
                    boxShadow: `0 4px 15px ${atom.bgColor}40` 
                  }}
                >
                  <span className="text-lg">{atom.symbol}</span>
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0A5CDD] text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 flex gap-3">
        <button 
          onClick={clearAtoms} 
          disabled={selectedAtoms.length === 0 && gameState === 'idle'}
          className="flex-1 bg-[#1F2937] text-white py-3 rounded-xl font-medium text-sm border border-[#374151] active:scale-95 transition-all disabled:opacity-50"
        >
          🗑 Clear
        </button>
        
        {gameState === 'idle' && (
          <button
            onClick={handleReact}
            disabled={selectedAtoms.length === 0}
            className={`flex-[2] py-3 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isExactMatch 
                ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[#22C55E]/30' 
                : 'bg-gradient-to-r from-[#0A5CDD] to-[#2563EB] shadow-[#0A5CDD]/30'
            } text-white`}
          >
            {isExactMatch ? '✨ REACT!' : '🔥 REACT!'}
          </button>
        )}

        {gameState === 'reveal' && result && (
          <button
            onClick={handleMint}
            disabled={!isConnected}
            className="flex-[2] bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-[#22C55E]/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {isConnected ? '🎉 MINT NFT' : '🔗 Connect Wallet'}
          </button>
        )}

        {gameState === 'failed' && (
          <button
            onClick={clearAtoms}
            className="flex-[2] bg-gradient-to-r from-[#0A5CDD] to-[#2563EB] text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-[#0A5CDD]/30 active:scale-95 transition-all"
          >
            🔄 Try Again
          </button>
        )}

        {gameState === 'success' && (
          <button
            onClick={clearAtoms}
            className="flex-[2] bg-gradient-to-r from-[#0A5CDD] to-[#2563EB] text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-[#0A5CDD]/30 active:scale-95 transition-all"
          >
            🧪 New Reaction
          </button>
        )}

        {(gameState === 'reacting' || gameState === 'minting') && (
          <button
            disabled
            className="flex-[2] bg-[#374151] text-white py-3 rounded-xl font-bold text-lg opacity-70 cursor-not-allowed"
          >
            {gameState === 'reacting' ? '⚛️ Mixing...' : '⏳ Minting...'}
          </button>
        )}
      </div>
    </div>
  )
}
EOF

echo "✅ components/game/GameArena.tsx - Enhanced Lab"

# ============================================
# 2. UPDATE APP.TSX TO PASS DISCOVERIES
# ============================================
cat > components/pages/app.tsx << 'EOF'
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { SafeAreaContainer } from '@/components/safe-area-container'
import { SplashScreen, Navbar, GameArena, Profile, Header, Leaderboard } from '@/components/game'
import type { RolledCompound } from '@/lib/gameData'

type Screen = 'splash' | 'lab' | 'ranks' | 'profile'

interface FarcasterUser {
  fid?: number
  username?: string
  displayName?: string
  pfpUrl?: string
}

function useFarcasterOrLocal() {
  const [context, setContext] = useState<any>(undefined)
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | undefined>()
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
          
          if (ctx.user) {
            setFarcasterUser({
              fid: ctx.user.fid,
              username: ctx.user.username,
              displayName: ctx.user.displayName,
              pfpUrl: ctx.user.pfpUrl,
            })
          }
          
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

  return { context, farcasterUser, isLoading, isSDKLoaded }
}

export default function App() {
  const { context, farcasterUser, isLoading, isSDKLoaded } = useFarcasterOrLocal()
  const { address, isConnected } = useAccount()
  
  const [screen, setScreen] = useState<Screen>('splash')
  const [points, setPoints] = useState(0)
  const [streak, setStreak] = useState(0)
  const [discoveries, setDiscoveries] = useState<any[]>([])
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])
  const [isUserLoaded, setIsUserLoaded] = useState(false)

  const level = Math.floor(points / 1000) + 1

  // Get list of discovered formulas for "NEW" badge detection
  const discoveredFormulas = discoveries.map(d => d.formula)

  const fetchUserData = useCallback(async () => {
    if (!address) return
    
    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          fid: farcasterUser?.fid,
          username: farcasterUser?.username || farcasterUser?.displayName,
        })
      })

      const res = await fetch(`/api/user?address=${address}`)
      if (res.ok) {
        const data = await res.json()
        setPoints(data.points || 0)
        setStreak(data.streak || 0)
        setDiscoveries(data.discoveries || [])
        setEarnedBadges(data.badges || [])
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err)
    } finally {
      setIsUserLoaded(true)
    }
  }, [address, farcasterUser])

  useEffect(() => {
    if (address && isSDKLoaded) {
      fetchUserData()
    } else if (!address) {
      setIsUserLoaded(true)
    }
  }, [address, isSDKLoaded, fetchUserData])

  const handleSplashComplete = () => setScreen('lab')

  const handleReaction = async (success: boolean, compound: RolledCompound | null) => {
    if (success && compound) {
      // Apply streak multiplier
      const multiplier = streak >= 10 ? 2.0 : streak >= 7 ? 1.5 : streak >= 5 ? 1.25 : streak >= 3 ? 1.1 : 1.0
      const bonusPoints = Math.floor(compound.points * multiplier)
      
      setPoints(prev => prev + bonusPoints)
      setStreak(prev => prev + 1)
    } else if (!success && address) {
      setStreak(0)
      try {
        await fetch('/api/game/streak-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address })
        })
      } catch (err) {
        console.error('Failed to reset streak:', err)
      }
    }
  }

  const handleMintSuccess = async (compound: RolledCompound, txHash: string) => {
    const newDiscovery = {
      ...compound,
      txHash,
      mintedAt: new Date().toISOString()
    }
    setDiscoveries(prev => [newDiscovery, ...prev])
    
    setTimeout(fetchUserData, 1000)
  }

  if (isLoading) {
    return (
      <SafeAreaContainer insets={context?.client?.safeAreaInsets}>
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#000814]">
          <div className="animate-spin text-4xl mb-4">⚛️</div>
          <div className="text-lg text-white">Loading...</div>
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
        <Header 
          points={points} 
          streak={streak} 
          level={level}
          username={farcasterUser?.displayName || farcasterUser?.username}
          pfpUrl={farcasterUser?.pfpUrl}
        />
        
        <div className="flex-1 overflow-hidden">
          {screen === 'lab' && (
            <GameArena 
              points={points} 
              streak={streak} 
              onReaction={handleReaction}
              onMintSuccess={handleMintSuccess}
              recentDiscoveries={discoveredFormulas}
            />
          )}
          {screen === 'ranks' && <Leaderboard />}
          {screen === 'profile' && <Profile farcasterUser={farcasterUser} />}
        </div>
        
        <Navbar 
          activeTab={screen === 'lab' ? 'lab' : screen === 'ranks' ? 'ranks' : 'profile'} 
          onTabChange={(tab) => setScreen(tab)} 
        />
      </div>
    </SafeAreaContainer>
  )
}
EOF

echo "✅ components/pages/app.tsx - Updated with discovery tracking"

echo ""
echo "==============================================="
echo "🎉 Phase 6 Complete - Enhanced Lab Page!"
echo "==============================================="
echo ""
echo "New Features:"
echo "  ✅ Animated test tube with bubbling liquid"
echo "  ✅ Real-time compound preview as you build"
echo "  ✅ Atom count badges on palette"
echo "  ✅ Streak multiplier display (1.1x → 2x)"
echo "  ✅ 'NEW DISCOVERY' badge for first-time finds"
echo "  ✅ Quick-start compound buttons"
echo "  ✅ Undo last atom button"
echo "  ✅ Visual feedback for exact matches (green button)"
echo "  ✅ Smoother animations and glow effects"
echo ""
echo "Streak Bonuses:"
echo "  3+ streak  → 1.1x points (✨ WARMING UP)"
echo "  5+ streak  → 1.25x points (💥 HOT)"
echo "  7+ streak  → 1.5x points (⚡ ON FIRE)"
echo "  10+ streak → 2.0x points (🔥 UNSTOPPABLE)"
echo ""
echo "Run: chmod +x phase6-enhanced-lab.sh && ./phase6-enhanced-lab.sh"