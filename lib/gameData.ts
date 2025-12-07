export type ElementCategory = 
  | 'nonmetal' 
  | 'noble-gas' 
  | 'alkali-metal' 
  | 'alkaline-earth' 
  | 'metalloid' 
  | 'halogen' 
  | 'transition-metal' 
  | 'post-transition' 
  | 'lanthanide' 
  | 'actinide'

export interface Atom {
  symbol: string
  name: string
  atomicNumber: number
  category: ElementCategory
  color: string
  bgColor: string
  valenceElectrons: number  // Outermost electrons
  commonOxidationStates: number[]  // Common charges
}

export interface Compound {
  formula: string
  name: string
  atoms: Record<string, number>
  rarity: Rarity
  points: number
  description: string
  realWorldUse: string
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'

export interface RolledCompound extends Compound {}

export interface Badge {
  id: string
  name: string
  icon: string
  requirement: string
  threshold: number
}

// Category colors
const CATEGORY_STYLES: Record<ElementCategory, { bg: string; text: string }> = {
  'nonmetal': { bg: '#22C55E', text: '#FFFFFF' },
  'noble-gas': { bg: '#8B5CF6', text: '#FFFFFF' },
  'alkali-metal': { bg: '#EF4444', text: '#FFFFFF' },
  'alkaline-earth': { bg: '#F97316', text: '#FFFFFF' },
  'metalloid': { bg: '#06B6D4', text: '#FFFFFF' },
  'halogen': { bg: '#FBBF24', text: '#000000' },
  'transition-metal': { bg: '#3B82F6', text: '#FFFFFF' },
  'post-transition': { bg: '#6366F1', text: '#FFFFFF' },
  'lanthanide': { bg: '#EC4899', text: '#FFFFFF' },
  'actinide': { bg: '#F43F5E', text: '#FFFFFF' },
}

// Full periodic table with valence electrons
export const ATOMS: Atom[] = [
  // Period 1
  { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, category: 'nonmetal', valenceElectrons: 1, commonOxidationStates: [1, -1], ...CATEGORY_STYLES['nonmetal'] },
  { symbol: 'He', name: 'Helium', atomicNumber: 2, category: 'noble-gas', valenceElectrons: 2, commonOxidationStates: [0], ...CATEGORY_STYLES['noble-gas'] },
  
  // Period 2
  { symbol: 'Li', name: 'Lithium', atomicNumber: 3, category: 'alkali-metal', valenceElectrons: 1, commonOxidationStates: [1], ...CATEGORY_STYLES['alkali-metal'] },
  { symbol: 'Be', name: 'Beryllium', atomicNumber: 4, category: 'alkaline-earth', valenceElectrons: 2, commonOxidationStates: [2], ...CATEGORY_STYLES['alkaline-earth'] },
  { symbol: 'B', name: 'Boron', atomicNumber: 5, category: 'metalloid', valenceElectrons: 3, commonOxidationStates: [3], ...CATEGORY_STYLES['metalloid'] },
  { symbol: 'C', name: 'Carbon', atomicNumber: 6, category: 'nonmetal', valenceElectrons: 4, commonOxidationStates: [4, -4, 2], ...CATEGORY_STYLES['nonmetal'] },
  { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, category: 'nonmetal', valenceElectrons: 5, commonOxidationStates: [-3, 3, 5], ...CATEGORY_STYLES['nonmetal'] },
  { symbol: 'O', name: 'Oxygen', atomicNumber: 8, category: 'nonmetal', valenceElectrons: 6, commonOxidationStates: [-2], ...CATEGORY_STYLES['nonmetal'] },
  { symbol: 'F', name: 'Fluorine', atomicNumber: 9, category: 'halogen', valenceElectrons: 7, commonOxidationStates: [-1], ...CATEGORY_STYLES['halogen'] },
  { symbol: 'Ne', name: 'Neon', atomicNumber: 10, category: 'noble-gas', valenceElectrons: 8, commonOxidationStates: [0], ...CATEGORY_STYLES['noble-gas'] },
  
  // Period 3
  { symbol: 'Na', name: 'Sodium', atomicNumber: 11, category: 'alkali-metal', valenceElectrons: 1, commonOxidationStates: [1], ...CATEGORY_STYLES['alkali-metal'] },
  { symbol: 'Mg', name: 'Magnesium', atomicNumber: 12, category: 'alkaline-earth', valenceElectrons: 2, commonOxidationStates: [2], ...CATEGORY_STYLES['alkaline-earth'] },
  { symbol: 'Al', name: 'Aluminum', atomicNumber: 13, category: 'post-transition', valenceElectrons: 3, commonOxidationStates: [3], ...CATEGORY_STYLES['post-transition'] },
  { symbol: 'Si', name: 'Silicon', atomicNumber: 14, category: 'metalloid', valenceElectrons: 4, commonOxidationStates: [4, -4], ...CATEGORY_STYLES['metalloid'] },
  { symbol: 'P', name: 'Phosphorus', atomicNumber: 15, category: 'nonmetal', valenceElectrons: 5, commonOxidationStates: [-3, 3, 5], ...CATEGORY_STYLES['nonmetal'] },
  { symbol: 'S', name: 'Sulfur', atomicNumber: 16, category: 'nonmetal', valenceElectrons: 6, commonOxidationStates: [-2, 4, 6], ...CATEGORY_STYLES['nonmetal'] },
  { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, category: 'halogen', valenceElectrons: 7, commonOxidationStates: [-1, 1, 3, 5, 7], ...CATEGORY_STYLES['halogen'] },
  { symbol: 'Ar', name: 'Argon', atomicNumber: 18, category: 'noble-gas', valenceElectrons: 8, commonOxidationStates: [0], ...CATEGORY_STYLES['noble-gas'] },
  
  // Period 4
  { symbol: 'K', name: 'Potassium', atomicNumber: 19, category: 'alkali-metal', valenceElectrons: 1, commonOxidationStates: [1], ...CATEGORY_STYLES['alkali-metal'] },
  { symbol: 'Ca', name: 'Calcium', atomicNumber: 20, category: 'alkaline-earth', valenceElectrons: 2, commonOxidationStates: [2], ...CATEGORY_STYLES['alkaline-earth'] },
  { symbol: 'Fe', name: 'Iron', atomicNumber: 26, category: 'transition-metal', valenceElectrons: 2, commonOxidationStates: [2, 3], ...CATEGORY_STYLES['transition-metal'] },
  { symbol: 'Cu', name: 'Copper', atomicNumber: 29, category: 'transition-metal', valenceElectrons: 1, commonOxidationStates: [1, 2], ...CATEGORY_STYLES['transition-metal'] },
  { symbol: 'Zn', name: 'Zinc', atomicNumber: 30, category: 'transition-metal', valenceElectrons: 2, commonOxidationStates: [2], ...CATEGORY_STYLES['transition-metal'] },
  { symbol: 'Br', name: 'Bromine', atomicNumber: 35, category: 'halogen', valenceElectrons: 7, commonOxidationStates: [-1, 1, 3, 5], ...CATEGORY_STYLES['halogen'] },
  
  // Period 5
  { symbol: 'Ag', name: 'Silver', atomicNumber: 47, category: 'transition-metal', valenceElectrons: 1, commonOxidationStates: [1], ...CATEGORY_STYLES['transition-metal'] },
  { symbol: 'I', name: 'Iodine', atomicNumber: 53, category: 'halogen', valenceElectrons: 7, commonOxidationStates: [-1, 1, 5, 7], ...CATEGORY_STYLES['halogen'] },
  
  // Period 6
  { symbol: 'Pt', name: 'Platinum', atomicNumber: 78, category: 'transition-metal', valenceElectrons: 1, commonOxidationStates: [2, 4], ...CATEGORY_STYLES['transition-metal'] },
  { symbol: 'Au', name: 'Gold', atomicNumber: 79, category: 'transition-metal', valenceElectrons: 1, commonOxidationStates: [1, 3], ...CATEGORY_STYLES['transition-metal'] },
  { symbol: 'Hg', name: 'Mercury', atomicNumber: 80, category: 'transition-metal', valenceElectrons: 2, commonOxidationStates: [1, 2], ...CATEGORY_STYLES['transition-metal'] },
  { symbol: 'Pb', name: 'Lead', atomicNumber: 82, category: 'post-transition', valenceElectrons: 4, commonOxidationStates: [2, 4], ...CATEGORY_STYLES['post-transition'] },
  
  // Actinides
  { symbol: 'U', name: 'Uranium', atomicNumber: 92, category: 'actinide', valenceElectrons: 2, commonOxidationStates: [3, 4, 5, 6], ...CATEGORY_STYLES['actinide'] },
  { symbol: 'Pu', name: 'Plutonium', atomicNumber: 94, category: 'actinide', valenceElectrons: 2, commonOxidationStates: [3, 4, 5, 6], ...CATEGORY_STYLES['actinide'] },
]

// Real-world compounds with accurate rarity
export const COMPOUNDS: Compound[] = [
  // ============ COMMON (40-75 pts) ============
  { formula: 'H2O', name: 'Water', atoms: { H: 2, O: 1 }, rarity: 'common', points: 50, description: 'Essential for all life', realWorldUse: 'Drinking, cleaning' },
  { formula: 'CO2', name: 'Carbon Dioxide', atoms: { C: 1, O: 2 }, rarity: 'common', points: 50, description: 'Greenhouse gas', realWorldUse: 'Carbonated drinks' },
  { formula: 'NaCl', name: 'Table Salt', atoms: { Na: 1, Cl: 1 }, rarity: 'common', points: 50, description: 'Essential mineral', realWorldUse: 'Food seasoning' },
  { formula: 'O2', name: 'Oxygen Gas', atoms: { O: 2 }, rarity: 'common', points: 40, description: '21% of atmosphere', realWorldUse: 'Breathing' },
  { formula: 'N2', name: 'Nitrogen Gas', atoms: { N: 2 }, rarity: 'common', points: 40, description: '78% of atmosphere', realWorldUse: 'Fertilizers' },
  { formula: 'H2', name: 'Hydrogen Gas', atoms: { H: 2 }, rarity: 'common', points: 40, description: 'Lightest element', realWorldUse: 'Fuel cells' },
  { formula: 'CO', name: 'Carbon Monoxide', atoms: { C: 1, O: 1 }, rarity: 'common', points: 60, description: 'Toxic gas', realWorldUse: 'Industrial fuel' },
  { formula: 'CaCO3', name: 'Calcium Carbonate', atoms: { Ca: 1, C: 1, O: 3 }, rarity: 'common', points: 75, description: 'Chalk, limestone', realWorldUse: 'Construction' },
  { formula: 'SiO2', name: 'Silicon Dioxide', atoms: { Si: 1, O: 2 }, rarity: 'common', points: 60, description: 'Sand, quartz', realWorldUse: 'Glass making' },
  { formula: 'CaO', name: 'Quickite', atoms: { Ca: 1, O: 1 }, rarity: 'common', points: 55, description: 'Burnt lime', realWorldUse: 'Cement' },
  { formula: 'MgO', name: 'Magnesium Oxide', atoms: { Mg: 1, O: 1 }, rarity: 'common', points: 55, description: 'Mineral periclase', realWorldUse: 'Antacids' },
  { formula: 'KCl', name: 'Potassium Chloride', atoms: { K: 1, Cl: 1 }, rarity: 'common', points: 50, description: 'Salt substitute', realWorldUse: 'Fertilizers' },
  { formula: 'Cl2', name: 'Chlorine Gas', atoms: { Cl: 2 }, rarity: 'common', points: 45, description: 'Yellow-green gas', realWorldUse: 'Water treatment' },

  // ============ UNCOMMON (100-150 pts) ============
  { formula: 'NH3', name: 'Ammonia', atoms: { N: 1, H: 3 }, rarity: 'uncommon', points: 100, description: 'Pungent gas', realWorldUse: 'Fertilizers, cleaning' },
  { formula: 'CH4', name: 'Methane', atoms: { C: 1, H: 4 }, rarity: 'uncommon', points: 100, description: 'Natural gas', realWorldUse: 'Heating, cooking' },
  { formula: 'HCl', name: 'Hydrochloric Acid', atoms: { H: 1, Cl: 1 }, rarity: 'uncommon', points: 120, description: 'Strong acid', realWorldUse: 'Industrial cleaning' },
  { formula: 'NaOH', name: 'Sodium Hydroxide', atoms: { Na: 1, O: 1, H: 1 }, rarity: 'uncommon', points: 130, description: 'Caustic soda', realWorldUse: 'Soap making' },
  { formula: 'H2SO4', name: 'Sulfuric Acid', atoms: { H: 2, S: 1, O: 4 }, rarity: 'uncommon', points: 150, description: 'King of chemicals', realWorldUse: 'Batteries' },
  { formula: 'H2O2', name: 'Hydrogen Peroxide', atoms: { H: 2, O: 2 }, rarity: 'uncommon', points: 120, description: 'Oxidizer', realWorldUse: 'Disinfectant' },
  { formula: 'HF', name: 'Hydrofluoric Acid', atoms: { H: 1, F: 1 }, rarity: 'uncommon', points: 140, description: 'Extremely corrosive', realWorldUse: 'Glass etching' },
  { formula: 'HBr', name: 'Hydrobromic Acid', atoms: { H: 1, Br: 1 }, rarity: 'uncommon', points: 130, description: 'Strong acid', realWorldUse: 'Organic synthesis' },
  { formula: 'HI', name: 'Hydroiodic Acid', atoms: { H: 1, I: 1 }, rarity: 'uncommon', points: 135, description: 'Strong acid', realWorldUse: 'Pharmaceuticals' },
  { formula: 'Al2O3', name: 'Aluminum Oxide', atoms: { Al: 2, O: 3 }, rarity: 'uncommon', points: 140, description: 'Corundum', realWorldUse: 'Abrasives, gems' },
  { formula: 'FeO', name: 'Iron(II) Oxide', atoms: { Fe: 1, O: 1 }, rarity: 'uncommon', points: 110, description: 'Wüstite mineral', realWorldUse: 'Pigments' },
  { formula: 'CuO', name: 'Copper(II) Oxide', atoms: { Cu: 1, O: 1 }, rarity: 'uncommon', points: 120, description: 'Black copper oxide', realWorldUse: 'Ceramics' },
  { formula: 'ZnO', name: 'Zinc Oxide', atoms: { Zn: 1, O: 1 }, rarity: 'uncommon', points: 115, description: 'White powder', realWorldUse: 'Sunscreen' },
  { formula: 'LiH', name: 'Lithium Hydride', atoms: { Li: 1, H: 1 }, rarity: 'uncommon', points: 125, description: 'Hydrogen storage', realWorldUse: 'Rocket fuel' },
  { formula: 'NaH', name: 'Sodium Hydride', atoms: { Na: 1, H: 1 }, rarity: 'uncommon', points: 120, description: 'Strong base', realWorldUse: 'Organic synthesis' },
  { formula: 'CaH2', name: 'Calcium Hydride', atoms: { Ca: 1, H: 2 }, rarity: 'uncommon', points: 130, description: 'Drying agent', realWorldUse: 'Labs' },

  // ============ RARE (180-350 pts) ============
  { formula: 'C2H6O', name: 'Ethanol', atoms: { C: 2, H: 6, O: 1 }, rarity: 'rare', points: 250, description: 'Drinking alcohol', realWorldUse: 'Beverages, fuel' },
  { formula: 'C6H12O6', name: 'Glucose', atoms: { C: 6, H: 12, O: 6 }, rarity: 'rare', points: 350, description: 'Simple sugar', realWorldUse: 'Food, energy' },
  { formula: 'C3H8', name: 'Propane', atoms: { C: 3, H: 8 }, rarity: 'rare', points: 200, description: 'LPG fuel', realWorldUse: 'Grills, heating' },
  { formula: 'C2H6', name: 'Ethane', atoms: { C: 2, H: 6 }, rarity: 'rare', points: 180, description: 'Natural gas component', realWorldUse: 'Fuel' },
  { formula: 'C2H4', name: 'Ethylene', atoms: { C: 2, H: 4 }, rarity: 'rare', points: 200, description: 'Plant hormone', realWorldUse: 'Plastics' },
  { formula: 'C2H2', name: 'Acetylene', atoms: { C: 2, H: 2 }, rarity: 'rare', points: 220, description: 'Welding gas', realWorldUse: 'Welding, cutting' },
  { formula: 'HNO3', name: 'Nitric Acid', atoms: { H: 1, N: 1, O: 3 }, rarity: 'rare', points: 220, description: 'Strong oxidizer', realWorldUse: 'Explosives' },
  { formula: 'Fe2O3', name: 'Iron(III) Oxide', atoms: { Fe: 2, O: 3 }, rarity: 'rare', points: 200, description: 'Rust, hematite', realWorldUse: 'Pigments' },
  { formula: 'CuSO4', name: 'Copper Sulfate', atoms: { Cu: 1, S: 1, O: 4 }, rarity: 'rare', points: 280, description: 'Blue vitriol', realWorldUse: 'Fungicide' },
  { formula: 'NaHCO3', name: 'Baking Soda', atoms: { Na: 1, H: 1, C: 1, O: 3 }, rarity: 'rare', points: 220, description: 'Sodium bicarbonate', realWorldUse: 'Baking, cleaning' },
  { formula: 'LiOH', name: 'Lithium Hydroxide', atoms: { Li: 1, O: 1, H: 1 }, rarity: 'rare', points: 250, description: 'CO2 scrubber', realWorldUse: 'Batteries, spacecraft' },
  { formula: 'KOH', name: 'Potassium Hydroxide', atoms: { K: 1, O: 1, H: 1 }, rarity: 'rare', points: 240, description: 'Caustic potash', realWorldUse: 'Soap, batteries' },
  { formula: 'NaBr', name: 'Sodium Bromide', atoms: { Na: 1, Br: 1 }, rarity: 'rare', points: 180, description: 'Bromide salt', realWorldUse: 'Photography' },
  { formula: 'KBr', name: 'Potassium Bromide', atoms: { K: 1, Br: 1 }, rarity: 'rare', points: 190, description: 'Sedative', realWorldUse: 'Medicine, photo' },
  { formula: 'NaI', name: 'Sodium Iodide', atoms: { Na: 1, I: 1 }, rarity: 'rare', points: 200, description: 'Iodine source', realWorldUse: 'Medicine' },
  { formula: 'CaBr2', name: 'Calcium Bromide', atoms: { Ca: 1, Br: 2 }, rarity: 'rare', points: 210, description: 'Dense brine', realWorldUse: 'Oil drilling' },

  // ============ EPIC (400-600 pts) ============
  { formula: 'C8H10N4O2', name: 'Caffeine', atoms: { C: 8, H: 10, N: 4, O: 2 }, rarity: 'epic', points: 500, description: 'Stimulant', realWorldUse: 'Coffee, energy drinks' },
  { formula: 'C9H8O4', name: 'Aspirin', atoms: { C: 9, H: 8, O: 4 }, rarity: 'epic', points: 550, description: 'Pain reliever', realWorldUse: 'Medicine' },
  { formula: 'C12H22O11', name: 'Sucrose', atoms: { C: 12, H: 22, O: 11 }, rarity: 'epic', points: 600, description: 'Table sugar', realWorldUse: 'Sweetener' },
  { formula: 'AgNO3', name: 'Silver Nitrate', atoms: { Ag: 1, N: 1, O: 3 }, rarity: 'epic', points: 450, description: 'Photography chemical', realWorldUse: 'Photo, medicine' },
  { formula: 'AgBr', name: 'Silver Bromide', atoms: { Ag: 1, Br: 1 }, rarity: 'epic', points: 420, description: 'Light sensitive', realWorldUse: 'Photography' },
  { formula: 'AgI', name: 'Silver Iodide', atoms: { Ag: 1, I: 1 }, rarity: 'epic', points: 440, description: 'Cloud seeding', realWorldUse: 'Weather modification' },
  { formula: 'HgCl2', name: 'Mercury Chloride', atoms: { Hg: 1, Cl: 2 }, rarity: 'epic', points: 480, description: 'Corrosive sublimate', realWorldUse: 'Disinfectant' },
  { formula: 'HgO', name: 'Mercury Oxide', atoms: { Hg: 1, O: 1 }, rarity: 'epic', points: 460, description: 'Red mercury oxide', realWorldUse: 'Batteries' },
  { formula: 'PbO', name: 'Lead(II) Oxide', atoms: { Pb: 1, O: 1 }, rarity: 'epic', points: 400, description: 'Litharge', realWorldUse: 'Batteries, glass' },
  { formula: 'PbO2', name: 'Lead Dioxide', atoms: { Pb: 1, O: 2 }, rarity: 'epic', points: 420, description: 'Battery component', realWorldUse: 'Lead-acid batteries' },
  { formula: 'PbCl2', name: 'Lead Chloride', atoms: { Pb: 1, Cl: 2 }, rarity: 'epic', points: 410, description: 'White solid', realWorldUse: 'Pigments' },
  { formula: 'C6H8O7', name: 'Citric Acid', atoms: { C: 6, H: 8, O: 7 }, rarity: 'epic', points: 480, description: 'Citrus acid', realWorldUse: 'Food preservation' },
  { formula: 'FeCl3', name: 'Iron(III) Chloride', atoms: { Fe: 1, Cl: 3 }, rarity: 'epic', points: 400, description: 'Ferric chloride', realWorldUse: 'PCB etching' },
  { formula: 'CuCl2', name: 'Copper(II) Chloride', atoms: { Cu: 1, Cl: 2 }, rarity: 'epic', points: 380, description: 'Blue-green solid', realWorldUse: 'Wood preservative' },

  // ============ LEGENDARY (700-1000 pts) ============
  { formula: 'AuCl', name: 'Gold(I) Chloride', atoms: { Au: 1, Cl: 1 }, rarity: 'legendary', points: 750, description: 'Unstable gold salt', realWorldUse: 'Research' },
  { formula: 'AuCl3', name: 'Gold(III) Chloride', atoms: { Au: 1, Cl: 3 }, rarity: 'legendary', points: 800, description: 'Gold trichloride', realWorldUse: 'Gold plating' },
  { formula: 'Au2O3', name: 'Gold(III) Oxide', atoms: { Au: 2, O: 3 }, rarity: 'legendary', points: 900, description: 'Rare gold oxide', realWorldUse: 'Catalysis' },
  { formula: 'AuBr3', name: 'Gold(III) Bromide', atoms: { Au: 1, Br: 3 }, rarity: 'legendary', points: 850, description: 'Gold tribromide', realWorldUse: 'Research' },
  { formula: 'PtCl2', name: 'Platinum(II) Chloride', atoms: { Pt: 1, Cl: 2 }, rarity: 'legendary', points: 800, description: 'Platinum salt', realWorldUse: 'Catalysis' },
  { formula: 'PtCl4', name: 'Platinum(IV) Chloride', atoms: { Pt: 1, Cl: 4 }, rarity: 'legendary', points: 850, description: 'Platinum tetrachloride', realWorldUse: 'Plating' },
  { formula: 'PtO2', name: 'Platinum Dioxide', atoms: { Pt: 1, O: 2 }, rarity: 'legendary', points: 880, description: 'Adams catalyst', realWorldUse: 'Hydrogenation' },
  { formula: 'AgCl', name: 'Silver Chloride', atoms: { Ag: 1, Cl: 1 }, rarity: 'legendary', points: 700, description: 'Light sensitive', realWorldUse: 'Photography' },
  { formula: 'Ag2O', name: 'Silver Oxide', atoms: { Ag: 2, O: 1 }, rarity: 'legendary', points: 750, description: 'Battery material', realWorldUse: 'Button batteries' },
  { formula: 'Ag2S', name: 'Silver Sulfide', atoms: { Ag: 2, S: 1 }, rarity: 'legendary', points: 720, description: 'Tarnish', realWorldUse: 'Photography' },
  { formula: 'C10H14N2', name: 'Nicotine', atoms: { C: 10, H: 14, N: 2 }, rarity: 'legendary', points: 750, description: 'Tobacco alkaloid', realWorldUse: 'Insecticides' },

  // ============ MYTHIC (1200-2500 pts) ============
  { formula: 'UO2', name: 'Uranium Dioxide', atoms: { U: 1, O: 2 }, rarity: 'mythic', points: 1500, description: 'Nuclear fuel ☢️', realWorldUse: 'Nuclear reactors' },
  { formula: 'UO3', name: 'Uranium Trioxide', atoms: { U: 1, O: 3 }, rarity: 'mythic', points: 1600, description: 'Orange uranium oxide ☢️', realWorldUse: 'Nuclear fuel cycle' },
  { formula: 'UF4', name: 'Uranium Tetrafluoride', atoms: { U: 1, F: 4 }, rarity: 'mythic', points: 1800, description: 'Green salt ☢️', realWorldUse: 'Uranium processing' },
  { formula: 'UF6', name: 'Uranium Hexafluoride', atoms: { U: 1, F: 6 }, rarity: 'mythic', points: 2000, description: 'Enrichment gas ☢️', realWorldUse: 'Uranium enrichment' },
  { formula: 'UCl4', name: 'Uranium Tetrachloride', atoms: { U: 1, Cl: 4 }, rarity: 'mythic', points: 1700, description: 'Dark green solid ☢️', realWorldUse: 'Research' },
  { formula: 'PuO2', name: 'Plutonium Dioxide', atoms: { Pu: 1, O: 2 }, rarity: 'mythic', points: 2500, description: 'Nuclear material ☢️', realWorldUse: 'Nuclear weapons, RTGs' },
  { formula: 'PuF4', name: 'Plutonium Tetrafluoride', atoms: { Pu: 1, F: 4 }, rarity: 'mythic', points: 2200, description: 'Plutonium processing ☢️', realWorldUse: 'Nuclear industry' },
  { formula: 'AuCN', name: 'Gold Cyanide', atoms: { Au: 1, C: 1, N: 1 }, rarity: 'mythic', points: 1200, description: 'Gold extraction', realWorldUse: 'Gold mining' },
  { formula: 'PtF6', name: 'Platinum Hexafluoride', atoms: { Pt: 1, F: 6 }, rarity: 'mythic', points: 1400, description: 'Powerful oxidizer', realWorldUse: 'Research' },
]

export const BADGES: Badge[] = [
  { id: 'first', name: 'First Reaction', icon: '🔰', requirement: 'Create first compound', threshold: 1 },
  { id: 'chemist', name: 'Chemist', icon: '⚗️', requirement: 'Create 10 compounds', threshold: 10 },
  { id: 'scientist', name: 'Scientist', icon: '🧬', requirement: 'Create 25 compounds', threshold: 25 },
  { id: 'master', name: 'Master Chemist', icon: '🎓', requirement: 'Create 50 compounds', threshold: 50 },
  { id: 'uncommon', name: 'Beyond Basics', icon: '✨', requirement: 'Mint Uncommon', threshold: 1 },
  { id: 'rare', name: 'Rare Hunter', icon: '💎', requirement: 'Mint Rare', threshold: 1 },
  { id: 'epic', name: 'Epic Finder', icon: '🔮', requirement: 'Mint Epic', threshold: 1 },
  { id: 'legendary', name: 'Legend', icon: '👑', requirement: 'Mint Legendary', threshold: 1 },
  { id: 'mythic', name: 'Mythic Master', icon: '⚡', requirement: 'Mint Mythic', threshold: 1 },
  { id: 'streak5', name: 'On Fire', icon: '🔥', requirement: '5 streak', threshold: 5 },
  { id: 'gold', name: 'Alchemist', icon: '🥇', requirement: 'Gold compound', threshold: 1 },
  { id: 'nuclear', name: 'Nuclear Physicist', icon: '☢️', requirement: 'Uranium compound', threshold: 1 },
]

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9CA3AF',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
  mythic: '#EF4444',
}

