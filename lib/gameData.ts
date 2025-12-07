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
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  hint: string
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

export const COMPOUNDS: Compound[] = [
  { formula: 'H2O', name: 'Water', atoms: { H: 2, O: 1 }, rarity: 'common', points: 100, hint: 'Essential for life!' },
  { formula: 'CO2', name: 'Carbon Dioxide', atoms: { C: 1, O: 2 }, rarity: 'common', points: 100, hint: 'You breathe this out' },
  { formula: 'CH4', name: 'Methane', atoms: { C: 1, H: 4 }, rarity: 'rare', points: 200, hint: 'Natural gas fuel' },
  { formula: 'NH3', name: 'Ammonia', atoms: { N: 1, H: 3 }, rarity: 'rare', points: 200, hint: 'Strong smell cleaner' },
  { formula: 'HCl', name: 'Hydrochloric Acid', atoms: { H: 1, Cl: 1 }, rarity: 'rare', points: 200, hint: 'In your stomach' },
  { formula: 'NaCl', name: 'Salt', atoms: { Na: 1, Cl: 1 }, rarity: 'epic', points: 300, hint: 'Table seasoning' },
  { formula: 'C2H6O', name: 'Ethanol', atoms: { C: 2, H: 6, O: 1 }, rarity: 'epic', points: 300, hint: 'Party drink' },
  { formula: 'H2O2', name: 'Hydrogen Peroxide', atoms: { H: 2, O: 2 }, rarity: 'epic', points: 300, hint: 'Bleaching agent' },
  { formula: 'C6H12O6', name: 'Glucose', atoms: { C: 6, H: 12, O: 6 }, rarity: 'legendary', points: 500, hint: 'Sugar energy' },
  { formula: 'C8H10N4O2', name: 'Caffeine', atoms: { C: 8, H: 10, N: 4, O: 2 }, rarity: 'legendary', points: 500, hint: 'Morning fuel' },
]

export const BADGES: Badge[] = [
  { id: 'first', name: 'First Reaction', icon: '🔰', requirement: 'Create first compound', threshold: 1 },
  { id: 'chemist', name: 'Chemist', icon: '⚗️', requirement: 'Create 5 compounds', threshold: 5 },
  { id: 'scientist', name: 'Mad Scientist', icon: '🧬', requirement: 'Create 10 compounds', threshold: 10 },
  { id: 'rare', name: 'Rare Hunter', icon: '💎', requirement: 'Get a Rare NFT', threshold: 1 },
  { id: 'streak', name: 'On Fire', icon: '🔥', requirement: '5 streak combo', threshold: 5 },
]

export const RARITY_COLORS = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
}

export const LEADERBOARD_MOCK = [
  { rank: 1, address: '0xAAA...1234', points: 45200, level: 28 },
  { rank: 2, address: '0xBBB...5678', points: 38100, level: 24 },
  { rank: 3, address: '0xCCC...9012', points: 31500, level: 21 },
  { rank: 4, address: '0xDDD...3456', points: 28900, level: 19 },
  { rank: 5, address: '0xEEE...7890', points: 25400, level: 17 },
]

export function formatFormula(atoms: Record<string, number>): string {
  return Object.entries(atoms)
    .map(([symbol, count]) => `${symbol}${count > 1 ? count : ''}`)
    .join('')
}

export function checkCompound(selectedAtoms: string[]): Compound | null {
  const atomCount: Record<string, number> = {}
  selectedAtoms.forEach(atom => {
    atomCount[atom] = (atomCount[atom] || 0) + 1
  })
  
  return COMPOUNDS.find(compound => {
    const keys1 = Object.keys(compound.atoms).sort()
    const keys2 = Object.keys(atomCount).sort()
    if (keys1.length !== keys2.length) return false
    return keys1.every(key => compound.atoms[key] === atomCount[key])
  }) || null
}
