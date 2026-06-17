import { useState } from 'react'

interface DisputeScreenProps {
  onBack: () => void
  onSubmitted: () => void
}

const disputeReasons = [
  'Goods not delivered',
  'Wrong items received',
  'Damaged goods',
  'Quantity mismatch',
  'Supplier unresponsive',
  'Payment dispute',
]

export default function DisputeScreen({ onBack, onSubmitted }: DisputeScreenProps) {
  const [step, setStep] = useState<'reason' | 'details' | 'submitted'>('reason')
  const [selectedReason, setSelectedReason] = useState('')
  const [details, setDetails] = useState('')

  const handleSubmit = () => {
    setStep('submitted')
  }

  if (step === 'submitted') {
    return (
      <div className="flex flex-col h-full min-h-[28rem]">
        <div className="bg-orange-900/60 px-4 py-3 border-b border-orange-800/50">
          <p className="text-orange-300 font-mono text-sm">Amana Escrow</p>
          <p className="text-gray-400 text-xs font-mono">Dispute Filed</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-orange-900/40 border-2 border-orange-500 flex items-center justify-center mb-4">
            <span className="text-orange-400 text-2xl">⚖</span>
          </div>
          <h2 className="text-white text-lg font-bold mb-2">Dispute Registered</h2>
          <p className="text-gray-400 text-sm mb-4">
            Case #AM-DSP-{Math.floor(1000 + Math.random() * 9000)}
          </p>
          <div className="bg-gray-800/80 rounded-xl p-4 w-full border border-gray-700">
            <p className="text-yellow-400 text-xs font-medium mb-2">Tier 1: Ambassador Assigned</p>
            <p className="text-gray-400 text-xs">
              An Amana ambassador will contact both parties within 24 hours. Resolution target: 48 hours.
            </p>
          </div>
          <button
            onClick={onSubmitted}
            className="mt-6 text-green-400 underline text-sm"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-[28rem]">
      <div className="bg-orange-900/60 px-4 py-3 border-b border-orange-800/50">
        <p className="text-orange-300 font-mono text-sm">Amana Escrow</p>
        <p className="text-gray-400 text-xs font-mono">File a Dispute</p>
      </div>

      <div className="flex-1 p-4">
        {step === 'reason' && (
          <>
            <p className="text-gray-300 text-sm font-medium mb-3">Why are you disputing this trade?</p>
            <div className="space-y-1">
              {disputeReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => { setSelectedReason(reason); setStep('details') }}
                  className="w-full text-left px-3 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 transition-all"
                >
                  <span className="text-white text-sm">{reason}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            <p className="text-gray-300 text-sm font-medium mb-2">Selected reason:</p>
            <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700 mb-4">
              <span className="text-orange-400 text-sm">{selectedReason}</span>
            </div>
            <label className="text-gray-300 text-sm font-medium block mb-2">
              Additional details (optional):
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 200))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm outline-none min-h-[5rem] resize-none"
              placeholder="Describe what happened..."
            />
            <p className="text-gray-600 text-xs mt-1 text-right">{details.length}/200</p>

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl mt-4 transition-all"
            >
              ⚖ Submit Dispute
            </button>
          </>
        )}
      </div>

      <div className="px-3 py-2 border-t border-gray-800">
        <button
          onClick={step === 'reason' ? onBack : () => setStep('reason')}
          className="w-full text-center text-gray-500 text-sm hover:text-gray-400"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}