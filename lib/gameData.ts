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

// Base rarity determines minimum, but can roll higher
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
  { id: 'rare', name: 'Rare Hunter', icon: '💎', requirement: 'Get a Rare NFT', threshold: 1 },
  { id: 'epic', name: 'Epic Finder', icon: '🔮', requirement: 'Get an Epic NFT', threshold: 1 },
  { id: 'legendary', name: 'Legend', icon: '👑', requirement: 'Get a Legendary NFT', threshold: 1 },
  { id: 'streak', name: 'On Fire', icon: '🔥', requirement: '5 streak combo', threshold: 5 },
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

// Rarity order for comparisons
const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'legendary']

// Upgrade chances from base rarity
// e.g., if base is 'common', 15% to become rare, 3% epic, 0.5% legendary
const UPGRADE_CHANCES: Record<Rarity, Record<Rarity, number>> = {
  common: { common: 0.815, rare: 0.15, epic: 0.03, legendary: 0.005 },
  rare: { common: 0, rare: 0.85, epic: 0.12, legendary: 0.03 },
  epic: { common: 0, rare: 0, epic: 0.90, legendary: 0.10 },
  legendary: { common: 0, rare: 0, epic: 0, legendary: 1.0 },
}

/**
 * Roll rarity based on compound's base rarity
 * Higher base rarities have better upgrade chances
 */
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
  
  return baseRarity // Fallback
}

/**
 * Get points for a given rarity
 */
export function getPointsForRarity(rarity: Rarity): number {
  return POINTS_BY_RARITY[rarity]
}

/**
 * Format atom count to formula string
 */
export function formatFormula(atoms: Record<string, number>): string {
  // Standard chemical formula order: C, H, then alphabetical
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

/**
 * Check if selected atoms form a valid compound
 * Returns compound with rolled rarity and points
 */
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

  // Roll for rarity
  const rarity = rollRarity(compound.baseRarity)
  const points = getPointsForRarity(rarity)

  return {
    ...compound,
    rarity,
    points,
  }
}

/**
 * Generate token URI for NFT metadata
 */
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
  
  // Return base64 encoded JSON for on-chain metadata
  const json = JSON.stringify(metadata)
  const base64 = Buffer.from(json).toString('base64')
  return `data:application/json;base64,${base64}`
}

export const LEADERBOARD_MOCK = [
  { rank: 1, address: '0xAAA...1234', points: 45200, level: 28 },
  { rank: 2, address: '0xBBB...5678', points: 38100, level: 24 },
  { rank: 3, address: '0xCCC...9012', points: 31500, level: 21 },
  { rank: 4, address: '0xDDD...3456', points: 28900, level: 19 },
  { rank: 5, address: '0xEEE...7890', points: 25400, level: 17 },
]
