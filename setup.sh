#!/bin/bash

echo "🧪 Chain Reaction - Phase 4: Complete Mint Flow"
echo "================================================"

# Create directories
mkdir -p lib/hooks
mkdir -p app/api/mint
mkdir -p components/game

# ============================================
# 1. FARCASTER-COMPATIBLE CONTRACT HOOKS
# ============================================
cat > lib/hooks/useContract.ts << 'EOF'
import { useSendTransaction, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { encodeFunctionData } from 'viem'
import { useState, useCallback, useEffect } from 'react'

export const MOLECULE_NFT_ADDRESS = "0xb0a61F0dB0a24393DaaF5DE9A4164A22f79c49d6" as const

export const MOLECULE_NFT_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "formula", type: "string" },
      { name: "name", type: "string" },
      { name: "rarity", type: "string" },
      { name: "points", type: "uint256" },
      { name: "tokenURI_", type: "string" }
    ],
    name: "mint",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getMolecule",
    outputs: [
      {
        components: [
          { name: "formula", type: "string" },
          { name: "name", type: "string" },
          { name: "rarity", type: "string" },
          { name: "points", type: "uint256" },
          { name: "mintedAt", type: "uint256" }
        ],
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserTokens",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const

// ====================================
// FARCASTER-SAFE MINT HOOK
// Uses useSendTransaction instead of useWriteContract
// to avoid origin mismatch in frame context
// ====================================
export function useMintMolecule() {
  const { address } = useAccount()
  const [hash, setHash] = useState<`0x${string}` | undefined>()
  const [error, setError] = useState<Error | null>(null)
  
  const { sendTransaction, isPending } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash })

  const mint = useCallback(async (
    formula: string,
    name: string,
    rarity: string,
    points: number,
    tokenURI: string
  ) => {
    if (!address) {
      setError(new Error('Wallet not connected'))
      return
    }

    try {
      setError(null)
      
      // Encode the mint function call
      const data = encodeFunctionData({
        abi: MOLECULE_NFT_ABI,
        functionName: 'mint',
        args: [address, formula, name, rarity, BigInt(points), tokenURI]
      })

      // Send transaction using Farcaster-compatible method
      sendTransaction(
        {
          to: MOLECULE_NFT_ADDRESS,
          data,
        },
        {
          onSuccess: (txHash) => {
            setHash(txHash)
          },
          onError: (err) => {
            setError(err as Error)
          }
        }
      )
    } catch (err) {
      setError(err as Error)
    }
  }, [address, sendTransaction])

  const reset = useCallback(() => {
    setHash(undefined)
    setError(null)
  }, [])

  return { 
    mint, 
    hash, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error,
    receipt,
    reset 
  }
}

// Get User Tokens Hook
export function useUserTokens(address: `0x${string}` | undefined) {
  return useReadContract({
    address: MOLECULE_NFT_ADDRESS,
    abi: MOLECULE_NFT_ABI,
    functionName: 'getUserTokens',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })
}

// Get Molecule Data Hook
export function useMolecule(tokenId: bigint | undefined) {
  return useReadContract({
    address: MOLECULE_NFT_ADDRESS,
    abi: MOLECULE_NFT_ABI,
    functionName: 'getMolecule',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined }
  })
}

// Get Total Supply Hook
export function useTotalSupply() {
  return useReadContract({
    address: MOLECULE_NFT_ADDRESS,
    abi: MOLECULE_NFT_ABI,
    functionName: 'totalSupply',
  })
}
EOF

echo "✅ lib/hooks/useContract.ts - Farcaster-safe hooks"

# ============================================
# 2. GAME DATA WITH HYBRID RARITY SYSTEM
# ============================================
cat > lib/gameData.ts << 'EOF'
export interface Atom {
  symbol: string
  name: string
  color: string
  bgColor: string
}

export interface Compound {
  formula: string
  name: string
  atoms: Record<string, number>
  baseRarity: Rarity
  hint: string
}

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface RolledCompound extends Compound {
  rarity: Rarity
  points: number
}

export interface Badge {
  id: string
  name: string
  icon: string
  requirement: string
  threshold: number
}

