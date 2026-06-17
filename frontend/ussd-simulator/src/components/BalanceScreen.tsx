interface BalanceScreenProps {
  onBack: () => void
}

export default function BalanceScreen({ onBack }: BalanceScreenProps) {
  return (
    <div className="flex flex-col h-full min-h-[28rem]">
      <div className="bg-green-900/60 px-4 py-3 border-b border-green-800/50">
        <p className="text-green-300 font-mono text-sm">Amana Escrow</p>
        <p className="text-gray-400 text-xs font-mono">Balance</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full bg-gray-800/80 rounded-2xl p-5 border border-gray-700 mb-4">
          <p className="text-gray-400 text-xs mb-1">Available Balance</p>
          <p className="text-green-400 text-3xl font-bold font-mono">$1,245.80</p>
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-700">
            <div>
              <p className="text-gray-500 text-[10px]">Escrowed</p>
              <p className="text-yellow-400 text-sm font-mono">$4,230.00</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px]">Total Volume</p>
              <p className="text-white text-sm font-mono">$8,525.50</p>
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-2">Trust Score</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }} />
            </div>
            <span className="text-green-400 font-bold text-sm">82</span>
          </div>
          <p className="text-gray-600 text-[10px] mt-1">Good standing — 12 trades completed</p>
        </div>
      </div>

      <div className="px-3 py-2 border-t border-gray-800">
        <button onClick={onBack} className="w-full text-center text-gray-500 text-sm hover:text-gray-400">
          ← Back to Menu
        </button>
      </div>
    </div>
  )
}