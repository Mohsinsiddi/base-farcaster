'use client'

interface NavbarProps {
  activeTab: 'lab' | 'ranks' | 'profile'
  onTabChange: (tab: 'lab' | 'ranks' | 'profile') => void
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const tabs = [
    { id: 'lab' as const, label: 'Lab', icon: '🧪' },
    { id: 'ranks' as const, label: 'Ranks', icon: '🏆' },
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#001226] border-t border-[#0A5CDD]/30 px-4 py-2 z-40">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center py-2 px-6 rounded-xl transition-all ${
              activeTab === tab.id ? 'bg-[#0A5CDD]/20 text-[#0A5CDD]' : 'text-[#6B7280]'
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
