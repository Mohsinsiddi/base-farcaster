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
