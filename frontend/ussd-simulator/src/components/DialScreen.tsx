interface DialScreenProps {
  onDial: () => void
}

export default function DialScreen({ onDial }: DialScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[28rem] p-6 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-900/40 border-2 border-green-500/50 flex items-center justify-center">
          <span className="text-3xl text-green-400 font-bold">A</span>
        </div>
        <h1 className="text-white text-xl font-bold mb-2">Amana Protocol</h1>
        <p className="text-gray-400 text-sm">Zero-Trust B2B Escrow</p>
      </div>

      <div className="w-full bg-gray-800/80 rounded-xl p-4 mb-6 border border-gray-700">
        <p className="text-gray-300 text-sm mb-3">Dial this code to open the menu:</p>
        <div className="bg-gray-900 rounded-lg py-3 px-4 border border-gray-600">
          <span className="text-green-400 text-2xl font-mono font-bold tracking-wider">*483#</span>
        </div>
      </div>

      <button
        onClick={onDial}
        className="w-full py-4 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold text-lg rounded-xl transition-all duration-150 shadow-lg shadow-green-900/40"
      >
        ▶ Dial Now
      </button>

      <p className="text-gray-600 text-xs mt-4">Simulated feature phone experience</p>
    </div>
  )
}