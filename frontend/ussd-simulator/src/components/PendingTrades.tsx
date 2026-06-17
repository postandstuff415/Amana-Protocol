import { useState } from 'react'

interface Trade {
  id: string
  supplier: string
  amount: number
  date: string
  status: 'escrowed' | 'disputed' | 'released'
}

const sampleTrades: Trade[] = [
  { id: 'AM-001', supplier: '254712345678', amount: 850.00, date: '2026-06-01', status: 'escrowed' },
  { id: 'AM-002', supplier: '254723456789', amount: 1200.00, date: '2026-06-03', status: 'escrowed' },
  { id: 'AM-003', supplier: '254734567890', amount: 350.00, date: '2026-06-05', status: 'escrowed' },
  { id: 'AM-004', supplier: '254745678901', amount: 2100.00, date: '2026-06-07', status: 'escrowed' },
]

interface PendingTradesProps {
  onBack: () => void
  onConfirmDelivery: (tradeId: string) => void
  onDispute: (tradeId: string) => void
}

export default function PendingTrades({ onBack, onConfirmDelivery, onDispute }: PendingTradesProps) {
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)

  const openDetail = (trade: Trade) => {
    setSelectedTrade(trade)
    setView('detail')
  }

  if (view === 'detail' && selectedTrade) {
    return (
      <div className="flex flex-col h-full min-h-[28rem]">
        <div className="bg-green-900/60 px-4 py-3 border-b border-green-800/50">
          <p className="text-green-300 font-mono text-sm">Amana Escrow</p>
          <p className="text-gray-400 text-xs font-mono">Trade {selectedTrade.id}</p>
        </div>
        <div className="flex-1 p-4">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 mb-5">
            <div className="text-left space-y-3 text-sm">
              <div className="flex justify-between pb-2 border-b border-gray-800">
                <span className="text-gray-400">Trade ID</span>
                <span className="text-white font-mono">{selectedTrade.id}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-800">
                <span className="text-gray-400">Supplier</span>
                <span className="text-white font-mono">+{selectedTrade.supplier}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-800">
                <span className="text-gray-400">Amount</span>
                <span className="text-green-400 font-bold">${selectedTrade.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-800">
                <span className="text-gray-400">Date</span>
                <span className="text-gray-300">{selectedTrade.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="text-yellow-400 font-medium">In Escrow</span>
              </div>
            </div>
          </div>

          <p className="text-gray-300 text-sm font-medium mb-3">Goods received?</p>

          <button
            onClick={() => { onConfirmDelivery(selectedTrade.id); onBack() }}
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl mb-3 transition-all"
          >
            ✓ Confirm Delivery — Release Funds
          </button>

          <button
            onClick={() => { onDispute(selectedTrade.id); onBack() }}
            className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all"
          >
            ⚠ File a Dispute
          </button>

          <button onClick={onBack} className="w-full text-center text-gray-500 text-sm mt-3 hover:text-gray-400">
            ← Back to List
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-[28rem]">
      <div className="bg-green-900/60 px-4 py-3 border-b border-green-800/50">
        <p className="text-green-300 font-mono text-sm">Amana Escrow</p>
        <p className="text-gray-400 text-xs font-mono">Pending Trades</p>
      </div>

      <div className="flex-1 p-3">
        <p className="text-gray-500 text-xs mb-2 font-mono">Select a trade:</p>

        <div className="space-y-2">
          {sampleTrades.map((trade) => (
            <button
              key={trade.id}
              onClick={() => openDetail(trade)}
              className="w-full text-left bg-gray-800/50 hover:bg-gray-800 rounded-xl p-3 border border-gray-700/50 transition-colors"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-white font-mono text-xs">{trade.id}</span>
                <span className="text-yellow-400 text-[10px] px-2 py-0.5 bg-yellow-900/30 rounded-full">
                  Escrowed
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">+{trade.supplier}</span>
                <span className="text-green-400 font-bold text-sm">${trade.amount.toFixed(2)}</span>
              </div>
              <span className="text-gray-600 text-[10px]">{trade.date}</span>
            </button>
          ))}
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