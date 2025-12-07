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
