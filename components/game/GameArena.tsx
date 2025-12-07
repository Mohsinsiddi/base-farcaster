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
