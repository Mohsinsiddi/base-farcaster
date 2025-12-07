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
