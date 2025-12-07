'use client'

import { useState, useRef, useEffect } from 'react'
import { ATOMS, getElementsByCategory, CATEGORY_LABELS, type ElementCategory } from '@/lib/gameData'

interface ElementPickerProps {
  onSelectAtom: (symbol: string) => void
  selectedCounts: Record<string, number>
  disabled?: boolean
}

const CATEGORY_ORDER: ElementCategory[] = ['nonmetal', 'halogen', 'alkali-metal', 'alkaline-earth', 'transition-metal', 'post-transition', 'metalloid', 'noble-gas', 'actinide']

export function ElementPicker({ onSelectAtom, selectedCounts, disabled = false }: ElementPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<ElementCategory | 'all'>('all')
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const groupedElements = getElementsByCategory()
  const filteredAtoms = (activeCategory === 'all' ? ATOMS : groupedElements[activeCategory])
    .filter(a => searchQuery === '' || a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || a.name.toLowerCase().includes(searchQuery.toLowerCase()))

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus()
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleSelect = (symbol: string) => {
    onSelectAtom(symbol)
  }

  const totalSelected = Object.values(selectedCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(true)} disabled={disabled} className="w-full bg-[#001226] border border-[#0A5CDD]/30 rounded-xl px-4 py-3 flex items-center justify-between hover:border-[#0A5CDD] transition-colors disabled:opacity-50">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚛️</span>
          <span className="text-white font-medium">Add Elements</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#6B7280] text-sm">{totalSelected}/30</span>
          <span className="text-[#0A5CDD]">▼</span>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center">
          <div ref={modalRef} className="bg-[#000814] border-t border-[#0A5CDD]/30 rounded-t-2xl w-full max-h-[75vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-[#0A5CDD]/20">
              <h3 className="text-white font-bold text-lg">Periodic Table</h3>
              <button onClick={() => setIsOpen(false)} className="text-[#6B7280] hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="p-3 border-b border-[#0A5CDD]/20">
              <input ref={inputRef} type="text" placeholder="Search element..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#001226] border border-[#1F2937] rounded-xl px-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#0A5CDD]" />
            </div>

            <div className="flex gap-2 px-3 py-2 overflow-x-auto border-b border-[#0A5CDD]/20 scrollbar-hide">
              <button onClick={() => setActiveCategory('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeCategory === 'all' ? 'bg-[#0A5CDD] text-white' : 'bg-[#1F2937] text-[#6B7280]'}`}>All</button>
              {CATEGORY_ORDER.map(cat => groupedElements[cat]?.length > 0 && (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeCategory === cat ? 'bg-[#0A5CDD] text-white' : 'bg-[#1F2937] text-[#6B7280]'}`}>{CATEGORY_LABELS[cat].split(' ')[0]}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-5 gap-2">
                {filteredAtoms.map(atom => {
                  const count = selectedCounts[atom.symbol] || 0
                  return (
                    <button key={atom.symbol} onClick={() => handleSelect(atom.symbol)} className="relative flex flex-col items-center p-2 rounded-xl transition-all active:scale-95" style={{ backgroundColor: atom.bg + '25', border: `1px solid ${atom.bg}50` }}>
                      <span className="text-[10px] text-[#6B7280]">{atom.atomicNumber}</span>
                      <span className="text-lg font-bold" style={{ color: atom.bg }}>{atom.symbol}</span>
                      <span className="text-[9px] text-[#6B7280] truncate w-full text-center">{atom.name}</span>
                      {count > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0A5CDD] text-white text-[10px] rounded-full flex items-center justify-center font-bold">{count}</span>}
                    </button>
                  )
                })}
              </div>
              {filteredAtoms.length === 0 && <p className="text-center text-[#6B7280] py-8">No elements found</p>}
            </div>

            <div className="p-3 border-t border-[#0A5CDD]/20">
              <button onClick={() => setIsOpen(false)} className="w-full bg-[#0A5CDD] text-white py-3 rounded-xl font-bold text-lg">Done ({totalSelected} atoms)</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
