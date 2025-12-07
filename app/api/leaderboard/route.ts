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