export const ATOMS: Atom[] = [
  { symbol: 'H', name: 'Hydrogen', color: '#FFFFFF', bgColor: '#6B7280' },
  { symbol: 'O', name: 'Oxygen', color: '#FFFFFF', bgColor: '#DC2626' },
  { symbol: 'C', name: 'Carbon', color: '#FFFFFF', bgColor: '#1F2937' },
  { symbol: 'N', name: 'Nitrogen', color: '#FFFFFF', bgColor: '#2563EB' },
  { symbol: 'Cl', name: 'Chlorine', color: '#000000', bgColor: '#22C55E' },
  { symbol: 'Na', name: 'Sodium', color: '#000000', bgColor: '#EAB308' },
]

// Base rarity determines minimum, but can roll higher
export const COMPOUNDS: Compound[] = [
  { formula: 'H2O', name: 'Water', atoms: { H: 2, O: 1 }, baseRarity: 'common', hint: 'Essential for life!' },
  { formula: 'CO2', name: 'Carbon Dioxide', atoms: { C: 1, O: 2 }, baseRarity: 'common', hint: 'You breathe this out' },
  { formula: 'CH4', name: 'Methane', atoms: { C: 1, H: 4 }, baseRarity: 'common', hint: 'Natural gas fuel' },
  { formula: 'NH3', name: 'Ammonia', atoms: { N: 1, H: 3 }, baseRarity: 'rare', hint: 'Strong smell cleaner' },
  { formula: 'HCl', name: 'Hydrochloric Acid', atoms: { H: 1, Cl: 1 }, baseRarity: 'rare', hint: 'In your stomach' },
  { formula: 'NaCl', name: 'Salt', atoms: { Na: 1, Cl: 1 }, baseRarity: 'rare', hint: 'Table seasoning' },
  { formula: 'C2H6O', name: 'Ethanol', atoms: { C: 2, H: 6, O: 1 }, baseRarity: 'epic', hint: 'Party drink' },
  { formula: 'H2O2', name: 'Hydrogen Peroxide', atoms: { H: 2, O: 2 }, baseRarity: 'epic', hint: 'Bleaching agent' },
  { formula: 'NaOH', name: 'Sodium Hydroxide', atoms: { Na: 1, O: 1, H: 1 }, baseRarity: 'epic', hint: 'Lye soap base' },
  { formula: 'C6H12O6', name: 'Glucose', atoms: { C: 6, H: 12, O: 6 }, baseRarity: 'legendary', hint: 'Sugar energy' },
  { formula: 'C8H10N4O2', name: 'Caffeine', atoms: { C: 8, H: 10, N: 4, O: 2 }, baseRarity: 'legendary', hint: 'Morning fuel' },
]

export const BADGES: Badge[] = [
  { id: 'first', name: 'First Reaction', icon: '🔰', requirement: 'Create first compound', threshold: 1 },
  { id: 'chemist', name: 'Chemist', icon: '⚗️', requirement: 'Create 5 compounds', threshold: 5 },
  { id: 'scientist', name: 'Mad Scientist', icon: '🧬', requirement: 'Create 10 compounds', threshold: 10 },
  { id: 'rare', name: 'Rare Hunter', icon: '💎', requirement: 'Get a Rare NFT', threshold: 1 },
  { id: 'epic', name: 'Epic Finder', icon: '🔮', requirement: 'Get an Epic NFT', threshold: 1 },
  { id: 'legendary', name: 'Legend', icon: '👑', requirement: 'Get a Legendary NFT', threshold: 1 },
  { id: 'streak', name: 'On Fire', icon: '🔥', requirement: '5 streak combo', threshold: 5 },
]

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
}

export const RARITY_GLOW: Record<Rarity, string> = {
  common: '0 0 20px #9CA3AF',
  rare: '0 0 30px #3B82F6',
  epic: '0 0 40px #A855F7',
  legendary: '0 0 50px #F59E0B, 0 0 100px #F59E0B50',
}

export const POINTS_BY_RARITY: Record<Rarity, number> = {
  common: 100,
  rare: 250,
  epic: 500,
  legendary: 1000,
}

// Rarity order for comparisons
const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'legendary']

