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
