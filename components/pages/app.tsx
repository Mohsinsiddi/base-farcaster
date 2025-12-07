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
