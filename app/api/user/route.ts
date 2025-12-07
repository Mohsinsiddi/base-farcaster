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
