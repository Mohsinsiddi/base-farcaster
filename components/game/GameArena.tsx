'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useMintMolecule } from '@/lib/hooks/useContract'
import { ElementPicker } from './ElementPicker'
import { ATOMS, COMPOUNDS, checkCompound, formatFormula, findPartialMatches, predictStableCompounds, RARITY_COLORS, RARITY_GLOW, RARITY_LABELS, generateTokenURI, type RolledCompound, type Rarity } from '@/lib/gameData'

interface GameArenaProps {
  points: number
  streak: number
  onReaction: (success: boolean, compound: RolledCompound | null) => void
  onMintSuccess?: (compound: RolledCompound, txHash: string) => void
  recentDiscoveries?: string[]
}

type GameState = 'idle' | 'reacting' | 'reveal' | 'minting' | 'success' | 'failed'

const MIXING_GIF = 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDc1aTEydHkwMTF0bHdiNWJmaGR3dG11NXBrYzFma2o5djY5cThpcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lUpphqmQnj4TVC/giphy.gif'
const getRarityIcon = (r: Rarity) => ({ common: '⚗️', uncommon: '✨', rare: '💎', epic: '🔮', legendary: '👑', mythic: '⚡' }[r])

export function GameArena({ points, streak, onReaction, onMintSuccess, recentDiscoveries = [] }: GameArenaProps) {
  const [selectedAtoms, setSelectedAtoms] = useState<string[]>([])
  const [gameState, setGameState] = useState<GameState>('idle')
  const [result, setResult] = useState<RolledCompound | null>(null)
  const [showRarityReveal, setShowRarityReveal] = useState(false)
  const [revealedRarity, setRevealedRarity] = useState<Rarity | null>(null)
  const [isNewDiscovery, setIsNewDiscovery] = useState(false)
  const [bubbleKey, setBubbleKey] = useState(0)

  const { address, isConnected } = useAccount()
  const { mint, hash, isPending, isConfirming, isSuccess, error, reset } = useMintMolecule()

  const atomCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    selectedAtoms.forEach(a => { counts[a] = (counts[a] || 0) + 1 })
    return counts
  }, [selectedAtoms])

  const uniqueElements = Object.keys(atomCounts)
  const exactMatch = useMemo(() => COMPOUNDS.find(c => {
    const k1 = Object.keys(c.atoms).sort(), k2 = Object.keys(atomCounts).sort()
    if (k1.length !== k2.length) return false
    return k1.every(k => c.atoms[k] === atomCounts[k])
  }), [atomCounts])

  // Smart predictions based on selected elements
  const stableCompounds = useMemo(() => predictStableCompounds(uniqueElements).slice(0, 6), [uniqueElements])
  const partialMatches = useMemo(() => findPartialMatches(atomCounts).slice(0, 3), [atomCounts])

  useEffect(() => { setBubbleKey(prev => prev + 1) }, [selectedAtoms.length])
  useEffect(() => { if (isSuccess && hash && result) { setGameState('success'); saveMintToDatabase(result, hash); onMintSuccess?.(result, hash) } }, [isSuccess, hash, result])
  useEffect(() => { if (error) setGameState('reveal') }, [error])

  const saveMintToDatabase = async (compound: RolledCompound, txHash: string) => {
    try { await fetch('/api/mint', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address, formula: compound.formula, name: compound.name, rarity: compound.rarity, points: compound.points, txHash }) }) } catch (err) { console.error(err) }
  }

  const addAtom = (symbol: string) => { if (selectedAtoms.length < 30 && gameState === 'idle') setSelectedAtoms([...selectedAtoms, symbol]) }
  const removeAtom = (symbol: string) => {
    if (gameState !== 'idle') return
    const idx = selectedAtoms.lastIndexOf(symbol)
    if (idx !== -1) setSelectedAtoms([...selectedAtoms.slice(0, idx), ...selectedAtoms.slice(idx + 1)])
  }
  const clearAtoms = () => { setSelectedAtoms([]); setResult(null); setGameState('idle'); setShowRarityReveal(false); setRevealedRarity(null); setIsNewDiscovery(false); reset() }
  const quickFill = (atoms: Record<string, number>) => {
    if (gameState !== 'idle') return
    const arr: string[] = []
    Object.entries(atoms).forEach(([s, c]) => { for (let i = 0; i < c; i++) arr.push(s) })
    setSelectedAtoms(arr)
  }

  const handleReact = () => {
    if (selectedAtoms.length === 0) return
    setGameState('reacting')
    setTimeout(() => {
      const compound = checkCompound(selectedAtoms)
      setResult(compound)
      if (compound) {
        setIsNewDiscovery(!recentDiscoveries.includes(compound.formula))
        setGameState('reveal')
        animateRarityReveal(compound.rarity)
        onReaction(true, compound)
      } else {
        setGameState('failed')
        onReaction(false, null)
      }
    }, 2500)
  }

  const animateRarityReveal = (finalRarity: Rarity) => {
    setShowRarityReveal(true)
    const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']
    let i = 0
    const interval = setInterval(() => {
      i++
      setRevealedRarity(rarities[Math.floor(Math.random() * rarities.length)])
      if (i >= 20) { clearInterval(interval); setRevealedRarity(finalRarity) }
    }, 80)
  }

  const handleMint = async () => {
    if (!result || !isConnected || !address) return
    setGameState('minting')
    await mint(result.formula, result.name, result.rarity, result.points, generateTokenURI(result.formula, result.name, result.rarity, result.points))
  }

  const streakMultiplier = streak >= 10 ? 1.5 : streak >= 5 ? 1.25 : streak >= 3 ? 1.1 : 1.0
  const liquidHeight = Math.min(selectedAtoms.length * 3, 60)
  const liquidColor = exactMatch ? RARITY_COLORS[exactMatch.rarity] : '#0A5CDD'

  return (
    <div className="flex flex-col h-full pb-20">
      {streak >= 3 && (
        <div className="mx-4 mt-2 py-2 px-4 rounded-xl text-center text-sm font-bold" style={{ background: `linear-gradient(90deg, ${RARITY_COLORS.legendary}20, transparent)`, color: RARITY_COLORS.legendary }}>
          {streak >= 10 ? '🔥 UNSTOPPABLE' : streak >= 5 ? '⚡ ON FIRE' : '✨ WARMING UP'} • {streakMultiplier}x
        </div>
      )}

      <div className="flex-1 p-4 overflow-auto space-y-4">
        {/* Test Tube + Chamber */}
        <div className="bg-[#001226] border border-[#0A5CDD]/30 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex gap-4">
            {/* Test Tube SVG */}
            <div className="flex-shrink-0">
              <svg width="60" height="140" viewBox="0 0 60 140">
                <defs>
                  <linearGradient id="tubeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0A5CDD" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#0A5CDD" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#0A5CDD" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={liquidColor} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={liquidColor} stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                
                {/* Tube outline */}
                <path d="M15 8 L15 100 Q15 130 30 130 Q45 130 45 100 L45 8" fill="url(#tubeGradient)" stroke="#0A5CDD" strokeWidth="2" />
                
                {/* Liquid */}
                {selectedAtoms.length > 0 && (
                  <path d={`M17 ${120 - liquidHeight} L17 100 Q17 128 30 128 Q43 128 43 100 L43 ${120 - liquidHeight}`} fill="url(#liquidGradient)">
                    <animate attributeName="d" values={`M17 ${120 - liquidHeight} L17 100 Q17 128 30 128 Q43 128 43 100 L43 ${120 - liquidHeight};M17 ${118 - liquidHeight} L17 100 Q17 128 30 128 Q43 128 43 100 L43 ${122 - liquidHeight};M17 ${120 - liquidHeight} L17 100 Q17 128 30 128 Q43 128 43 100 L43 ${120 - liquidHeight}`} dur="2s" repeatCount="indefinite" />
                  </path>
                )}
                
                {/* Bubbles */}
                {selectedAtoms.length > 0 && [0,1,2,3,4].map(i => (
                  <circle key={`${bubbleKey}-${i}`} cx={20 + Math.random() * 20} cy="120" r={2 + Math.random() * 3} fill={liquidColor} opacity="0.6">
                    <animate attributeName="cy" values={`120;${50 + Math.random() * 30};120`} dur={`${1.5 + Math.random()}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
                    <animate attributeName="opacity" values="0.6;0.8;0" dur={`${1.5 + Math.random()}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
                  </circle>
                ))}
                
                {/* Cork */}
                <rect x="12" y="2" width="36" height="10" rx="3" fill="#8B4513" />
              </svg>
            </div>

            {/* Formula + Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-3xl font-mono font-bold mb-2">{selectedAtoms.length > 0 ? formatFormula(atomCounts) : '—'}</p>
              
              {exactMatch ? (
                <div>
                  <p className="text-[#22C55E] font-bold">{exactMatch.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm px-2 py-0.5 rounded-full" style={{ backgroundColor: RARITY_COLORS[exactMatch.rarity] + '30', color: RARITY_COLORS[exactMatch.rarity] }}>
                      {getRarityIcon(exactMatch.rarity)} {RARITY_LABELS[exactMatch.rarity]}
                    </span>
                    <span className="text-[#0A5CDD] font-bold text-sm">{exactMatch.points} pts</span>
                  </div>
                  <p className="text-[#6B7280] text-xs mt-2">{exactMatch.description}</p>
                </div>
              ) : selectedAtoms.length > 0 ? (
                <p className="text-[#DC2626] text-sm">Unknown compound</p>
              ) : (
                <p className="text-[#6B7280] text-sm">Select elements to build</p>
              )}

              {/* Selected atom pills */}
              {Object.keys(atomCounts).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {Object.entries(atomCounts).map(([symbol, count]) => {
                    const atom = ATOMS.find(a => a.symbol === symbol)!
                    return (
                      <button key={symbol} onClick={() => removeAtom(symbol)} disabled={gameState !== 'idle'} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80" style={{ backgroundColor: atom.bg, color: atom.text }}>
                        {symbol}{count > 1 && <span>×{count}</span>}
                        {gameState === 'idle' && <span className="ml-0.5 opacity-70">×</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Overlays */}
          {gameState === 'reacting' && (
            <div className="absolute inset-0 bg-[#000814]/95 rounded-2xl flex flex-col items-center justify-center z-10">
              <img src={MIXING_GIF} className="w-24 h-24 object-cover rounded-xl mb-3" alt="Mixing" />
              <p className="text-[#0A5CDD] animate-pulse font-bold">Reacting...</p>
            </div>
          )}

          {(gameState === 'reveal' || gameState === 'minting' || gameState === 'success') && result && showRarityReveal && (
            <div className="absolute inset-0 bg-[#000814]/95 rounded-2xl flex flex-col items-center justify-center z-10">
              {isNewDiscovery && gameState === 'reveal' && <div className="absolute top-3 right-3 bg-[#22C55E] text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">✨ NEW!</div>}
              <div className="text-5xl mb-2" style={{ filter: revealedRarity === result.rarity ? `drop-shadow(${RARITY_GLOW[revealedRarity]})` : 'none' }}>{getRarityIcon(revealedRarity || 'common')}</div>
              <p className="text-xl font-black" style={{ color: revealedRarity ? RARITY_COLORS[revealedRarity] : '#fff' }}>{RARITY_LABELS[revealedRarity || 'common']}</p>
              <p className="text-white text-lg font-bold mt-1">{result.name}</p>
              <p className="text-[#6B7280] font-mono text-sm">{result.formula}</p>
              {revealedRarity === result.rarity && <p className="text-lg font-black mt-2 animate-bounce" style={{ color: RARITY_COLORS[result.rarity] }}>+{Math.floor(result.points * streakMultiplier)} pts</p>}
            </div>
          )}

          {gameState === 'failed' && (
            <div className="absolute inset-0 bg-[#000814]/95 rounded-2xl flex flex-col items-center justify-center z-10">
              <div className="text-5xl mb-2">💨</div>
              <p className="text-[#DC2626] font-bold text-lg">No stable compound!</p>
              <p className="text-[#6B7280] text-xs mt-1">Try a different combination</p>
            </div>
          )}
        </div>

        {/* Smart Predictions */}
        {gameState === 'idle' && uniqueElements.length > 0 && !exactMatch && (
          <div className="bg-[#001226]/50 border border-[#0A5CDD]/20 rounded-xl p-3">
            <p className="text-[#6B7280] text-xs mb-2 flex items-center gap-1">
              <span>🧠</span> STABLE COMPOUNDS WITH {uniqueElements.join(' + ')}
            </p>
            {stableCompounds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stableCompounds.map(c => (
                  <button key={c.formula} onClick={() => quickFill(c.atoms)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0A0A0A] border border-[#1F2937] rounded-lg hover:border-[#0A5CDD] transition-colors">
                    <span className="text-white text-sm font-mono">{c.formula}</span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RARITY_COLORS[c.rarity] }} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[#DC2626] text-xs">No known stable compounds with only these elements</p>
            )}
          </div>
        )}

        {/* Partial matches */}
        {gameState === 'idle' && partialMatches.length > 0 && !exactMatch && selectedAtoms.length > 0 && (
          <div className="bg-[#001226]/50 border border-[#0A5CDD]/20 rounded-xl p-3">
            <p className="text-[#6B7280] text-xs mb-2">💡 BUILDING TOWARDS</p>
            <div className="flex flex-wrap gap-2">
              {partialMatches.map(c => {
                const totalNeeded = Object.values(c.atoms).reduce((a, b) => a + b, 0)
                const totalHave = Object.entries(atomCounts).reduce((s, [a, n]) => s + Math.min(n, c.atoms[a] || 0), 0)
                const pct = Math.round((totalHave / totalNeeded) * 100)
                return (
                  <button key={c.formula} onClick={() => quickFill(c.atoms)} className="flex items-center gap-2 px-2.5 py-1.5 bg-[#0A0A0A] border border-[#1F2937] rounded-lg hover:border-[#0A5CDD]">
                    <span className="text-white text-sm font-mono">{c.formula}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: RARITY_COLORS[c.rarity] + '30', color: RARITY_COLORS[c.rarity] }}>{pct}%</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick Start */}
        {gameState === 'idle' && selectedAtoms.length === 0 && (
          <div className="text-center">
            <p className="text-[#6B7280] text-xs mb-2">QUICK START</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {[{ f: 'H₂O', a: { H: 2, O: 1 } }, { f: 'NaCl', a: { Na: 1, Cl: 1 } }, { f: 'CO₂', a: { C: 1, O: 2 } }, { f: 'AuCl₃', a: { Au: 1, Cl: 3 } }].map(q => (
                <button key={q.f} onClick={() => quickFill(q.a)} className="px-3 py-2 bg-[#001226] border border-[#0A5CDD]/30 rounded-lg hover:border-[#0A5CDD]">
                  <span className="text-white font-mono text-sm">{q.f}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Success */}
        {gameState === 'success' && result && hash && (
          <div className="p-4 rounded-xl text-center border" style={{ backgroundColor: `${RARITY_COLORS[result.rarity]}15`, borderColor: `${RARITY_COLORS[result.rarity]}50` }}>
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-white font-bold text-lg">NFT Minted!</p>
            <a href={`https://basescan.org/tx/${hash}`} target="_blank" className="inline-block mt-3 bg-[#0A5CDD] text-white px-4 py-2 rounded-lg text-sm font-medium">View on BaseScan ↗</a>
          </div>
        )}

        {gameState === 'minting' && (
          <div className="p-4 rounded-xl text-center bg-[#0A5CDD]/20 border border-[#0A5CDD]/50">
            <div className="text-2xl mb-2 animate-spin">⚛️</div>
            <p className="text-[#0A5CDD] font-medium">{isPending ? 'Confirm in wallet...' : 'Confirming...'}</p>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="px-4 pb-4 space-y-3">
        <ElementPicker onSelectAtom={addAtom} selectedCounts={atomCounts} disabled={gameState !== 'idle'} />
        
        <div className="flex gap-3">
          <button onClick={clearAtoms} disabled={selectedAtoms.length === 0 && gameState === 'idle'} className="flex-1 bg-[#1F2937] text-white py-3.5 rounded-xl font-medium border border-[#374151] active:scale-95 disabled:opacity-50">🗑 Clear</button>
          
          {gameState === 'idle' && (
            <button onClick={handleReact} disabled={selectedAtoms.length === 0} className={`flex-[2] py-3.5 rounded-xl font-bold text-lg shadow-lg active:scale-95 disabled:opacity-50 ${exactMatch ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A]' : 'bg-gradient-to-r from-[#0A5CDD] to-[#2563EB]'} text-white`}>
              {exactMatch ? '✨ REACT!' : '🔥 REACT!'}
            </button>
          )}
          {gameState === 'reveal' && result && <button onClick={handleMint} disabled={!isConnected} className="flex-[2] bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white py-3.5 rounded-xl font-bold text-lg active:scale-95 disabled:opacity-50">{isConnected ? '🎉 MINT NFT' : '🔗 Connect'}</button>}
          {gameState === 'failed' && <button onClick={clearAtoms} className="flex-[2] bg-gradient-to-r from-[#0A5CDD] to-[#2563EB] text-white py-3.5 rounded-xl font-bold text-lg">🔄 Try Again</button>}
          {gameState === 'success' && <button onClick={clearAtoms} className="flex-[2] bg-gradient-to-r from-[#0A5CDD] to-[#2563EB] text-white py-3.5 rounded-xl font-bold text-lg">🧪 New Reaction</button>}
          {(gameState === 'reacting' || gameState === 'minting') && <button disabled className="flex-[2] bg-[#374151] text-white py-3.5 rounded-xl font-bold text-lg opacity-70">{gameState === 'reacting' ? '⚛️ Mixing...' : '⏳ Minting...'}</button>}
        </div>
      </div>
    </div>
  )
}