export const RARITY_GLOW: Record<Rarity, string> = {
  common: '0 0 10px #9CA3AF',
  uncommon: '0 0 15px #22C55E',
  rare: '0 0 20px #3B82F6',
  epic: '0 0 30px #A855F7',
  legendary: '0 0 40px #F59E0B',
  mythic: '0 0 50px #EF4444, 0 0 100px #EF444450',
}

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary', mythic: 'Mythic',
}

export function formatFormula(atoms: Record<string, number>): string {
  const order = ['C', 'H']
  const sorted = Object.entries(atoms).sort(([a], [b]) => {
    const aIdx = order.indexOf(a)
    const bIdx = order.indexOf(b)
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return a.localeCompare(b)
  })
  return sorted.map(([s, c]) => `${s}${c > 1 ? c : ''}`).join('')
}

export function checkCompound(selectedAtoms: string[]): RolledCompound | null {
  const atomCount: Record<string, number> = {}
  selectedAtoms.forEach(a => { atomCount[a] = (atomCount[a] || 0) + 1 })
  const compound = COMPOUNDS.find(c => {
    const k1 = Object.keys(c.atoms).sort(), k2 = Object.keys(atomCount).sort()
    if (k1.length !== k2.length) return false
    return k1.every(k => c.atoms[k] === atomCount[k])
  })
  return compound ? { ...compound } : null
}

