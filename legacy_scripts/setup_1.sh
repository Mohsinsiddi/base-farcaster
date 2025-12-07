#!/bin/bash

mkdir -p components/game

cat > lib/gameData.ts << 'EOF'
export interface Atom {
  symbol: string
  name: string
  color: string
  bgColor: string
}

export interface Compound {
  formula: string
  name: string
  atoms: Record<string, number>
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  hint: string
}

export interface Badge {
  id: string
  name: string
  icon: string
  requirement: string
  threshold: number
}

export const ATOMS: Atom[] = [
  { symbol: 'H', name: 'Hydrogen', color: '#FFFFFF', bgColor: '#6B7280' },
  { symbol: 'O', name: 'Oxygen', color: '#FFFFFF', bgColor: '#DC2626' },
  { symbol: 'C', name: 'Carbon', color: '#FFFFFF', bgColor: '#1F2937' },
  { symbol: 'N', name: 'Nitrogen', color: '#FFFFFF', bgColor: '#2563EB' },
  { symbol: 'Cl', name: 'Chlorine', color: '#000000', bgColor: '#22C55E' },
  { symbol: 'Na', name: 'Sodium', color: '#000000', bgColor: '#EAB308' },
]

export const COMPOUNDS: Compound[] = [
  { formula: 'H2O', name: 'Water', atoms: { H: 2, O: 1 }, rarity: 'common', points: 100, hint: 'Essential for life!' },
  { formula: 'CO2', name: 'Carbon Dioxide', atoms: { C: 1, O: 2 }, rarity: 'common', points: 100, hint: 'You breathe this out' },
  { formula: 'CH4', name: 'Methane', atoms: { C: 1, H: 4 }, rarity: 'rare', points: 200, hint: 'Natural gas fuel' },
  { formula: 'NH3', name: 'Ammonia', atoms: { N: 1, H: 3 }, rarity: 'rare', points: 200, hint: 'Strong smell cleaner' },
  { formula: 'HCl', name: 'Hydrochloric Acid', atoms: { H: 1, Cl: 1 }, rarity: 'rare', points: 200, hint: 'In your stomach' },
  { formula: 'NaCl', name: 'Salt', atoms: { Na: 1, Cl: 1 }, rarity: 'epic', points: 300, hint: 'Table seasoning' },
  { formula: 'C2H6O', name: 'Ethanol', atoms: { C: 2, H: 6, O: 1 }, rarity: 'epic', points: 300, hint: 'Party drink' },
  { formula: 'H2O2', name: 'Hydrogen Peroxide', atoms: { H: 2, O: 2 }, rarity: 'epic', points: 300, hint: 'Bleaching agent' },
  { formula: 'C6H12O6', name: 'Glucose', atoms: { C: 6, H: 12, O: 6 }, rarity: 'legendary', points: 500, hint: 'Sugar energy' },
  { formula: 'C8H10N4O2', name: 'Caffeine', atoms: { C: 8, H: 10, N: 4, O: 2 }, rarity: 'legendary', points: 500, hint: 'Morning fuel' },
]

export const BADGES: Badge[] = [
  { id: 'first', name: 'First Reaction', icon: '🔰', requirement: 'Create first compound', threshold: 1 },
  { id: 'chemist', name: 'Chemist', icon: '⚗️', requirement: 'Create 5 compounds', threshold: 5 },
  { id: 'scientist', name: 'Mad Scientist', icon: '🧬', requirement: 'Create 10 compounds', threshold: 10 },
  { id: 'rare', name: 'Rare Hunter', icon: '💎', requirement: 'Get a Rare NFT', threshold: 1 },
  { id: 'streak', name: 'On Fire', icon: '🔥', requirement: '5 streak combo', threshold: 5 },
]

export const RARITY_COLORS = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
}

export const LEADERBOARD_MOCK = [
  { rank: 1, address: '0xAAA...1234', points: 45200, level: 28 },
  { rank: 2, address: '0xBBB...5678', points: 38100, level: 24 },
  { rank: 3, address: '0xCCC...9012', points: 31500, level: 21 },
  { rank: 4, address: '0xDDD...3456', points: 28900, level: 19 },
  { rank: 5, address: '0xEEE...7890', points: 25400, level: 17 },
]

