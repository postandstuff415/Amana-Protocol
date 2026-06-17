interface MainMenuProps {
  onSelect: (option: string) => void
}

const menuItems = [
  { key: 'new-trade', label: 'New Trade', shortcut: '1' },
  { key: 'pending', label: 'Pending Trades', shortcut: '2' },
  { key: 'balance', label: 'Balance', shortcut: '3' },
  { key: 'help', label: 'Help', shortcut: '4' },
]

export default function MainMenu({ onSelect }: MainMenuProps) {
  return (
    <div className="flex flex-col h-full min-h-[28rem]">
      {/* Header bar */}
      <div className="bg-green-900/60 px-4 py-3 border-b border-green-800/50">
        <p className="text-green-300 font-mono text-sm">Amana Escrow</p>
        <p className="text-gray-400 text-xs font-mono">*483# Main Menu</p>
      </div>

      {/* Menu items */}
      <div className="flex-1 p-3 space-y-1">
        <p className="text-gray-500 text-xs mb-2 font-mono">Select an option:</p>
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800/80 active:bg-gray-700/80 transition-colors border border-transparent hover:border-gray-700 group"
          >
            <span className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-green-400 font-mono font-bold text-sm group-hover:bg-gray-700">
              {item.shortcut}
            </span>
            <span className="text-white font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-800">
        <p className="text-gray-600 text-[10px] font-mono text-center">
          Reply with number or type 0 to go back
        </p>
      </div>
    </div>
  )
}