// Upgrade chances from base rarity
// e.g., if base is 'common', 15% to become rare, 3% epic, 0.5% legendary
const UPGRADE_CHANCES: Record<Rarity, Record<Rarity, number>> = {
  common: { common: 0.815, rare: 0.15, epic: 0.03, legendary: 0.005 },
  rare: { common: 0, rare: 0.85, epic: 0.12, legendary: 0.03 },
  epic: { common: 0, rare: 0, epic: 0.90, legendary: 0.10 },
  legendary: { common: 0, rare: 0, epic: 0, legendary: 1.0 },
}

/**
 * Roll rarity based on compound's base rarity
 * Higher base rarities have better upgrade chances
 */
export function rollRarity(baseRarity: Rarity): Rarity {
  const chances = UPGRADE_CHANCES[baseRarity]
  const roll = Math.random()
  
  let cumulative = 0
  for (const rarity of RARITY_ORDER) {
    cumulative += chances[rarity]
    if (roll < cumulative) {
      return rarity
    }
  }
  
  return baseRarity // Fallback
}

/**
 * Get points for a given rarity
 */
export function getPointsForRarity(rarity: Rarity): number {
  return POINTS_BY_RARITY[rarity]
}

/**
 * Format atom count to formula string
 */
export function formatFormula(atoms: Record<string, number>): string {
  // Standard chemical formula order: C, H, then alphabetical
  const order = ['C', 'H']
  const sorted = Object.entries(atoms).sort(([a], [b]) => {
    const aIdx = order.indexOf(a)
    const bIdx = order.indexOf(b)
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return a.localeCompare(b)
  })
  
  return sorted
    .map(([symbol, count]) => `${symbol}${count > 1 ? count : ''}`)
    .join('')
}

/**
 * Check if selected atoms form a valid compound
 * Returns compound with rolled rarity and points
 */
export function checkCompound(selectedAtoms: string[]): RolledCompound | null {
  const atomCount: Record<string, number> = {}
  selectedAtoms.forEach(atom => {
    atomCount[atom] = (atomCount[atom] || 0) + 1
  })
  
  const compound = COMPOUNDS.find(c => {
    const keys1 = Object.keys(c.atoms).sort()
    const keys2 = Object.keys(atomCount).sort()
    if (keys1.length !== keys2.length) return false
    return keys1.every(key => c.atoms[key] === atomCount[key])
  })

  if (!compound) return null

  // Roll for rarity
  const rarity = rollRarity(compound.baseRarity)
  const points = getPointsForRarity(rarity)

  return {
    ...compound,
    rarity,
    points,
  }
}

/**
 * Generate token URI for NFT metadata
 */
export function generateTokenURI(
  formula: string,
  name: string,
  rarity: Rarity,
  points: number
): string {
  const metadata = {
    name: `${name} (${formula})`,
    description: `A ${rarity} molecule discovered in Chain Reaction Labs`,
    attributes: [
      { trait_type: 'Formula', value: formula },
      { trait_type: 'Name', value: name },
      { trait_type: 'Rarity', value: rarity },
      { trait_type: 'Points', value: points },
    ],
  }
  
  // Return base64 encoded JSON for on-chain metadata
  const json = JSON.stringify(metadata)
  const base64 = Buffer.from(json).toString('base64')
  return `data:application/json;base64,${base64}`
}

export const LEADERBOARD_MOCK = [
  { rank: 1, address: '0xAAA...1234', points: 45200, level: 28 },
  { rank: 2, address: '0xBBB...5678', points: 38100, level: 24 },
  { rank: 3, address: '0xCCC...9012', points: 31500, level: 21 },
  { rank: 4, address: '0xDDD...3456', points: 28900, level: 19 },
  { rank: 5, address: '0xEEE...7890', points: 25400, level: 17 },
]
EOF

echo "✅ lib/gameData.ts - Hybrid rarity system"

