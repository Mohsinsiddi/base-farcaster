'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useMintMolecule, MOLECULE_NFT_ADDRESS } from '@/lib/hooks/useContract'
import { 
  ATOMS, 
  checkCompound, 
  formatFormula, 
  RARITY_COLORS, 
  RARITY_GLOW,
  generateTokenURI,
  type RolledCompound,
  type Rarity
} from '@/lib/gameData'

interface GameArenaProps {
  points: number
  streak: number
  onReaction: (success: boolean, compound: RolledCompound | null) => void
  onMintSuccess?: (compound: RolledCompound, txHash: string) => void
}

type GameState = 'idle' | 'reacting' | 'reveal' | 'minting' | 'success' | 'failed'

const MIXING_GIF = 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDc1aTEydHkwMTF0bHdiNWJmaGR3dG11NXBrYzFma2o5djY5cThpcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lUpphqmQnj4TVC/giphy.gif'

export function GameArena({ points, streak, onReaction, onMintSuccess }: GameArenaProps) {
  const [selectedAtoms, setSelectedAtoms] = useState<string[]>([])
  const [gameState, setGameState] = useState<GameState>('idle')
  const [result, setResult] = useState<RolledCompound | null>(null)
  const [showRarityReveal, setShowRarityReveal] = useState(false)
  const [revealedRarity, setRevealedRarity] = useState<Rarity | null>(null)

  const { address, isConnected } = useAccount()
  const { mint, hash, isPending, isConfirming, isSuccess, error, reset } = useMintMolecule()

  // Handle mint success
  useEffect(() => {
    if (isSuccess && hash && result) {
      setGameState('success')
      
      // Save to database
      saveMintToDatabase(result, hash)
      
      onMintSuccess?.(result, hash)
    }
  }, [isSuccess, hash, result])

  // Handle mint error
  useEffect(() => {
    if (error) {
      console.error('Mint error:', error)
      setGameState('reveal') // Go back to reveal state to retry
    }
  }, [error])

  const saveMintToDatabase = async (compound: RolledCompound, txHash: string) => {
    try {
      await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          formula: compound.formula,
          name: compound.name,
          rarity: compound.rarity,
          points: compound.points,
          txHash,
        })
      })
    } catch (err) {
      console.error('Failed to save mint:', err)
    }
  }

  const addAtom = (symbol: string) => {
    if (selectedAtoms.length < 24 && gameState === 'idle') {
      setSelectedAtoms([...selectedAtoms, symbol])
    }
  }

  const removeAtom = (index: number) => {
    if (gameState === 'idle') {
      setSelectedAtoms(selectedAtoms.filter((_, i) => i !== index))
    }
  }

  const clearAtoms = () => {
    setSelectedAtoms([])
    setResult(null)
    setGameState('idle')
    setShowRarityReveal(false)
    setRevealedRarity(null)
    reset()
  }

  const handleReact = () => {
    if (selectedAtoms.length === 0) return
    
    setGameState('reacting')
    
    // Show mixing animation for 2.5s
    setTimeout(() => {
      const compound = checkCompound(selectedAtoms)
      setResult(compound)
      
      if (compound) {
        // Start rarity reveal animation
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
    const rarities: Rarity[] = ['common', 'rare', 'epic', 'legendary']
    let iterations = 0
    const maxIterations = 15
    
    const interval = setInterval(() => {
      iterations++
      const randomRarity = rarities[Math.floor(Math.random() * rarities.length)]
      setRevealedRarity(randomRarity)
      
      if (iterations >= maxIterations) {
        clearInterval(interval)
        setRevealedRarity(finalRarity)
      }
    }, 100)
  }

  const handleMint = async () => {
    if (!result || !isConnected || !address) return
    
    setGameState('minting')
    
    const tokenURI = generateTokenURI(
      result.formula,
      result.name,
      result.rarity,
      result.points
    )
    
    await mint(
      result.formula,
      result.name,
      result.rarity,
      result.points,
      tokenURI
    )
  }

  const getAtomCount = () => {
    const count: Record<string, number> = {}
    selectedAtoms.forEach(atom => { count[atom] = (count[atom] || 0) + 1 })
    return count
  }

  const truncateHash = (hash: string) => 
    `${hash.slice(0, 6)}...${hash.slice(-4)}`

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Header Stats */}
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
        <div className="text-xs text-[#6B7280]">
          {isConnected ? `${address?.slice(0, 6)}...` : 'Not Connected'}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Molecular Workspace */}
        <div className="bg-[#001226] border border-[#0A5CDD]/30 rounded-2xl p-4 min-h-[200px] relative overflow-hidden">
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
                    disabled={gameState !== 'idle'}
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-transform active:scale-90 disabled:opacity-50"
                    style={{ 
                      backgroundColor: atomData.bgColor, 
                      color: atomData.color, 
                      boxShadow: `0 0 15px ${atomData.bgColor}50` 
                    }}
                  >
                    {atom}
                  </button>
                )
              })
            )}
          </div>

          {/* Reacting Overlay - Mixing GIF */}
          {gameState === 'reacting' && (
            <div className="absolute inset-0 bg-[#000814]/90 rounded-2xl flex flex-col items-center justify-center z-10">
              <img 
                src={MIXING_GIF} 
                alt="Mixing..." 
                className="w-32 h-32 object-cover rounded-xl mb-4"
              />
              <p className="text-[#0A5CDD] animate-pulse font-medium">Mixing molecules...</p>
            </div>
          )}

          {/* Rarity Reveal Overlay */}
          {(gameState === 'reveal' || gameState === 'minting' || gameState === 'success') && result && showRarityReveal && (
            <div className="absolute inset-0 bg-[#000814]/95 rounded-2xl flex flex-col items-center justify-center z-10">
              <div 
                className="text-6xl mb-4 transition-all duration-100"
                style={{ 
                  textShadow: revealedRarity ? RARITY_GLOW[revealedRarity] : 'none',
                  transform: gameState === 'reveal' && revealedRarity !== result.rarity ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {revealedRarity === 'legendary' ? '👑' : 
                 revealedRarity === 'epic' ? '🔮' : 
                 revealedRarity === 'rare' ? '💎' : '⚗️'}
              </div>
              
              <p 
                className="text-2xl font-bold mb-2 transition-colors duration-100"
                style={{ color: revealedRarity ? RARITY_COLORS[revealedRarity] : '#fff' }}
              >
                {revealedRarity?.toUpperCase()}
              </p>
              
              <p className="text-white text-xl font-medium mb-1">{result.name}</p>
              <p className="text-[#6B7280] text-sm mb-4">{result.formula}</p>
              
              {revealedRarity === result.rarity && (
                <p 
                  className="text-lg font-bold animate-bounce"
                  style={{ color: RARITY_COLORS[result.rarity] }}
                >
                  +{result.points} pts
                </p>
              )}
            </div>
          )}

          {/* Failed Overlay */}
          {gameState === 'failed' && (
            <div className="absolute inset-0 bg-[#000814]/90 rounded-2xl flex flex-col items-center justify-center z-10">
              <div className="text-6xl mb-4">💨</div>
              <p className="text-[#DC2626] font-bold text-xl">Unknown Compound</p>
              <p className="text-[#6B7280] text-sm mt-2">Try a different combination!</p>
            </div>
          )}
        </div>

        {/* Formula Display */}
        <div className="mt-4 text-center">
          <p className="text-[#6B7280] text-xs mb-1">FORMULA</p>
          <p className="text-white text-2xl font-mono font-bold">
            {selectedAtoms.length > 0 ? formatFormula(getAtomCount()) : '—'}
          </p>
        </div>

        {/* Success Result Card */}
        {gameState === 'success' && result && hash && (
          <div 
            className="mt-4 p-4 rounded-xl text-center border"
            style={{ 
              backgroundColor: `${RARITY_COLORS[result.rarity]}15`,
              borderColor: `${RARITY_COLORS[result.rarity]}50`
            }}
          >
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-white font-bold text-lg">NFT Minted!</p>
            <p 
              className="text-sm mt-1 font-medium"
              style={{ color: RARITY_COLORS[result.rarity] }}
            >
              {result.rarity.toUpperCase()} {result.name}
            </p>
            <a
              href={`https://basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-[#0A5CDD] text-sm underline"
            >
              View on BaseScan ↗
            </a>
            <p className="text-[#6B7280] text-xs mt-2">
              TX: {truncateHash(hash)}
            </p>
          </div>
        )}

        {/* Minting Status */}
        {gameState === 'minting' && (
          <div className="mt-4 p-4 rounded-xl text-center bg-[#0A5CDD]/20 border border-[#0A5CDD]/50">
            <div className="animate-spin text-2xl mb-2">⚛️</div>
            <p className="text-[#0A5CDD] font-medium">
              {isPending ? 'Confirm in wallet...' : isConfirming ? 'Confirming...' : 'Processing...'}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && gameState === 'reveal' && (
          <div className="mt-4 p-3 rounded-xl text-center bg-[#DC2626]/20 border border-[#DC2626]/50">
            <p className="text-[#DC2626] text-sm">
              {error.message.includes('rejected') ? 'Transaction rejected' : 'Mint failed. Try again.'}
            </p>
          </div>
        )}

        {/* Hint */}
        {gameState === 'idle' && (
          <div className="mt-4 flex items-center justify-center gap-2 text-[#6B7280] text-xs">
            <span>💡</span>
            <span>Try making Water (H₂O) or Salt (NaCl)</span>
          </div>
        )}
      </div>

      {/* Atom Palette */}
      <div className="px-4 pb-4">
        <div className="bg-[#001226] border border-[#0A5CDD]/30 rounded-2xl p-4">
          <p className="text-[#6B7280] text-xs mb-3 text-center">TAP TO ADD ATOMS</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {ATOMS.map(atom => (
              <button
                key={atom.symbol}
                onClick={() => addAtom(atom.symbol)}
                disabled={gameState !== 'idle'}
                className="w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold shadow-lg transition-all active:scale-90 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{ 
                  backgroundColor: atom.bgColor, 
                  color: atom.color, 
                  boxShadow: `0 4px 15px ${atom.bgColor}40` 
                }}
              >
                <span className="text-lg">{atom.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 flex gap-3">
        <button 
          onClick={clearAtoms} 
          className="flex-1 bg-[#1F2937] text-white py-3 rounded-xl font-medium text-sm border border-[#374151] active:scale-95 transition-transform"
        >
          🗑 Clear
        </button>
        
        {gameState === 'idle' && (
          <button
            onClick={handleReact}
            disabled={selectedAtoms.length === 0}
            className="flex-[2] bg-gradient-to-r from-[#0A5CDD] to-[#2563EB] text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0A5CDD]/30 active:scale-95 transition-transform"
          >
            🔥 REACT!
          </button>
        )}

        {gameState === 'reveal' && result && (
          <button
            onClick={handleMint}
            disabled={!isConnected}
            className="flex-[2] bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50 shadow-lg shadow-[#22C55E]/30 active:scale-95 transition-transform"
          >
            {isConnected ? '🎉 MINT NFT' : '🔗 Connect Wallet'}
          </button>
        )}

        {gameState === 'failed' && (
          <button
            onClick={clearAtoms}
            className="flex-[2] bg-gradient-to-r from-[#0A5CDD] to-[#2563EB] text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-[#0A5CDD]/30 active:scale-95 transition-transform"
          >
            🔄 Try Again
          </button>
        )}

        {gameState === 'success' && (
          <button
            onClick={clearAtoms}
            className="flex-[2] bg-gradient-to-r from-[#0A5CDD] to-[#2563EB] text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-[#0A5CDD]/30 active:scale-95 transition-transform"
          >
            🧪 New Reaction
          </button>
        )}

        {(gameState === 'reacting' || gameState === 'minting') && (
          <button
            disabled
            className="flex-[2] bg-[#374151] text-white py-3 rounded-xl font-bold text-lg opacity-50 cursor-not-allowed"
          >
            {gameState === 'reacting' ? '⚛️ Mixing...' : '⏳ Minting...'}
          </button>
        )}
      </div>
    </div>
  )
}
