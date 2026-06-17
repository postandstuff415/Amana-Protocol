/**
 * Amana Protocol - Admin Dashboard
 *
 * Refactored to use the centralized API utility with per-call loading states,
 * error handling, and graceful fallback to mock data when API is unreachable.
 */

import { useState, useEffect, useCallback } from 'react'
import { fetchAllDashboardData } from './api/api'
import { MOCK_ALL } from './api/mockData'
import type { Merchant, Trade, Dispute } from './api/api'
import { API_CONFIG } from './api/config'

/* ─── Components ─── */

function StatCard({ label, value, sub, change }: { label: string; value: string; sub?: string; change?: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {(sub || change) && (
        <div className="flex items-center gap-2 mt-1">
          {change && <span className={change.startsWith('+') ? 'text-green-400 text-xs' : 'text-red-400 text-xs'}>{change}</span>}
          {sub && <span className="text-gray-600 text-xs">{sub}</span>}
        </div>
      )}
    </div>
  )
}

function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  let cumulative = 0
  const segments = data.map((d) => {
    const start = cumulative
    cumulative += (d.value / total) * 100
    return { ...d, pct: (d.value / total) * 100, start }
  })

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 100 100" className="flex-shrink-0">
        {segments.map((s) => {
          const offset = (s.start / 100) * 360
          const angle = (s.pct / 100) * 360
          const largeArc = angle > 180 ? 1 : 0
          const endX = 50 + 40 * Math.cos(((offset + angle - 90) * Math.PI) / 180)
          const endY = 50 + 40 * Math.sin(((offset + angle - 90) * Math.PI) / 180)
          const startX = 50 + 40 * Math.cos(((offset - 90) * Math.PI) / 180)
          const startY = 50 + 40 * Math.sin(((offset - 90) * Math.PI) / 180)
          if (s.pct >= 99.9) return <circle key={s.label} cx="50" cy="50" r="40" fill="none" stroke={s.color} strokeWidth="18" />
          return <path key={s.label} d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`} fill={s.color} stroke="#0a0a0a" strokeWidth="1" />
        })}
        <circle cx="50" cy="50" r="25" fill="#0a0a0a" />
      </svg>
      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
            <span className="text-gray-400 text-sm">{s.label}</span>
            <span className="text-white text-sm font-mono">{s.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Overview Tab ─── */
function Overview({ trades, merchants, disputes, dataSource }: { trades: Trade[]; merchants: Merchant[]; disputes: Dispute[]; dataSource: 'api' | 'mock' }) {
  const totalVolume = trades.reduce((s, t) => s + (parseInt(t.amount) / 1e18), 0)
  const totalVolumeDisplay = totalVolume.toFixed(0)
  const activeMerchants = merchants.filter(m => m.status === 'active').length
  const avgFloat = (totalVolume * 0.15).toFixed(0)

  const statusCounts: Record<string, number> = {}
  trades.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1 })

  const revenuePie = [
    { label: 'Front-End (35%)', value: 35, color: '#22c55e' },
    { label: 'Middle-End (40%)', value: 40, color: '#10b981' },
    { label: 'Back-End (25%)', value: 25, color: '#14b8a6' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        {dataSource === 'api' ? (
          <span className="text-green-400 text-[10px] font-mono bg-green-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Live API
          </span>
        ) : (
          <span className="text-yellow-400 text-[10px] font-mono bg-yellow-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Fallback Mock Data
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Trades" value={trades.length.toString()} />
        <StatCard label="Active Merchants" value={activeMerchants.toString()} sub={`of ${merchants.length} registered`} />
        <StatCard label="Est. Daily Float" value={`$${parseInt(avgFloat).toLocaleString()}`} sub="USDC (est. 15% of volume)" />
        <StatCard label="Total Volume" value={`$${parseInt(totalVolumeDisplay).toLocaleString()}`} sub="USDC across all trades" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3">Trades by Status</h3>
          <div className="space-y-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-gray-400 text-sm capitalize">{status.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 sm:w-32 bg-gray-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(count / trades.length) * 100}%` }} />
                  </div>
                  <span className="text-white text-xs font-mono w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm mb-4">Revenue Split (Everyone Eats)</h3>
          <PieChart data={revenuePie} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: 'Offer Created', key: 'offer_created', color: 'bg-yellow-500' },
          { label: 'Buyer Funded', key: 'buyer_funded', color: 'bg-blue-500' },
          { label: 'In Transit', key: 'in_transit', color: 'bg-purple-500' },
          { label: 'Delivered', key: 'delivery_confirmed', color: 'bg-teal-500' },
          { label: 'Disputed', key: 'dispute_opened', color: 'bg-orange-500' },
          { label: 'Completed', key: 'completed', color: 'bg-green-500' },
        ].map((s) => (
          <div key={s.key} className="bg-white/[0.03] border border-white/10 rounded-lg p-3 text-center">
            <div className={`w-2 h-2 ${s.color} rounded-full mx-auto mb-1`} />
            <p className="text-gray-400 text-xs">{s.label}</p>
            <p className="text-white font-bold text-lg">{statusCounts[s.key] || 0}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Trades Tab ─── */
function TradesTab({ trades, merchants }: { trades: Trade[]; merchants: Merchant[] }) {
  const [filter, setFilter] = useState<string>('all')
  const filtered = filter === 'all' ? trades : trades.filter(t => t.status === filter)

  const merchantPhone = useCallback((id: string) => {
    const m = merchants.find(m => m.id === id)
    return m ? m.phoneNumber : id.slice(0, 8)
  }, [merchants])

  const statusColors: Record<string, string> = {
    offer_created: 'bg-yellow-500/20 text-yellow-400',
    buyer_funded: 'bg-blue-500/20 text-blue-400',
    in_transit: 'bg-purple-500/20 text-purple-400',
    delivery_confirmed: 'bg-teal-500/20 text-teal-400',
    completed: 'bg-green-500/20 text-green-400',
    dispute_opened: 'bg-orange-500/20 text-orange-400',
    dispute_resolved: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    refunded: 'bg-gray-500/20 text-gray-400',
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['all', 'offer_created', 'buyer_funded', 'in_transit', 'delivery_confirmed', 'completed', 'dispute_opened', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-2">ID</th>
              <th className="text-left py-3 px-2">Buyer</th>
              <th className="text-left py-3 px-2">Seller</th>
              <th className="text-right py-3 px-2">Amount</th>
              <th className="text-center py-3 px-2">Status</th>
              <th className="text-left py-3 px-2">Currency</th>
              <th className="text-right py-3 px-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((trade) => {
              const amt = (parseInt(trade.amount) / 1e18).toFixed(2)
              return (
                <tr key={trade.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-2 text-white font-mono text-xs">{trade.id.slice(0, 8)}</td>
                  <td className="py-3 px-2 text-gray-300 text-xs font-mono">{merchantPhone(trade.buyerId)}</td>
                  <td className="py-3 px-2 text-gray-300 text-xs font-mono">{merchantPhone(trade.sellerId)}</td>
                  <td className="py-3 px-2 text-right text-green-400 font-mono font-bold">${amt}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[trade.status] || ''}`}>
                      {trade.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500 text-xs">{trade.currency}/{trade.fiatCurrency}</td>
                  <td className="py-3 px-2 text-right text-gray-500 text-xs">{trade.createdAt.split('T')[0] || trade.createdAt.split(' ')[0]}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-gray-600 text-xs">{filtered.length} trades shown</p>
    </div>
  )
}

/* ─── Disputes Tab ─── */
function DisputesTab({ disputes, trades }: { disputes: Dispute[]; trades: Trade[] }) {
  const tradeAmount = useCallback((tradeId: string) => {
    const t = trades.find(t => t.id === tradeId)
    return t ? `$${(parseInt(t.amount) / 1e18).toFixed(2)}` : '-'
  }, [trades])

  const statusColors: Record<string, string> = {
    open: 'bg-yellow-500/20 text-yellow-400',
    under_review: 'bg-blue-500/20 text-blue-400',
    resolved: 'bg-green-500/20 text-green-400',
  }

  const openCount = disputes.filter(d => d.status !== 'resolved').length
  const macroCount = disputes.filter(d => d.tier === 'macro').length
  const microCount = disputes.filter(d => d.tier === 'micro').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Disputes" value={openCount.toString()} />
        <StatCard label="Macro (Tier 2)" value={macroCount.toString()} />
        <StatCard label="Micro (Tier 1)" value={microCount.toString()} />
        <StatCard label="Total Filed" value={disputes.length.toString()} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-2">Dispute</th>
              <th className="text-left py-3 px-2">Trade</th>
              <th className="text-left py-3 px-2">Reason</th>
              <th className="text-center py-3 px-2">Tier</th>
              <th className="text-center py-3 px-2">Status</th>
              <th className="text-right py-3 px-2">Amount</th>
              <th className="text-right py-3 px-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map((d) => (
              <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-2 text-white font-mono text-xs">{d.id.slice(0, 8)}</td>
                <td className="py-3 px-2 text-gray-300 font-mono text-xs">{d.tradeId.slice(0, 8)}</td>
                <td className="py-3 px-2 text-gray-400 text-xs max-w-[150px] truncate">{d.reason}</td>
                <td className="py-3 px-2 text-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${d.tier === 'micro' ? 'bg-green-900/30 text-green-400' : 'bg-orange-900/30 text-orange-400'}`}>
                    {d.tier}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[d.status] || ''}`}>
                    {d.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-green-400 font-mono text-xs">{tradeAmount(d.tradeId)}</td>
                <td className="py-3 px-2 text-right text-gray-500 text-xs">{d.createdAt.split('T')[0] || d.createdAt.split(' ')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Merchants Tab ─── */
function MerchantsTab({ merchants }: { merchants: Merchant[] }) {
  const [search, setSearch] = useState('')
  const filtered = merchants.filter(m =>
    m.phoneNumber.includes(search) || m.name.toLowerCase().includes(search.toLowerCase()) || m.country.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by phone, name, or country..."
        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 outline-none focus:border-green-500 transition-colors"
      />
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Merchants" value={merchants.length.toString()} />
        <StatCard label="Active" value={merchants.filter(m => m.status === 'active').length.toString()} />
        <StatCard label="Countries" value={[...new Set(merchants.map(m => m.country))].length.toString()} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-2">Phone</th>
              <th className="text-left py-3 px-2">Name</th>
              <th className="text-center py-3 px-2">Country</th>
              <th className="text-center py-3 px-2">Status</th>
              <th className="text-right py-3 px-2">Trades</th>
              <th className="text-right py-3 px-2">Wallet</th>
              <th className="text-right py-3 px-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-2 text-white font-mono text-xs">{m.phoneNumber}</td>
                <td className="py-3 px-2 text-gray-300 text-xs">{m.name}</td>
                <td className="py-3 px-2 text-center text-gray-400 text-xs">{m.country}</td>
                <td className="py-3 px-2 text-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${m.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                    {m.status}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-gray-300 font-mono text-xs">{m.totalTrades}</td>
                <td className="py-3 px-2 text-right text-gray-500 font-mono text-xs">{m.walletAddress ? m.walletAddress.slice(0, 10) + '...' : 'Not set'}</td>
                <td className="py-3 px-2 text-right text-gray-500 text-xs">{m.createdAt.split('T')[0] || m.createdAt.split(' ')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Revenue Tab ─── */
function RevenueTab({ trades }: { trades: Trade[] }) {
  const totalVolume = trades.reduce((s, t) => s + (parseInt(t.amount) / 1e18), 0)
  const feeRevenue = totalVolume * 0.01
  const avgFloat = totalVolume * 0.15
  const yieldMonthly = avgFloat * 0.045 / 12
  const totalRev = feeRevenue + yieldMonthly

  const pools = [
    { label: 'Front-End Pool', pct: 35, amount: totalRev * 0.35, desc: 'Merchant rebates, ambassador rewards, market infra', color: 'bg-green-500' },
    { label: 'Middle-End Pool', pct: 40, amount: totalRev * 0.40, desc: 'Engineering, audits, telecom routing, operations', color: 'bg-emerald-500' },
    { label: 'Back-End Pool', pct: 25, amount: totalRev * 0.25, desc: 'Sovereign reserve + founder royalty (10%)', color: 'bg-teal-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Est. Protocol Revenue" value={`$${Math.round(totalRev).toLocaleString()}`} sub="from 1% FX spread" />
        <StatCard label="Yield on Float" value={`$${Math.round(yieldMonthly).toLocaleString()}/mo`} sub="~4.5% APY est." />
        <StatCard label="Total Fee Revenue" value={`$${Math.round(feeRevenue).toLocaleString()}`} sub="all-time" />
        <StatCard label="Avg Trade Value" value={`$${(totalVolume / (trades.length || 1)).toFixed(0)}`} sub="USDC" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        {pools.map((p) => (
          <div key={p.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-3 h-3 rounded-full ${p.color}`} />
              <span className="text-white font-bold text-lg">{p.pct}%</span>
            </div>
            <h4 className="text-white font-semibold text-sm mb-1">{p.label}</h4>
            <p className="text-green-400 font-mono font-bold text-lg mb-2">${Math.round(p.amount).toLocaleString()}</p>
            <p className="text-gray-500 text-xs">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main App ─── */
type Tab = 'overview' | 'trades' | 'disputes' | 'merchants' | 'revenue'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'trades', label: 'Trades', icon: '🔄' },
  { id: 'disputes', label: 'Disputes', icon: '⚖' },
  { id: 'merchants', label: 'Merchants', icon: '👥' },
  { id: 'revenue', label: 'Revenue', icon: '💰' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('overview')
  const [trades, setTrades] = useState<Trade[]>([])
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('api')

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setApiError(null)

      try {
        const data = await fetchAllDashboardData()
        if (!mounted) return
        setTrades(data.trades)
        setMerchants(data.merchants)
        setDisputes(data.disputes)
        setDataSource('api')
      } catch (err) {
        console.warn('[Dashboard] API unreachable, falling back to mock data:', err)
        if (!mounted) return
        setTrades(MOCK_ALL.trades)
        setMerchants(MOCK_ALL.merchants)
        setDisputes(MOCK_ALL.disputes)
        setDataSource('mock')
        setApiError(
          err instanceof Error
            ? `API error: ${err.message}. Using mock data.`
            : 'API unreachable. Using mock data.'
        )
      }

      if (mounted) setLoading(false)
    }

    load()

    const interval = API_CONFIG.refreshInterval > 0
      ? setInterval(load, API_CONFIG.refreshInterval)
      : undefined

    return () => {
      mounted = false
      if (interval) clearInterval(interval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[#0a0a0a] border-r border-white/5 hidden lg:block">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-700 flex items-center justify-center text-white font-bold text-[9px]">A</div>
            <span className="text-white font-bold text-sm">Amana<span className="text-green-400">Admin</span></span>
          </div>
          <p className="text-gray-600 text-[10px] mt-1">
            {loading ? 'Loading...' : dataSource === 'api' ? 'Live from API' : 'Using mock data'}
          </p>
        </div>
        <nav className="p-3 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                tab === t.id
                  ? 'bg-green-600/20 text-green-400 border border-green-700/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-3 right-3 px-3 py-2 bg-white/5 rounded-lg">
          <p className="text-gray-500 text-[10px]">Network</p>
          <p className="text-green-400 text-xs font-mono">Celo / Base</p>
          {API_CONFIG.refreshInterval > 0 && (
            <p className="text-gray-600 text-[10px] mt-1">Auto-refresh: {API_CONFIG.refreshInterval / 1000}s</p>
          )}
          <p className="text-gray-600 text-[10px]">API: {API_CONFIG.baseUrl}</p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-700 flex items-center justify-center text-white font-bold text-[9px]">A</div>
            <span className="text-white font-bold text-sm">Amana<span className="text-green-400">Admin</span></span>
          </div>
          {loading ? (
            <span className="text-gray-500 text-[10px] animate-pulse">⏳</span>
          ) : dataSource === 'mock' ? (
            <span className="text-yellow-400 text-[10px]">⚠ Mock</span>
          ) : (
            <span className="text-green-400 text-[10px]">● Live</span>
          )}
        </div>
        <div className="flex gap-1 mt-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                tab === t.id ? 'bg-green-600 text-white' : 'text-gray-400'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="lg:ml-56 pt-16 lg:pt-6 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{tab}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {tab === 'overview' && 'Real-time protocol metrics from the live Merchant API'}
                {tab === 'trades' && 'All escrow trades across all corridors'}
                {tab === 'disputes' && 'Macro & Micro dispute management'}
                {tab === 'merchants' && 'Merchant profiles from the live database'}
                {tab === 'revenue' && 'Revenue breakdown, yield, and distribution pools'}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              {loading && <span className="text-gray-500 text-xs animate-pulse">Loading...</span>}
              {!loading && apiError && <span className="text-yellow-400 text-xs">⚠ {apiError}</span>}
              {!loading && !apiError && dataSource === 'api' && <span className="text-green-400 text-xs">● Connected to API</span>}
              {!loading && !apiError && dataSource === 'mock' && <span className="text-yellow-400 text-xs">● Using mock data</span>}
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-500 text-sm">Connecting to Merchant API at {API_CONFIG.baseUrl}...</p>
            </div>
          )}

          {!loading && apiError && (
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-300 text-sm font-medium flex items-center gap-2">
                <span>⚠</span> API Fallback Active
              </p>
              <p className="text-gray-400 text-xs mt-1">{apiError}</p>
              <p className="text-gray-500 text-xs mt-2">
                Start the Merchant API: <code className="text-green-400 bg-black/30 px-1 rounded">cd amana-backend/merchant-api && npx tsx src/index.ts</code>
              </p>
            </div>
          )}

          {!loading && tab === 'overview' && <Overview trades={trades} merchants={merchants} disputes={disputes} dataSource={dataSource} />}
          {!loading && tab === 'trades' && <TradesTab trades={trades} merchants={merchants} />}
          {!loading && tab === 'disputes' && <DisputesTab disputes={disputes} trades={trades} />}
          {!loading && tab === 'merchants' && <MerchantsTab merchants={merchants} />}
          {!loading && tab === 'revenue' && <RevenueTab trades={trades} />}
        </div>
      </main>
    </div>
  )
}