# ============================================
# 3. MINT API ROUTE
# ============================================
cat > app/api/mint/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { getUsersCollection, getDiscoveriesCollection } from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const { 
      address, 
      formula, 
      name, 
      rarity, 
      points, 
      txHash,
      tokenId 
    } = await req.json()

    if (!address || !formula || !txHash) {
      return NextResponse.json(
        { error: 'Missing required fields: address, formula, txHash' }, 
        { status: 400 }
      )
    }

    const users = await getUsersCollection()
    const discoveries = await getDiscoveriesCollection()
    const now = new Date()
    const addressLower = address.toLowerCase()

    // Check for duplicate mint (same tx hash)
    const existingMint = await discoveries.findOne({ txHash })
    if (existingMint) {
      return NextResponse.json(
        { error: 'Mint already recorded', existing: true },
        { status: 400 }
      )
    }

    // Record the mint/discovery
    const discovery = {
      address: addressLower,
      formula,
      name,
      rarity,
      points,
      txHash,
      tokenId,
      mintedAt: now,
      createdAt: now
    }

    await discoveries.insertOne(discovery)

    // Update or create user
    const userUpdate = await users.findOneAndUpdate(
      { address: addressLower },
      {
        $inc: { points, totalMints: 1 },
        $push: { 
          discoveries: {
            formula,
            name,
            rarity,
            points,
            txHash,
            tokenId,
            mintedAt: now
          }
        },
        $set: { updatedAt: now },
        $setOnInsert: {
          address: addressLower,
          streak: 0,
          badges: [],
          createdAt: now
        }
      },
      { upsert: true, returnDocument: 'after' }
    )

    const user = userUpdate

    // Check and award badges
    const newBadges: string[] = []
    const currentBadges = user?.badges || []
    const discoveryCount = user?.discoveries?.length || 0

    const badgeChecks = [
      { id: 'first', condition: discoveryCount >= 1 },
      { id: 'chemist', condition: discoveryCount >= 5 },
      { id: 'scientist', condition: discoveryCount >= 10 },
      { id: 'rare', condition: rarity === 'rare' },
      { id: 'epic', condition: rarity === 'epic' },
      { id: 'legendary', condition: rarity === 'legendary' },
    ]

    for (const check of badgeChecks) {
      if (check.condition && !currentBadges.includes(check.id)) {
        newBadges.push(check.id)
      }
    }

    if (newBadges.length > 0) {
      await users.updateOne(
        { address: addressLower },
        { $push: { badges: { $each: newBadges } } }
      )
    }

    return NextResponse.json({
      success: true,
      discovery,
      newBadges,
      totalPoints: user?.points || points,
      totalMints: user?.totalMints || 1
    })

  } catch (error) {
    console.error('Mint API error:', error)
    return NextResponse.json(
      { error: 'Server error' }, 
      { status: 500 }
    )
  }
}

