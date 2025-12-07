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
