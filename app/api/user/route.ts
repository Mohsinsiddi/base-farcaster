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