// Get mint history for an address
export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get('address')
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address required' },
        { status: 400 }
      )
    }

    const discoveries = await getDiscoveriesCollection()
    const mints = await discoveries
      .find({ address: address.toLowerCase() })
      .sort({ mintedAt: -1 })
      .toArray()

    return NextResponse.json({ mints })

  } catch (error) {
    console.error('Get mints error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
EOF

echo "✅ app/api/mint/route.ts - Mint API endpoint"

# ============================================
# 4. COMPLETE GAME ARENA WITH FULL MINT FLOW
# ============================================
cat > components/game/GameArena.tsx << 'EOF'
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
EOF

echo "✅ components/game/GameArena.tsx - Full game flow with GIF + rarity reveal"

# ============================================
# 5. UPDATE USER API (ensure it exists)
# ============================================
mkdir -p app/api/user
cat > app/api/user/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { getUsersCollection } from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get('address')
    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 })
    }

    const users = await getUsersCollection()
    const user = await users.findOne({ address: address.toLowerCase() })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      address: user.address,
      username: user.username,
      fid: user.fid,
      points: user.points || 0,
      streak: user.streak || 0,
      totalMints: user.totalMints || 0,
      discoveries: user.discoveries || [],
      badges: user.badges || [],
      level: Math.floor((user.points || 0) / 1000) + 1,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { address, fid, username } = await req.json()
    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 })
    }

    const users = await getUsersCollection()
    const now = new Date()
    const addressLower = address.toLowerCase()

    const result = await users.findOneAndUpdate(
      { address: addressLower },
      {
        $set: { 
          fid, 
          username, 
          updatedAt: now 
        },
        $setOnInsert: { 
          address: addressLower,
          points: 0,
          streak: 0,
          totalMints: 0,
          discoveries: [],
          badges: [],
          createdAt: now
        }
      },
      { upsert: true, returnDocument: 'after' }
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Create/update user error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
EOF

echo "✅ app/api/user/route.ts - User API"

# ============================================
# 6. LEADERBOARD API
# ============================================
mkdir -p app/api/leaderboard/rank
cat > app/api/leaderboard/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { getUsersCollection } from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')
    
    const users = await getUsersCollection()
    const leaderboard = await users
      .find({ points: { $gt: 0 } })
      .sort({ points: -1 })
      .limit(Math.min(limit, 100))
      .project({ 
        address: 1, 
        username: 1, 
        fid: 1, 
        points: 1, 
        totalMints: 1,
        discoveries: 1, 
        badges: 1 
      })
      .toArray()

    const ranked = leaderboard.map((user, index) => ({
      rank: index + 1,
      address: user.address,
      username: user.username,
      fid: user.fid,
      points: user.points || 0,
      level: Math.floor((user.points || 0) / 1000) + 1,
      totalMints: user.totalMints || 0,
      discoveryCount: user.discoveries?.length || 0,
      badgeCount: user.badges?.length || 0
    }))

    return NextResponse.json(ranked)
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
EOF

cat > app/api/leaderboard/rank/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { getUsersCollection } from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get('address')
    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 })
    }

    const users = await getUsersCollection()
    const addressLower = address.toLowerCase()
    const user = await users.findOne({ address: addressLower })

    if (!user) {
      return NextResponse.json({ 
        rank: null, 
        points: 0,
        message: 'User not found'
      })
    }

    // Count users with more points
    const rank = await users.countDocuments({ 
      points: { $gt: user.points || 0 } 
    }) + 1

    // Get total players
    const totalPlayers = await users.countDocuments({ points: { $gt: 0 } })

    return NextResponse.json({
      rank,
      totalPlayers,
      address: user.address,
      username: user.username,
      points: user.points || 0,
      level: Math.floor((user.points || 0) / 1000) + 1,
      totalMints: user.totalMints || 0,
      discoveryCount: user.discoveries?.length || 0,
      badgeCount: user.badges?.length || 0,
      percentile: totalPlayers > 0 
        ? Math.round((1 - (rank / totalPlayers)) * 100) 
        : 0
    })
  } catch (error) {
    console.error('Get rank error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
EOF

echo "✅ app/api/leaderboard/ - Leaderboard APIs"

# ============================================
# SUMMARY
# ============================================
echo ""
echo "================================================"
echo "🎉 Phase 4 Complete!"
echo "================================================"
echo ""
echo "Files created/updated:"
echo "  ├── lib/hooks/useContract.ts   (Farcaster-safe)"
echo "  ├── lib/gameData.ts            (Hybrid rarity)"
echo "  ├── app/api/mint/route.ts      (Mint + DB save)"
echo "  ├── app/api/user/route.ts      (User CRUD)"
echo "  ├── app/api/leaderboard/       (Rankings)"
echo "  └── components/game/GameArena.tsx (Full flow)"
echo ""
echo "Features:"
echo "  ✅ Farcaster-compatible minting (useSendTransaction)"
echo "  ✅ Hybrid rarity system (base + upgrade chance)"
echo "  ✅ Mixing GIF animation (2.5s)"
echo "  ✅ Rarity reveal animation (slot machine style)"
echo "  ✅ Mint → DB save → success overlay"
echo "  ✅ BaseScan link on success"
echo "  ✅ Badge system with auto-award"
echo ""
echo "Rarity upgrade chances:"
echo "  Common base  → 81.5% common, 15% rare, 3% epic, 0.5% legendary"
echo "  Rare base    → 85% rare, 12% epic, 3% legendary"
echo "  Epic base    → 90% epic, 10% legendary"
echo "  Legendary    → 100% legendary"
echo ""
echo "Next: Run 'chmod +x phase4-complete-mint-flow.sh && ./phase4-complete-mint-flow.sh'"