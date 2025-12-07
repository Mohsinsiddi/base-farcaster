#!/bin/bash

echo "🎮 Chain Reaction - Phase 5: Profile & Leaderboard"
echo "==================================================="

mkdir -p components/game

# ============================================
# 1. LEADERBOARD COMPONENT (NEW)
# ============================================
cat > components/game/Leaderboard.tsx << 'EOF'
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface LeaderboardEntry {
  rank: number
  address: string
  username?: string
  fid?: number
  points: number
  level: number
  totalMints: number
  discoveryCount: number
  badgeCount: number
}

interface UserRank {
  rank: number | null
  totalPlayers: number
  address: string
  username?: string
  points: number
  level: number
  totalMints: number
  discoveryCount: number
  percentile: number
}

export function Leaderboard() {
  const { address } = useAccount()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<UserRank | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'weekly'>('all')

  useEffect(() => {
    fetchLeaderboard()
    if (address) fetchUserRank()
  }, [address])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard?limit=50')
      const data = await res.json()
      if (Array.isArray(data)) {
        setLeaderboard(data)
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserRank = async () => {
    if (!address) return
    try {
      const res = await fetch(`/api/leaderboard/rank?address=${address}`)
      const data = await res.json()
      if (data.rank !== undefined) {
        setUserRank(data)
      }
    } catch (err) {
      console.error('Failed to fetch user rank:', err)
    }
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border-[#FFD700]/50'
    if (rank === 2) return 'bg-gradient-to-r from-[#C0C0C0]/20 to-[#A0A0A0]/20 border-[#C0C0C0]/50'
    if (rank === 3) return 'bg-gradient-to-r from-[#CD7F32]/20 to-[#B87333]/20 border-[#CD7F32]/50'
    return 'bg-[#001226] border-[#0A5CDD]/20'
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full pb-20 items-center justify-center">
        <div className="animate-spin text-4xl mb-4">🏆</div>
        <p className="text-[#6B7280]">Loading rankings...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Header */}
      <div className="bg-[#001226] border-b border-[#0A5CDD]/20 p-4">
        <h1 className="text-xl font-bold text-white text-center mb-1">🏆 Leaderboard</h1>
        <p className="text-[#6B7280] text-xs text-center">Top Scientists on Base</p>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 justify-center">
          {['all', 'weekly'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as 'all' | 'weekly')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-[#0A5CDD] text-white'
                  : 'bg-[#1F2937] text-[#6B7280]'
              }`}
            >
              {filter === 'all' ? 'All Time' : 'This Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="px-4 py-6 bg-gradient-to-b from-[#001226] to-transparent">
          <div className="flex justify-center items-end gap-2">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C0C0C0] to-[#808080] rounded-full flex items-center justify-center text-2xl mb-2 shadow-lg">
                🥈
              </div>
              <p className="text-white text-xs font-medium truncate max-w-[80px]">
                {leaderboard[1]?.username || formatAddress(leaderboard[1]?.address || '')}
              </p>
              <p className="text-[#0A5CDD] text-sm font-bold">{leaderboard[1]?.points.toLocaleString()}</p>
              <div className="w-16 h-16 bg-[#C0C0C0]/20 rounded-t-lg mt-2" />
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center -mt-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center text-3xl mb-2 shadow-xl animate-pulse">
                🥇
              </div>
              <p className="text-white text-sm font-bold truncate max-w-[90px]">
                {leaderboard[0]?.username || formatAddress(leaderboard[0]?.address || '')}
              </p>
              <p className="text-[#FFD700] text-lg font-bold">{leaderboard[0]?.points.toLocaleString()}</p>
              <div className="w-20 h-24 bg-[#FFD700]/20 rounded-t-lg mt-2" />
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#CD7F32] to-[#8B4513] rounded-full flex items-center justify-center text-2xl mb-2 shadow-lg">
                🥉
              </div>
              <p className="text-white text-xs font-medium truncate max-w-[80px]">
                {leaderboard[2]?.username || formatAddress(leaderboard[2]?.address || '')}
              </p>
              <p className="text-[#CD7F32] text-sm font-bold">{leaderboard[2]?.points.toLocaleString()}</p>
              <div className="w-16 h-12 bg-[#CD7F32]/20 rounded-t-lg mt-2" />
            </div>
          </div>
        </div>
      )}

      {/* Rankings List */}
      <div className="flex-1 overflow-auto px-4">
        <p className="text-[#6B7280] text-xs mb-3">
          {leaderboard.length > 0 ? `${leaderboard.length} Scientists Ranked` : 'No rankings yet'}
        </p>
        
        <div className="space-y-2">
          {leaderboard.slice(3).map((player) => (
            <div
              key={player.address}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                address?.toLowerCase() === player.address
                  ? 'bg-[#0A5CDD]/20 border-[#0A5CDD]/50'
                  : 'bg-[#001226] border-[#0A5CDD]/20'
              }`}
            >
              <span className="text-[#6B7280] font-mono text-sm w-8">
                #{player.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {player.username || formatAddress(player.address)}
                </p>
                <div className="flex gap-2 text-xs text-[#6B7280]">
                  <span>Lv.{player.level}</span>
                  <span>•</span>
                  <span>{player.totalMints} mints</span>
                </div>
              </div>
              <p className="text-[#0A5CDD] font-bold">{player.points.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🧪</p>
            <p className="text-[#6B7280]">No scientists ranked yet</p>
            <p className="text-[#4B5563] text-xs mt-1">Be the first to mint!</p>
          </div>
        )}
      </div>

      {/* Your Rank (Sticky Footer) */}
      {userRank && userRank.rank && (
        <div className="px-4 pb-4 pt-2 bg-gradient-to-t from-[#000814] to-transparent">
          <div className="bg-[#0A5CDD]/20 border border-[#0A5CDD]/50 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0A5CDD] rounded-full flex items-center justify-center text-lg">
                {userRank.rank <= 3 ? getRankDisplay(userRank.rank) : '👤'}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">Your Rank</p>
                <div className="flex gap-2 text-xs text-[#6B7280]">
                  <span>Top {userRank.percentile}%</span>
                  <span>•</span>
                  <span>Lv.{userRank.level}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#0A5CDD] font-bold text-lg">#{userRank.rank}</p>
                <p className="text-[#6B7280] text-xs">{userRank.points.toLocaleString()} pts</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
EOF

echo "✅ components/game/Leaderboard.tsx"

# ============================================
# 2. UPDATED PROFILE COMPONENT
# ============================================
cat > components/game/Profile.tsx << 'EOF'
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { BADGES, RARITY_COLORS, RARITY_GLOW, type Rarity } from '@/lib/gameData'

interface Discovery {
  formula: string
  name: string
  rarity: Rarity
  points: number
  txHash?: string
  mintedAt: string
}

interface UserData {
  address: string
  username?: string
  fid?: number
  points: number
  level: number
  streak: number
  totalMints: number
  discoveries: Discovery[]
  badges: string[]
}

interface ProfileProps {
  farcasterUser?: {
    fid?: number
    username?: string
    displayName?: string
    pfpUrl?: string
  }
}

type TabType = 'nfts' | 'badges' | 'stats'

export function Profile({ farcasterUser }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>('nfts')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { address } = useAccount()

  useEffect(() => {
    if (address) {
      fetchUserData()
    } else {
      setIsLoading(false)
    }
  }, [address])

  const fetchUserData = async () => {
    if (!address) return
    try {
      const res = await fetch(`/api/user?address=${address}`)
      if (res.ok) {
        const data = await res.json()
        setUserData(data)
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'nfts' as const, label: '🧪 NFTs', count: userData?.discoveries?.length || 0 },
    { id: 'badges' as const, label: '🏅 Badges', count: userData?.badges?.length || 0 },
    { id: 'stats' as const, label: '📊 Stats' },
  ]

  const level = userData?.level || 1
  const points = userData?.points || 0
  const nextLevelPoints = level * 1000
  const progress = ((points % 1000) / 1000) * 100

  const displayName = farcasterUser?.displayName || farcasterUser?.username || 
    (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not Connected')

  if (isLoading) {
    return (
      <div className="flex flex-col h-full pb-20 items-center justify-center">
        <div className="animate-spin text-4xl mb-4">🧬</div>
        <p className="text-[#6B7280]">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Profile Header */}
      <div className="bg-[#001226] border-b border-[#0A5CDD]/20 p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            {farcasterUser?.pfpUrl ? (
              <img 
                src={farcasterUser.pfpUrl} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover border-2 border-[#0A5CDD]"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-[#0A5CDD] to-[#2563EB] rounded-full flex items-center justify-center text-2xl">
                🧬
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-[#0A5CDD] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {level}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <p className="text-white font-bold text-lg">{displayName}</p>
            {farcasterUser?.fid && (
              <p className="text-[#6B7280] text-xs">FID: {farcasterUser.fid}</p>
            )}
            <p className="text-[#0A5CDD] text-sm font-medium">
              {level < 5 ? 'Apprentice' : level < 10 ? 'Scientist' : level < 20 ? 'Expert' : 'Master'} Chemist
            </p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#6B7280]">Level {level}</span>
            <span className="text-[#6B7280]">{points.toLocaleString()} / {nextLevelPoints.toLocaleString()} XP</span>
          </div>
          <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#0A5CDD] to-[#22C55E] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1 bg-[#0A0A0A] rounded-xl p-3 text-center">
            <p className="text-[#0A5CDD] text-xl font-bold">{userData?.totalMints || 0}</p>
            <p className="text-[#6B7280] text-xs">Minted</p>
          </div>
          <div className="flex-1 bg-[#0A0A0A] rounded-xl p-3 text-center">
            <p className="text-[#22C55E] text-xl font-bold">{userData?.streak || 0}</p>
            <p className="text-[#6B7280] text-xs">Streak</p>
          </div>
          <div className="flex-1 bg-[#0A0A0A] rounded-xl p-3 text-center">
            <p className="text-[#F59E0B] text-xl font-bold">{userData?.badges?.length || 0}</p>
            <p className="text-[#6B7280] text-xs">Badges</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#0A5CDD]/20">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id 
                ? 'text-[#0A5CDD] border-b-2 border-[#0A5CDD]' 
                : 'text-[#6B7280]'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 text-xs bg-[#0A5CDD]/20 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* NFTs Tab */}
        {activeTab === 'nfts' && (
          <div>
            {!userData?.discoveries?.length ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">🧪</p>
                <p className="text-white font-medium mb-1">No molecules yet</p>
                <p className="text-[#6B7280] text-sm">Create compounds in the Lab to mint NFTs!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {userData.discoveries.map((compound, index) => (
                  <div 
                    key={index} 
                    className="bg-[#001226] border rounded-xl p-4 text-center transition-all hover:scale-105"
                    style={{ 
                      borderColor: `${RARITY_COLORS[compound.rarity]}50`,
                      boxShadow: RARITY_GLOW[compound.rarity]
                    }}
                  >
                    <div 
                      className="text-3xl mb-2"
                      style={{ textShadow: RARITY_GLOW[compound.rarity] }}
                    >
                      {compound.rarity === 'legendary' ? '👑' : 
                       compound.rarity === 'epic' ? '🔮' : 
                       compound.rarity === 'rare' ? '💎' : '⚗️'}
                    </div>
                    <p className="text-white font-mono font-bold text-lg">{compound.formula}</p>
                    <p className="text-[#6B7280] text-xs truncate">{compound.name}</p>
                    <p 
                      className="text-xs mt-2 font-medium uppercase"
                      style={{ color: RARITY_COLORS[compound.rarity] }}
                    >
                      {compound.rarity}
                    </p>
                    <p className="text-[#6B7280] text-xs mt-1">+{compound.points} pts</p>
                    {compound.txHash && (
                      <a
                        href={`https://basescan.org/tx/${compound.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0A5CDD] text-xs mt-2 inline-block hover:underline"
                      >
                        View TX ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-3">
            {BADGES.map(badge => {
              const isEarned = userData?.badges?.includes(badge.id)
              return (
                <div 
                  key={badge.id} 
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    isEarned 
                      ? 'bg-[#001226] border-[#22C55E]/50' 
                      : 'bg-[#0a0a0a] border-[#1F2937] opacity-50'
                  }`}
                >
                  <span className={`text-3xl ${isEarned ? '' : 'grayscale'}`}>{badge.icon}</span>
                  <div className="flex-1">
                    <p className={`font-medium ${isEarned ? 'text-white' : 'text-[#6B7280]'}`}>
                      {badge.name}
                    </p>
                    <p className="text-xs text-[#6B7280]">{badge.requirement}</p>
                  </div>
                  {isEarned ? (
                    <span className="text-[#22C55E] text-xl">✓</span>
                  ) : (
                    <span className="text-[#6B7280]">🔒</span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="bg-[#001226] border border-[#0A5CDD]/20 rounded-xl p-4">
              <p className="text-[#6B7280] text-xs mb-3">OVERVIEW</p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Total Points</span>
                  <span className="text-white font-bold">{points.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Total Mints</span>
                  <span className="text-white font-bold">{userData?.totalMints || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Current Streak</span>
                  <span className="text-white font-bold">{userData?.streak || 0} 🔥</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Badges Earned</span>
                  <span className="text-white font-bold">{userData?.badges?.length || 0} / {BADGES.length}</span>
                </div>
              </div>
            </div>

            {/* Rarity Breakdown */}
            <div className="bg-[#001226] border border-[#0A5CDD]/20 rounded-xl p-4">
              <p className="text-[#6B7280] text-xs mb-3">RARITY BREAKDOWN</p>
              {(['legendary', 'epic', 'rare', 'common'] as Rarity[]).map(rarity => {
                const count = userData?.discoveries?.filter(d => d.rarity === rarity).length || 0
                return (
                  <div key={rarity} className="flex items-center gap-3 py-2">
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: RARITY_COLORS[rarity] }}
                    />
                    <span className="flex-1 text-[#6B7280] capitalize">{rarity}</span>
                    <span className="text-white font-bold">{count}</span>
                  </div>
                )
              })}
            </div>

            {/* Recent Activity */}
            <div className="bg-[#001226] border border-[#0A5CDD]/20 rounded-xl p-4">
              <p className="text-[#6B7280] text-xs mb-3">RECENT MINTS</p>
              {userData?.discoveries?.slice(0, 5).map((d, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-[#1F2937] last:border-0">
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: RARITY_COLORS[d.rarity] }}
                  />
                  <span className="flex-1 text-white text-sm">{d.name}</span>
                  <span className="text-[#6B7280] text-xs">+{d.points}</span>
                </div>
              )) || <p className="text-[#6B7280] text-sm">No mints yet</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
EOF

echo "✅ components/game/Profile.tsx"

# ============================================
# 3. UPDATED APP.TSX WITH API SYNC
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

// Farcaster SDK hook with fallback
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
          
          // Extract Farcaster user info
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

  // Calculate level from points
  const level = Math.floor(points / 1000) + 1

  // Fetch user data from API on connect
  const fetchUserData = useCallback(async () => {
    if (!address) return
    
    try {
      // Create/update user with Farcaster info
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          fid: farcasterUser?.fid,
          username: farcasterUser?.username || farcasterUser?.displayName,
        })
      })

      // Fetch user data
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
      // Optimistic update
      setPoints(prev => prev + compound.points)
      setStreak(prev => prev + 1)
    } else if (!success && address) {
      // Reset streak on failed reaction
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
    // Add to discoveries locally
    const newDiscovery = {
      ...compound,
      txHash,
      mintedAt: new Date().toISOString()
    }
    setDiscoveries(prev => [newDiscovery, ...prev])
    
    // Refresh user data to get updated badges
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
        {/* Header */}
        <Header 
          points={points} 
          streak={streak} 
          level={level}
          username={farcasterUser?.displayName || farcasterUser?.username}
          pfpUrl={farcasterUser?.pfpUrl}
        />
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {screen === 'lab' && (
            <GameArena 
              points={points} 
              streak={streak} 
              onReaction={handleReaction}
              onMintSuccess={handleMintSuccess}
            />
          )}
          {screen === 'ranks' && <Leaderboard />}
          {screen === 'profile' && <Profile farcasterUser={farcasterUser} />}
        </div>
        
        {/* Navbar */}
        <Navbar 
          activeTab={screen === 'lab' ? 'lab' : screen === 'ranks' ? 'ranks' : 'profile'} 
          onTabChange={(tab) => setScreen(tab)} 
        />
      </div>
    </SafeAreaContainer>
  )
}
EOF

echo "✅ components/pages/app.tsx"

# ============================================
# 4. UPDATE INDEX EXPORT
# ============================================
cat > components/game/index.ts << 'EOF'
export { SplashScreen } from './SplashScreen'
export { Navbar } from './Navbar'
export { GameArena } from './GameArena'
export { Profile } from './Profile'
export { Leaderboard } from './Leaderboard'
export { Header } from './Header'
EOF

echo "✅ components/game/index.ts"

# ============================================
# 5. UPDATED HEADER WITH AVATAR SUPPORT
# ============================================
cat > components/game/Header.tsx << 'EOF'
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
EOF

echo "✅ components/game/Header.tsx"

echo ""
echo "==================================================="
echo "🎉 Phase 5 Complete!"
echo "==================================================="
echo ""
echo "Files created/updated:"
echo "  ├── components/game/Leaderboard.tsx  (NEW - live rankings)"
echo "  ├── components/game/Profile.tsx      (Updated - API data)"
echo "  ├── components/game/Header.tsx       (Updated - avatar support)"
echo "  ├── components/game/index.ts         (Updated exports)"
echo "  └── components/pages/app.tsx         (Updated - state sync)"
echo ""
echo "Features:"
echo "  ✅ Live leaderboard from /api/leaderboard"
echo "  ✅ Top 3 podium display"
echo "  ✅ Your rank sticky footer"
echo "  ✅ Profile with real NFT gallery"
echo "  ✅ Rarity breakdown stats"
echo "  ✅ Farcaster username + avatar display"
echo "  ✅ Level progress bar"
echo "  ✅ State syncs with database on load"
echo "  ✅ Streak resets on failed reactions"
echo ""
echo "Run: chmod +x phase5-profile-leaderboard.sh && ./phase5-profile-leaderboard.sh"