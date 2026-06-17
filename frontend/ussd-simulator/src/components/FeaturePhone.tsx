import { type ReactNode } from 'react'

interface FeaturePhoneProps {
  children: ReactNode
}

export default function FeaturePhone({ children }: FeaturePhoneProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      {/* Phone body */}
      <div className="relative w-80 bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-black/50 border-2 border-gray-700 p-3">
        {/* Top bar */}
        <div className="flex justify-between items-center px-4 py-2 text-white/70 text-xs font-mono">
          <span>Amana</span>
          <span className="text-green-400">●●●</span>
        </div>

        {/* Screen */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 min-h-[28rem]">
          {children}
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-between items-center px-6 pt-3 pb-1">
          <button className="w-10 h-10 rounded-full border-2 border-gray-600 text-white/50 text-xs flex items-center justify-center">
            ←
          </button>
          <button className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white text-sm font-bold shadow-lg shadow-green-900/50 flex items-center justify-center">
            OK
          </button>
          <button className="w-10 h-10 rounded-full border-2 border-gray-600 text-white/50 text-xs flex items-center justify-center">
            →
          </button>
        </div>
      </div>
    </div>
  )
}