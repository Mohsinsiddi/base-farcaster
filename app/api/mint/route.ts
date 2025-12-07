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
