import { useState } from 'react'
import FeaturePhone from './components/FeaturePhone'
import DialScreen from './components/DialScreen'
import MainMenu from './components/MainMenu'
import NewTradeFlow from './components/NewTradeFlow'
import PendingTrades from './components/PendingTrades'
import DisputeScreen from './components/DisputeScreen'
import BalanceScreen from './components/BalanceScreen'
import HelpScreen from './components/HelpScreen'

type Screen =
  | 'dial'
  | 'menu'
  | 'new-trade'
  | 'pending'
  | 'dispute'
  | 'balance'
  | 'help'

export default function App() {
  const [screen, setScreen] = useState<Screen>('dial')
  const [notifications, setNotifications] = useState<string[]>([])

  const handleDial = () => {
    setScreen('menu')
  }

  const handleMenuSelect = (option: string) => {
    setScreen(option as Screen)
  }

  const handleBackToMenu = () => {
    setScreen('menu')
  }

  const handleConfirmDelivery = (tradeId: string) => {
    setNotifications((prev) => [...prev, `✓ Trade ${tradeId} — funds released to supplier`])
  }

  const handleDispute = (tradeId: string) => {
    setScreen('dispute')
  }

  const renderScreen = () => {
    switch (screen) {
      case 'dial':
        return <DialScreen onDial={handleDial} />
      case 'menu':
        return <MainMenu onSelect={handleMenuSelect} />
      case 'new-trade':
        return (
          <NewTradeFlow
            onConfirm={(supplier, amount) => {
              setNotifications((prev) => [
                ...prev,
                `✓ New trade created: $${amount} with +254${supplier}`,
              ])
            }}
            onBack={handleBackToMenu}
          />
        )
      case 'pending':
        return (
          <PendingTrades
            onBack={handleBackToMenu}
            onConfirmDelivery={handleConfirmDelivery}
            onDispute={handleDispute}
          />
        )
      case 'dispute':
        return (
          <DisputeScreen
            onBack={handleBackToMenu}
            onSubmitted={handleBackToMenu}
          />
        )
      case 'balance':
        return <BalanceScreen onBack={handleBackToMenu} />
      case 'help':
        return <HelpScreen onBack={handleBackToMenu} />
      default:
        return <DialScreen onDial={handleDial} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      {/* Notification toast */}
      {notifications.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2 w-80">
          {notifications.map((n, i) => (
            <div
              key={i}
              className="bg-green-900/90 backdrop-blur-sm border border-green-700 text-green-200 text-xs p-3 rounded-xl shadow-lg flex items-start gap-2 animate-slide-down"
            >
              <span className="text-green-400 mt-0.5">✓</span>
              <span>{n}</span>
              <button
                onClick={() => setNotifications((p) => p.filter((_, j) => j !== i))}
                className="ml-auto text-green-500 hover:text-green-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="text-center pt-6 pb-2">
        <h1 className="text-white text-2xl font-bold tracking-tight">
          Amana <span className="text-green-400">USSD</span> Simulator
        </h1>
        <p className="text-gray-500 text-xs mt-1">
          Interactive feature phone experience — *483#
        </p>
      </div>

      {/* Phone */}
      <FeaturePhone>
        {renderScreen()}
      </FeaturePhone>

      {/* Screen indicator */}
      <div className="text-center pb-8">
        <span className="text-gray-600 text-[10px] font-mono bg-gray-800/50 px-3 py-1 rounded-full">
          Screen: {screen}
        </span>
      </div>
    </div>
  )
}