// Find compounds that can be made with selected elements (based on valence/chemistry)
export function findPossibleCompounds(selectedElements: string[]): Compound[] {
  const elementSet = new Set(selectedElements)
  return COMPOUNDS.filter(c => Object.keys(c.atoms).every(a => elementSet.has(a)))
    .sort((a, b) => {
      const aTotal = Object.values(a.atoms).reduce((s, n) => s + n, 0)
      const bTotal = Object.values(b.atoms).reduce((s, n) => s + n, 0)
      return aTotal - bTotal
    })
}

// Find partial matches (what compound you might be building)
export function findPartialMatches(atomCounts: Record<string, number>): Compound[] {
  if (Object.keys(atomCounts).length === 0) return []
  return COMPOUNDS.filter(c => 
    Object.entries(atomCounts).every(([a, cnt]) => c.atoms[a] !== undefined && c.atoms[a] >= cnt)
  ).slice(0, 5)
}

// Smart prediction based on valence electrons
export function predictStableCompounds(selectedElements: string[]): Compound[] {
  if (selectedElements.length === 0) return []
  const elementSet = new Set(selectedElements)
  
  // Find all compounds that use ONLY these elements
  return COMPOUNDS.filter(c => {
    const compoundElements = Object.keys(c.atoms)
    return compoundElements.every(e => elementSet.has(e))
  }).sort((a, b) => {
    // Sort by complexity (fewer atoms = simpler = shown first)
    const aTotal = Object.values(a.atoms).reduce((s, n) => s + n, 0)
    const bTotal = Object.values(b.atoms).reduce((s, n) => s + n, 0)
    if (aTotal !== bTotal) return aTotal - bTotal
    // Then by rarity
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']
    return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
  })
}

