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
