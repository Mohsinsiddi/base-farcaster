#!/bin/bash

echo "🔧 Fixing Mint API - Adding Streak Logic"

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

    // Check if user already discovered this compound (optional: allow re-mints)
    const existingDiscovery = await discoveries.findOne({ 
      address: addressLower, 
      formula 
    })
    const isNewDiscovery = !existingDiscovery

    // Record the mint/discovery
    const discovery = {
      address: addressLower,
      formula,
      name,
      rarity,
      points,
      txHash,
      tokenId,
      isNewDiscovery,
      mintedAt: now,
      createdAt: now
    }

    await discoveries.insertOne(discovery)

    // Update or create user with streak increment
    const userUpdate = await users.findOneAndUpdate(
      { address: addressLower },
      {
        $inc: { 
          points, 
          totalMints: 1,
          streak: 1  // Increment streak on successful mint
        },
        $push: { 
          discoveries: {
            formula,
            name,
            rarity,
            points,
            txHash,
            tokenId,
            isNewDiscovery,
            mintedAt: now
          }
        },
        $set: { 
          updatedAt: now,
          lastMintAt: now  // Track last mint time for streak decay
        },
        $setOnInsert: {
          address: addressLower,
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
    const currentStreak = user?.streak || 0

    const badgeChecks = [
      { id: 'first', condition: discoveryCount >= 1 },
      { id: 'chemist', condition: discoveryCount >= 5 },
      { id: 'scientist', condition: discoveryCount >= 10 },
      { id: 'master', condition: discoveryCount >= 25 },
      { id: 'rare', condition: rarity === 'rare' },
      { id: 'epic', condition: rarity === 'epic' },
      { id: 'legendary', condition: rarity === 'legendary' },
      { id: 'streak', condition: currentStreak >= 5 },  // On Fire badge
      { id: 'streak10', condition: currentStreak >= 10 }, // Hot Streak badge
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

    // Calculate level
    const totalPoints = user?.points || points
    const level = Math.floor(totalPoints / 1000) + 1

    return NextResponse.json({
      success: true,
      discovery,
      isNewDiscovery,
      newBadges,
      totalPoints,
      totalMints: user?.totalMints || 1,
      streak: currentStreak,
      level
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

    return NextResponse.json({ 
      mints,
      total: mints.length 
    })

  } catch (error) {
    console.error('Get mints error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
EOF

# Add streak reset API for failed reactions
mkdir -p app/api/game

cat > app/api/game/streak-reset/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { getUsersCollection } from '@/lib/mongodb'

// Reset streak on failed reaction
export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json()
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address required' },
        { status: 400 }
      )
    }

    const users = await getUsersCollection()
    const addressLower = address.toLowerCase()

    const result = await users.findOneAndUpdate(
      { address: addressLower },
      { 
        $set: { 
          streak: 0,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    return NextResponse.json({
      success: true,
      streak: 0,
      message: 'Streak reset'
    })

  } catch (error) {
    console.error('Streak reset error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
EOF

# Update badges in gameData to include new streak badges
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
  { id: 'master', name: 'Master Chemist', icon: '🎓', requirement: 'Create 25 compounds', threshold: 25 },
  { id: 'rare', name: 'Rare Hunter', icon: '💎', requirement: 'Mint a Rare NFT', threshold: 1 },
  { id: 'epic', name: 'Epic Finder', icon: '🔮', requirement: 'Mint an Epic NFT', threshold: 1 },
  { id: 'legendary', name: 'Legend', icon: '👑', requirement: 'Mint a Legendary NFT', threshold: 1 },
  { id: 'streak', name: 'On Fire', icon: '🔥', requirement: '5 mint streak', threshold: 5 },
  { id: 'streak10', name: 'Unstoppable', icon: '⚡', requirement: '10 mint streak', threshold: 10 },
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

const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'legendary']

const UPGRADE_CHANCES: Record<Rarity, Record<Rarity, number>> = {
  common: { common: 0.815, rare: 0.15, epic: 0.03, legendary: 0.005 },
  rare: { common: 0, rare: 0.85, epic: 0.12, legendary: 0.03 },
  epic: { common: 0, rare: 0, epic: 0.90, legendary: 0.10 },
  legendary: { common: 0, rare: 0, epic: 0, legendary: 1.0 },
}

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
  
  return baseRarity
}

export function getPointsForRarity(rarity: Rarity): number {
  return POINTS_BY_RARITY[rarity]
}

export function formatFormula(atoms: Record<string, number>): string {
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

  const rarity = rollRarity(compound.baseRarity)
  const points = getPointsForRarity(rarity)

  return {
    ...compound,
    rarity,
    points,
  }
}

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
  
  const json = JSON.stringify(metadata)
  const base64 = Buffer.from(json).toString('base64')
  return `data:application/json;base64,${base64}`
}

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find(b => b.id === id)
}

export const LEADERBOARD_MOCK = [
  { rank: 1, address: '0xAAA...1234', points: 45200, level: 28 },
  { rank: 2, address: '0xBBB...5678', points: 38100, level: 24 },
  { rank: 3, address: '0xCCC...9012', points: 31500, level: 21 },
  { rank: 4, address: '0xDDD...3456', points: 28900, level: 19 },
  { rank: 5, address: '0xEEE...7890', points: 25400, level: 17 },
]
EOF

echo ""
echo "✅ Updated:"
echo "  - app/api/mint/route.ts (streak tracking, new badges)"
echo "  - app/api/game/streak-reset/route.ts (reset on failed reaction)"
echo "  - lib/gameData.ts (added master + streak10 badges)"
echo ""
echo "Mint API now returns:"
echo "  { success, discovery, isNewDiscovery, newBadges, totalPoints, totalMints, streak, level }"