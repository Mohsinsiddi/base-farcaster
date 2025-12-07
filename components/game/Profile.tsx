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