export function formatFormula(atoms: Record<string, number>): string {
  return Object.entries(atoms)
    .map(([symbol, count]) => `${symbol}${count > 1 ? count : ''}`)
    .join('')
}

export function checkCompound(selectedAtoms: string[]): Compound | null {
  const atomCount: Record<string, number> = {}
  selectedAtoms.forEach(atom => {
    atomCount[atom] = (atomCount[atom] || 0) + 1
  })
  
  return COMPOUNDS.find(compound => {
    const keys1 = Object.keys(compound.atoms).sort()
    const keys2 = Object.keys(atomCount).sort()
    if (keys1.length !== keys2.length) return false
    return keys1.every(key => compound.atoms[key] === atomCount[key])
  }) || null
}
EOF

cat > components/game/SplashScreen.tsx << 'EOF'
'use client'

import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 200)
          return 100
        }
        return prev + 5
      })
    }, 80)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-[#000814] flex flex-col items-center justify-center z-50">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#0A5CDD] rounded-full shadow-[0_0_30px_#0A5CDD] animate-pulse" />
        <div className="absolute inset-0 border-2 border-[#0A5CDD]/30 rounded-full animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#22C55E] rounded-full shadow-[0_0_10px_#22C55E]" />
        </div>
        <div className="absolute inset-2 border-2 border-[#0A5CDD]/20 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#DC2626] rounded-full shadow-[0_0_10px_#DC2626]" />
        </div>
        <div className="absolute inset-4 border-2 border-[#0A5CDD]/10 rounded-full animate-spin" style={{ animationDuration: '4s' }}>
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#EAB308] rounded-full shadow-[0_0_10px_#EAB308]" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2 tracking-wider">CHAIN REACTION</h1>
      <p className="text-[#0A5CDD] text-sm mb-8">Build. React. Discover.</p>
      <div className="w-48 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#0A5CDD] to-[#22C55E] transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-[#6B7280] text-xs mt-3">Loading molecules...</p>
    </div>
  )
}
EOF

cat > components/game/Navbar.tsx << 'EOF'
'use client'

