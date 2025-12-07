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
