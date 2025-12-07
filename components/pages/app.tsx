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
