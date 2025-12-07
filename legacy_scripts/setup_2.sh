#!/bin/bash

mkdir -p lib/hooks
mkdir -p app/api/game
mkdir -p app/api/leaderboard
mkdir -p app/api/user

cat > lib/mongodb.ts << 'EOF'
import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = 'chain-reaction'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb }

  const client = await MongoClient.connect(MONGODB_URI)
  const db = client.db(DB_NAME)

  cachedClient = client
  cachedDb = db

  return { client, db }
}

// Collections
export async function getUsersCollection() {
  const { db } = await connectToDatabase()
  return db.collection('users')
}

export async function getDiscoveriesCollection() {
  const { db } = await connectToDatabase()
  return db.collection('discoveries')
}

export async function getLeaderboardCollection() {
  const { db } = await connectToDatabase()
  return db.collection('leaderboard')
}
EOF

cat > lib/hooks/useContract.ts << 'EOF'
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { base } from 'viem/chains'

export const MOLECULE_NFT_ADDRESS = "0x1234567890123456789012345678901234567890" as const

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

// Mint NFT Hook
export function useMintMolecule() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const mint = async (
    to: `0x${string}`,
    formula: string,
    name: string,
    rarity: string,
    points: number,
    tokenURI: string
  ) => {
    writeContract({
      address: MOLECULE_NFT_ADDRESS,
      abi: MOLECULE_NFT_ABI,
      functionName: 'mint',
      args: [to, formula, name, rarity, BigInt(points), tokenURI],
      chain: base,
    })
  }

  return { mint, hash, isPending, isConfirming, isSuccess, error }
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

cat > lib/api.ts << 'EOF'
const API_BASE = '/api'

// User API
export async function getUser(address: string) {
  const res = await fetch(`${API_BASE}/user?address=${address}`)
  return res.json()
}

export async function createOrUpdateUser(address: string, fid?: number, username?: string) {
  const res = await fetch(`${API_BASE}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, fid, username })
  })
  return res.json()
}

// Game API
export async function recordDiscovery(
  address: string,
  formula: string,
  name: string,
  rarity: string,
  points: number,
  tokenId?: number
) {
  const res = await fetch(`${API_BASE}/game/discover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, formula, name, rarity, points, tokenId })
  })
  return res.json()
}

export async function getUserDiscoveries(address: string) {
  const res = await fetch(`${API_BASE}/game/discoveries?address=${address}`)
  return res.json()
}

// Leaderboard API
export async function getLeaderboard(limit = 20) {
  const res = await fetch(`${API_BASE}/leaderboard?limit=${limit}`)
  return res.json()
}

export async function getUserRank(address: string) {
  const res = await fetch(`${API_BASE}/leaderboard/rank?address=${address}`)
  return res.json()
}
EOF

cat > app/api/user/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { getUsersCollection } from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get('address')
    if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 })

    const users = await getUsersCollection()
    const user = await users.findOne({ address: address.toLowerCase() })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { address, fid, username } = await req.json()
    if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 })

    const users = await getUsersCollection()
    const now = new Date()

    const result = await users.updateOne(
      { address: address.toLowerCase() },
      {
        $set: { fid, username, updatedAt: now },
        $setOnInsert: { 
          address: address.toLowerCase(),
          points: 0,
          streak: 0,
          discoveries: [],
          badges: [],
          createdAt: now
        }
      },
      { upsert: true }
    )

    const user = await users.findOne({ address: address.toLowerCase() })
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
EOF

cat > app/api/game/discover/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { getUsersCollection, getDiscoveriesCollection } from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const { address, formula, name, rarity, points, tokenId } = await req.json()
    if (!address || !formula) {
      return NextResponse.json({ error: 'Address and formula required' }, { status: 400 })
    }

    const users = await getUsersCollection()
    const discoveries = await getDiscoveriesCollection()
    const now = new Date()
    const addressLower = address.toLowerCase()

    // Check if user already discovered this
    const existingDiscovery = await discoveries.findOne({ 
      address: addressLower, 
      formula 
    })

    if (existingDiscovery) {
      return NextResponse.json({ error: 'Already discovered', existing: true }, { status: 400 })
    }

    // Record discovery
    await discoveries.insertOne({
      address: addressLower,
      formula,
      name,
      rarity,
      points,
      tokenId,
      createdAt: now
    })

    // Update user points and discoveries
    const updateResult = await users.updateOne(
      { address: addressLower },
      {
        $inc: { points, streak: 1 },
        $push: { discoveries: { formula, name, rarity, points, tokenId, createdAt: now } },
        $set: { updatedAt: now }
      }
    )

    // Check badges
    const user = await users.findOne({ address: addressLower })
    const newBadges: string[] = []

    if (user) {
      const discoveryCount = user.discoveries?.length || 0
      
      if (discoveryCount === 1 && !user.badges?.includes('first')) {
        newBadges.push('first')
      }
      if (discoveryCount >= 5 && !user.badges?.includes('chemist')) {
        newBadges.push('chemist')
      }
      if (discoveryCount >= 10 && !user.badges?.includes('scientist')) {
        newBadges.push('scientist')
      }
      if (rarity === 'rare' && !user.badges?.includes('rare')) {
        newBadges.push('rare')
      }
      if (rarity === 'epic' && !user.badges?.includes('epic')) {
        newBadges.push('epic')
      }
      if (rarity === 'legendary' && !user.badges?.includes('legendary')) {
        newBadges.push('legendary')
      }
      if ((user.streak || 0) >= 5 && !user.badges?.includes('streak')) {
        newBadges.push('streak')
      }

      if (newBadges.length > 0) {
        await users.updateOne(
          { address: addressLower },
          { $push: { badges: { $each: newBadges } } }
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      points, 
      newBadges,
      totalPoints: (user?.points || 0) + points
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
EOF

cat > app/api/game/discoveries/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { getDiscoveriesCollection } from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get('address')
    if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 })

    const discoveries = await getDiscoveriesCollection()
    const userDiscoveries = await discoveries
      .find({ address: address.toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(userDiscoveries)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
EOF

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
      .limit(limit)
      .project({ address: 1, username: 1, fid: 1, points: 1, discoveries: 1, badges: 1 })
      .toArray()

    const ranked = leaderboard.map((user, index) => ({
      rank: index + 1,
      address: user.address,
      username: user.username,
      fid: user.fid,
      points: user.points,
      level: Math.floor(user.points / 1000) + 1,
      discoveryCount: user.discoveries?.length || 0,
      badgeCount: user.badges?.length || 0
    }))

    return NextResponse.json(ranked)
  } catch (error) {
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
    if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 })

    const users = await getUsersCollection()
    const user = await users.findOne({ address: address.toLowerCase() })

    if (!user) return NextResponse.json({ rank: null, points: 0 })

    const rank = await users.countDocuments({ points: { $gt: user.points } }) + 1

    return NextResponse.json({
      rank,
      address: user.address,
      username: user.username,
      points: user.points,
      level: Math.floor(user.points / 1000) + 1,
      discoveryCount: user.discoveries?.length || 0,
      badgeCount: user.badges?.length || 0
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
EOF

echo "✅ Phase 3 Done - Hooks, MongoDB, API routes created"
echo "Add MONGODB_URI to .env.local"