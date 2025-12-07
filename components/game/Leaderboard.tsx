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