interface NavbarProps {
  activeTab: 'lab' | 'ranks' | 'profile'
  onTabChange: (tab: 'lab' | 'ranks' | 'profile') => void
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const tabs = [
    { id: 'lab' as const, label: 'Lab', icon: '🧪' },
    { id: 'ranks' as const, label: 'Ranks', icon: '🏆' },
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#001226] border-t border-[#0A5CDD]/30 px-4 py-2 z-40">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center py-2 px-6 rounded-xl transition-all ${
              activeTab === tab.id ? 'bg-[#0A5CDD]/20 text-[#0A5CDD]' : 'text-[#6B7280]'
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
EOF

cat > components/game/GameArena.tsx << 'EOF'
'use client'

import { useState } from 'react'
import { ATOMS, checkCompound, formatFormula, RARITY_COLORS } from '@/lib/gameData'

interface GameArenaProps {
  points: number
  streak: number
  onReaction: (success: boolean, compound: any) => void
}

export function GameArena({ points, streak, onReaction }: GameArenaProps) {
  const [selectedAtoms, setSelectedAtoms] = useState<string[]>([])
  const [isReacting, setIsReacting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; compound?: any } | null>(null)

  const addAtom = (symbol: string) => {
    if (selectedAtoms.length < 24) setSelectedAtoms([...selectedAtoms, symbol])
  }

  const removeAtom = (index: number) => {
    setSelectedAtoms(selectedAtoms.filter((_, i) => i !== index))
  }

  const clearAtoms = () => {
    setSelectedAtoms([])
    setResult(null)
  }

  const handleReact = () => {
    if (selectedAtoms.length === 0) return
    setIsReacting(true)
    setTimeout(() => {
      const compound = checkCompound(selectedAtoms)
      setResult({ success: !!compound, compound })
      setIsReacting(false)
      onReaction(!!compound, compound)
    }, 1500)
  }

  const getAtomCount = () => {
    const count: Record<string, number> = {}
    selectedAtoms.forEach(atom => { count[atom] = (count[atom] || 0) + 1 })
    return count
  }

  return (
    <div className="flex flex-col h-full pb-20">
      <div className="flex justify-between items-center px-4 py-3 bg-[#001226] border-b border-[#0A5CDD]/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-lg">🔥</span>
            <span className="text-white font-bold">{streak}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg">⭐</span>
            <span className="text-white font-bold">{points.toLocaleString()}</span>
          </div>
        </div>
        <div className="text-xs text-[#6B7280]">Rank #42</div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-[#001226] border border-[#0A5CDD]/30 rounded-2xl p-4 min-h-[200px] relative">
          <p className="text-[#6B7280] text-xs mb-3 text-center">MOLECULAR WORKSPACE</p>
          <div className="flex flex-wrap gap-2 justify-center min-h-[120px] items-center">
            {selectedAtoms.length === 0 ? (
              <p className="text-[#4B5563] text-sm">Tap atoms below to build</p>
            ) : (
              selectedAtoms.map((atom, index) => {
                const atomData = ATOMS.find(a => a.symbol === atom)!
                return (
                  <button
                    key={index}
                    onClick={() => removeAtom(index)}
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-transform active:scale-90"
                    style={{ backgroundColor: atomData.bgColor, color: atomData.color, boxShadow: `0 0 15px ${atomData.bgColor}50` }}
                  >
                    {atom}
                  </button>
                )
              })
            )}
          </div>
          {isReacting && (
            <div className="absolute inset-0 bg-[#000814]/80 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl animate-bounce mb-2">⚛️</div>
                <p className="text-[#0A5CDD] animate-pulse">Reacting...</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-[#6B7280] text-xs mb-1">FORMULA</p>
          <p className="text-white text-2xl font-mono font-bold">
            {selectedAtoms.length > 0 ? formatFormula(getAtomCount()) : '—'}
          </p>
        </div>

        {result && (
          <div className={`mt-4 p-4 rounded-xl text-center ${result.success ? 'bg-[#22C55E]/20 border border-[#22C55E]/50' : 'bg-[#DC2626]/20 border border-[#DC2626]/50'}`}>
            {result.success ? (
              <>
                <p className="text-[#22C55E] font-bold text-lg">{result.compound.name}!</p>
                <p className="text-xs mt-1" style={{ color: RARITY_COLORS[result.compound.rarity as keyof typeof RARITY_COLORS] }}>
                  {result.compound.rarity.toUpperCase()} • +{result.compound.points} pts
                </p>
                <button className="mt-3 bg-[#0A5CDD] text-white px-6 py-2 rounded-lg text-sm font-medium">Mint NFT 🎉</button>
              </>
            ) : (
              <>
                <p className="text-[#DC2626] font-bold">Unknown Compound</p>
                <p className="text-[#6B7280] text-xs mt-1">Try a different combination!</p>
              </>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-[#6B7280] text-xs">
          <span>💡</span><span>Try making Water (H₂O)</span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-[#001226] border border-[#0A5CDD]/30 rounded-2xl p-4">
          <p className="text-[#6B7280] text-xs mb-3 text-center">TAP TO ADD ATOMS</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {ATOMS.map(atom => (
              <button
                key={atom.symbol}
                onClick={() => addAtom(atom.symbol)}
                className="w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold shadow-lg transition-all active:scale-90 hover:scale-105"
                style={{ backgroundColor: atom.bgColor, color: atom.color, boxShadow: `0 4px 15px ${atom.bgColor}40` }}
              >
                <span className="text-lg">{atom.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 flex gap-3">
        <button onClick={clearAtoms} className="flex-1 bg-[#1F2937] text-white py-3 rounded-xl font-medium text-sm border border-[#374151]">🗑 Clear</button>
        <button
          onClick={handleReact}
          disabled={selectedAtoms.length === 0 || isReacting}
          className="flex-[2] bg-gradient-to-r from-[#0A5CDD] to-[#2563EB] text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0A5CDD]/30"
        >
          {isReacting ? '⚛️ Reacting...' : '🔥 REACT!'}
        </button>
      </div>
    </div>
  )
}
EOF

cat > components/game/Profile.tsx << 'EOF'
'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { BADGES, LEADERBOARD_MOCK, RARITY_COLORS } from '@/lib/gameData'

interface ProfileProps {
  points: number
  discoveries: any[]
  earnedBadges: string[]
}

type TabType = 'nfts' | 'badges' | 'leaderboard'

export function Profile({ points, discoveries, earnedBadges }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>('nfts')
  const { address } = useAccount()
  const level = Math.floor(points / 1000) + 1

  const tabs = [
    { id: 'nfts' as const, label: '🧪 NFTs' },
    { id: 'badges' as const, label: '🏅 Badges' },
    { id: 'leaderboard' as const, label: '🏆 Ranks' },
  ]

  return (
    <div className="flex flex-col h-full pb-20">
      <div className="bg-[#001226] border-b border-[#0A5CDD]/20 p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0A5CDD] to-[#2563EB] rounded-full flex items-center justify-center text-2xl">🧬</div>
          <div className="flex-1">
            <p className="text-white font-bold">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not Connected'}</p>
            <p className="text-[#0A5CDD] text-sm">Level {level} Scientist</p>
            <div className="flex gap-4 mt-1 text-xs text-[#6B7280]">
              <span>⭐ {points.toLocaleString()} pts</span>
              <span>🏆 Rank #42</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-[#0A5CDD]/20">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-[#0A5CDD] border-b-2 border-[#0A5CDD]' : 'text-[#6B7280]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'nfts' && (
          <div>
            <p className="text-[#6B7280] text-xs mb-4">YOUR DISCOVERIES ({discoveries.length})</p>
            {discoveries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🧪</p>
                <p className="text-[#6B7280]">No discoveries yet</p>
                <p className="text-[#4B5563] text-xs mt-1">Create compounds in the Lab!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {discoveries.map((compound, index) => (
                  <div key={index} className="bg-[#001226] border border-[#0A5CDD]/30 rounded-xl p-3 text-center" style={{ borderColor: `${RARITY_COLORS[compound.rarity as keyof typeof RARITY_COLORS]}50` }}>
                    <p className="text-white font-mono font-bold">{compound.formula}</p>
                    <p className="text-[#6B7280] text-xs truncate">{compound.name}</p>
                    <p className="text-xs mt-1" style={{ color: RARITY_COLORS[compound.rarity as keyof typeof RARITY_COLORS] }}>
                      {'⭐'.repeat(compound.rarity === 'common' ? 1 : compound.rarity === 'rare' ? 2 : compound.rarity === 'epic' ? 3 : 4)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div>
            <p className="text-[#6B7280] text-xs mb-4">BADGES ({earnedBadges.length}/{BADGES.length})</p>
            <div className="space-y-3">
              {BADGES.map(badge => {
                const isEarned = earnedBadges.includes(badge.id)
                return (
                  <div key={badge.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isEarned ? 'bg-[#001226] border-[#22C55E]/50' : 'bg-[#0a0a0a] border-[#1F2937] opacity-60'}`}>
                    <span className="text-2xl">{badge.icon}</span>
                    <div className="flex-1">
                      <p className={`font-medium ${isEarned ? 'text-white' : 'text-[#6B7280]'}`}>{badge.name}</p>
                      <p className="text-xs text-[#6B7280]">{badge.requirement}</p>
                    </div>
                    {isEarned ? <span className="text-[#22C55E]">✓</span> : <span className="text-[#6B7280] text-xs">🔒</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div>
            <p className="text-[#6B7280] text-xs mb-4">TOP SCIENTISTS</p>
            <div className="space-y-2">
              {LEADERBOARD_MOCK.map((player, index) => (
                <div key={player.rank} className={`flex items-center gap-3 p-3 rounded-xl ${index < 3 ? 'bg-[#001226] border border-[#0A5CDD]/30' : 'bg-[#0a0a0a]'}`}>
                  <span className="text-xl w-8 text-center">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : player.rank}</span>
                  <div className="flex-1">
                    <p className="text-white font-mono text-sm">{player.address}</p>
                    <p className="text-[#6B7280] text-xs">Level {player.level}</p>
                  </div>
                  <p className="text-[#0A5CDD] font-bold">{player.points.toLocaleString()}</p>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-[#1F2937]">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0A5CDD]/10 border border-[#0A5CDD]/50">
                  <span className="text-xl w-8 text-center">42</span>
                  <div className="flex-1">
                    <p className="text-white font-mono text-sm">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'You'}</p>
                    <p className="text-[#6B7280] text-xs">Level {level}</p>
                  </div>
                  <p className="text-[#0A5CDD] font-bold">{points.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
EOF

cat > components/game/index.ts << 'EOF'
export { SplashScreen } from './SplashScreen'
export { Navbar } from './Navbar'
export { GameArena } from './GameArena'
export { Profile } from './Profile'
EOF

cat > app/page.tsx << 'EOF'
'use client'

import { useState } from 'react'
import { SplashScreen, Navbar, GameArena, Profile } from '@/components/game'

type Screen = 'splash' | 'lab' | 'ranks' | 'profile'

export default function Home() {
  const [screen, setScreen] = useState<Screen>('splash')
  const [points, setPoints] = useState(1250)
  const [streak, setStreak] = useState(0)
  const [discoveries, setDiscoveries] = useState<any[]>([])
  const [earnedBadges, setEarnedBadges] = useState<string[]>(['first'])

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

  if (screen === 'splash') return <SplashScreen onComplete={handleSplashComplete} />

  return (
    <div className="min-h-screen bg-[#000814] text-white">
      {screen === 'lab' && <GameArena points={points} streak={streak} onReaction={handleReaction} />}
      {(screen === 'ranks' || screen === 'profile') && <Profile points={points} discoveries={discoveries} earnedBadges={earnedBadges} />}
      <Navbar activeTab={screen === 'lab' ? 'lab' : screen === 'ranks' ? 'ranks' : 'profile'} onTabChange={(tab) => setScreen(tab)} />
    </div>
  )
}
EOF

echo "✅ Phase 1 Complete!"

part 2

#!/bin/bash

cat > components/pages/app.tsx << 'EOF'
'use client'

import { useState } from 'react'
import { useFrame } from '@/components/farcaster-provider'
import { SafeAreaContainer } from '@/components/safe-area-container'
import { SplashScreen, Navbar, GameArena, Profile } from '@/components/game'

type Screen = 'splash' | 'lab' | 'ranks' | 'profile'

export default function App() {
  const { context, isLoading, isSDKLoaded } = useFrame()
  const [screen, setScreen] = useState<Screen>('splash')
  const [points, setPoints] = useState(1250)
  const [streak, setStreak] = useState(0)
  const [discoveries, setDiscoveries] = useState<any[]>([])
  const [earnedBadges, setEarnedBadges] = useState<string[]>(['first'])

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
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#000814]">
          <div className="text-2xl text-white">Loading...</div>
        </div>
      </SafeAreaContainer>
    )
  }

  if (!isSDKLoaded) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
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
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <SplashScreen onComplete={handleSplashComplete} />
      </SafeAreaContainer>
    )
  }

  return (
    <SafeAreaContainer insets={context?.client.safeAreaInsets}>
      <div className="min-h-screen bg-[#000814] text-white">
        {screen === 'lab' && <GameArena points={points} streak={streak} onReaction={handleReaction} />}
        {(screen === 'ranks' || screen === 'profile') && <Profile points={points} discoveries={discoveries} earnedBadges={earnedBadges} />}
        <Navbar activeTab={screen === 'lab' ? 'lab' : screen === 'ranks' ? 'ranks' : 'profile'} onTabChange={(tab) => setScreen(tab)} />
      </div>
    </SafeAreaContainer>
  )
}
EOF

echo "✅ Done"