export function generateTokenURI(formula: string, name: string, rarity: Rarity, points: number): string {
  const metadata = { name: `${name} (${formula})`, description: `A ${rarity} molecule`, attributes: [{ trait_type: 'Formula', value: formula }, { trait_type: 'Rarity', value: rarity }, { trait_type: 'Points', value: points }] }
  return `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`
}

export function getBadgeById(id: string): Badge | undefined { return BADGES.find(b => b.id === id) }

export function getElementsByCategory(): Record<ElementCategory, Atom[]> {
  const grouped: Record<ElementCategory, Atom[]> = { 'nonmetal': [], 'noble-gas': [], 'alkali-metal': [], 'alkaline-earth': [], 'metalloid': [], 'halogen': [], 'transition-metal': [], 'post-transition': [], 'lanthanide': [], 'actinide': [] }
  ATOMS.forEach(a => { grouped[a.category].push(a) })
  return grouped
}

export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  'nonmetal': 'Non-metals', 'noble-gas': 'Noble Gases', 'alkali-metal': 'Alkali Metals', 'alkaline-earth': 'Alkaline Earth', 'metalloid': 'Metalloids', 'halogen': 'Halogens', 'transition-metal': 'Transition Metals', 'post-transition': 'Post-transition', 'lanthanide': 'Lanthanides', 'actinide': 'Actinides',
}
