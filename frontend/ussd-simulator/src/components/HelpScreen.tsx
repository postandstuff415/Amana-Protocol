interface HelpScreenProps {
  onBack: () => void
}

export default function HelpScreen({ onBack }: HelpScreenProps) {
  return (
    <div className="flex flex-col h-full min-h-[28rem]">
      <div className="bg-green-900/60 px-4 py-3 border-b border-green-800/50">
        <p className="text-green-300 font-mono text-sm">Amana Escrow</p>
        <p className="text-gray-400 text-xs font-mono">Help</p>
      </div>

      <div className="flex-1 p-4 space-y-3">
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
          <p className="text-green-400 text-xs font-bold mb-1">What is Amana Escrow?</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            A zero-trust B2B escrow for African merchants. Funds are held securely until both parties confirm.
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
          <p className="text-green-400 text-xs font-bold mb-1">How it works</p>
          <ol className="text-gray-400 text-xs leading-relaxed space-y-1 list-decimal list-inside">
            <li>Buyer initiates trade & deposits funds</li>
            <li>Funds held in smart contract escrow</li>
            <li>Supplier delivers goods</li>
            <li>Buyer confirms delivery</li>
            <li>Funds released to supplier</li>
          </ol>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
          <p className="text-green-400 text-xs font-bold mb-1">Fees</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            Only 1% protocol fee — no hidden charges. No bank wire fees. No FX premiums.
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
          <p className="text-green-400 text-xs font-bold mb-1">Support</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            Call +254 20 386 3988 or email support@amanaprotocol.io
          </p>
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