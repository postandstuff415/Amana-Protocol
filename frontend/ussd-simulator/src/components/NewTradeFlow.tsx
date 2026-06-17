import { useState } from 'react'

interface NewTradeFlowProps {
  onConfirm: (supplier: string, amount: string) => void
  onBack: () => void
}

type Step = 'supplier' | 'amount' | 'confirm' | 'submitted'

export default function NewTradeFlow({ onConfirm, onBack }: NewTradeFlowProps) {
  const [step, setStep] = useState<Step>('supplier')
  const [supplier, setSupplier] = useState('')
  const [amount, setAmount] = useState('')
  const [input, setInput] = useState('')

  const handleSubmit = () => {
    if (step === 'supplier') {
      if (input.length >= 8) {
        setSupplier(input)
        setInput('')
        setStep('amount')
      }
    } else if (step === 'amount') {
      const num = parseFloat(input)
      if (num > 0 && num <= 10000) {
        setAmount(input)
        setInput('')
        setStep('confirm')
      }
    } else if (step === 'confirm') {
      onConfirm(supplier, amount)
      setStep('submitted')
    }
  }

  if (step === 'submitted') {
    return (
      <div className="flex flex-col h-full min-h-[28rem]">
        <div className="bg-green-900/60 px-4 py-3 border-b border-green-800/50">
          <p className="text-green-300 font-mono text-sm">Amana Escrow</p>
          <p className="text-gray-400 text-xs font-mono">New Trade</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-green-900/40 border-2 border-green-500 flex items-center justify-center mb-4">
            <span className="text-green-400 text-2xl">✓</span>
          </div>
          <h2 className="text-white text-lg font-bold mb-2">Trade Created!</h2>
          <div className="bg-gray-800/80 rounded-xl p-4 w-full mb-4 border border-gray-700">
            <div className="text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Supplier:</span>
                <span className="text-white font-mono">{supplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-green-400 font-bold">${amount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-yellow-400">Pending</span>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-xs">Supplier notified. Funds held in escrow.</p>
          <button onClick={onBack} className="mt-6 text-green-400 underline text-sm">
            ← Back to Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-[28rem]">
      <div className="bg-green-900/60 px-4 py-3 border-b border-green-800/50">
        <p className="text-green-300 font-mono text-sm">Amana Escrow</p>
        <p className="text-gray-400 text-xs font-mono">New Trade</p>
      </div>

      <div className="flex-1 p-4">
        {/* Progress steps */}
        <div className="flex items-center gap-1 mb-5">
          {['supplier', 'amount', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  ['supplier', 'amount', 'confirm'].indexOf(step) >= i
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-500'
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="flex-1 h-[2px] bg-gray-700" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        {step === 'supplier' && (
          <>
            <label className="text-gray-300 text-sm font-medium block mb-2">
              Enter supplier phone number:
            </label>
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-3 mb-4">
              <span className="text-gray-500 font-mono">+254 </span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/\D/g, '').slice(0, 9))}
                className="bg-transparent text-white font-mono text-lg outline-none w-32"
                placeholder="712345678"
                autoFocus
              />
            </div>
            <p className="text-gray-600 text-xs mb-4">Enter the supplier's Safaricom number</p>
          </>
        )}

        {step === 'amount' && (
          <>
            <label className="text-gray-300 text-sm font-medium block mb-2">
              Enter trade amount (USD):
            </label>
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-3 mb-4">
              <span className="text-green-400 font-mono">$ </span>
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, '')
                  setInput(v)
                }}
                className="bg-transparent text-white font-mono text-lg outline-none w-24"
                placeholder="500.00"
                autoFocus
              />
            </div>
            <p className="text-gray-600 text-xs mb-4">
              Min: $10 | Max: $10,000 | 1% protocol fee
            </p>
          </>
        )}

        {step === 'confirm' && (
          <div>
            <p className="text-gray-300 text-sm font-medium mb-3">Confirm trade details:</p>
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 mb-4">
              <div className="text-left space-y-3">
                <div className="flex justify-between pb-2 border-b border-gray-800">
                  <span className="text-gray-400 text-sm">Supplier</span>
                  <span className="text-white font-mono text-sm">+254 {supplier}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-800">
                  <span className="text-gray-400 text-sm">Amount</span>
                  <span className="text-green-400 font-bold">${parseFloat(amount).toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-800">
                  <span className="text-gray-400 text-sm">Escrow Fee (1%)</span>
                  <span className="text-orange-400">${(parseFloat(amount) * 0.01).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Total Deducted</span>
                  <span className="text-white font-bold">${(parseFloat(amount) * 1.01).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit / Next button */}
        <button
          onClick={handleSubmit}
          disabled={
            (step === 'supplier' && input.length < 8) ||
            (step === 'amount' && (!input || parseFloat(input) <= 0))
          }
          className="w-full py-3 bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 hover:bg-green-500 text-white font-bold rounded-xl transition-all disabled:cursor-not-allowed"
        >
          {step === 'confirm' ? '✅ Confirm & Submit' : 'Next →'}
        </button>

        <button onClick={step === 'supplier' ? onBack : () => { setInput(''); setStep('supplier') }} className="w-full text-center text-gray-500 text-sm mt-3 hover:text-gray-400">
          {step === 'supplier' ? '← Cancel' : '← Back'}
        </button>
      </div>
    </div>
  )
}