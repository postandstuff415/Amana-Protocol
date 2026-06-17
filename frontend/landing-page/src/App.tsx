import { useState } from 'react'
import './index.css'

/* ─── Navigation ─── */
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-green-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-700 flex items-center justify-center text-white font-bold text-xs">A</div>
          <span className="text-white font-bold text-lg">Amana<span className="text-green-400">Protocol</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#problem" className="text-gray-400 hover:text-green-400 transition-colors">Problem</a>
          <a href="#how-it-works" className="text-gray-400 hover:text-green-400 transition-colors">How It Works</a>
          <a href="#model" className="text-gray-400 hover:text-green-400 transition-colors">Model</a>
          <a href="#roadmap" className="text-gray-400 hover:text-green-400 transition-colors">Roadmap</a>
          <a href="#waitlist" className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-full font-medium transition-all">Join Waitlist</a>
        </div>
      </div>
    </nav>
  )
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0d1a10] to-[#0a0a0a]" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-400 rounded-full blur-[96px]" />
      </div>
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-700/30 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-300 text-xs font-medium">Now in pilot — Kenya, Uganda, Ghana</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Trade Across Borders.
          <br />
          <span className="bg-gradient-to-r from-green-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Trust the Protocol.
          </span>
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Zero-trust B2B escrow for African merchants. Dial <span className="text-green-400 font-mono font-bold">*483#</span> on any phone.
          No bank account needed. No wire fees. Settle in stablecoins.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#waitlist" className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-green-900/40">
            Join the Waitlist
          </a>
          <a href="#how-it-works" className="px-8 py-4 border border-gray-700 hover:border-green-600 text-gray-300 hover:text-white font-medium rounded-xl text-lg transition-all">
            How It Works ↓
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { label: 'Fee', value: '1%' },
            { label: 'Settlement', value: 'Instant' },
            { label: 'Coverage', value: '3 Countries' },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-green-400 font-bold text-xl">{s.value}</div>
              <div className="text-gray-500 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Problem Section ─── */
function Problem() {
  const cards = [
    {
      icon: '🤝',
      title: 'Trust Deficit',
      desc: 'No guarantee that payment means delivery, or delivery means payment. Merchants lose millions to fraud every year.',
    },
    {
      icon: '💸',
      title: 'Predatory Fees',
      desc: 'Banks charge 6–10% for cross-border wires. Mobile money cuts out but FX spreads still bleed traders dry.',
    },
    {
      icon: '💵',
      title: 'Dollar Scarcity',
      desc: 'Local currency shortages make USD wire transfers impossible. Merchants queue for months to access foreign exchange.',
    },
  ]

  return (
    <section id="problem" className="relative py-24 px-4 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-green-400 text-sm font-medium uppercase tracking-widest">The Problem</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Cross-border trade is broken for African SMEs
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            B2B merchants lose time, money, and trust navigating a fragmented financial system not built for them.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div
              key={c.title}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-green-700/50 hover:bg-green-900/10 transition-all group"
            >
              <div className="text-3xl mb-4">{c.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{c.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Bridge to solution */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 text-gray-600">
            <div className="w-16 h-px bg-gray-800" />
            <span className="text-sm font-mono">The Amana solution below</span>
            <div className="w-16 h-px bg-gray-800" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── How It Works ─── */
function HowItWorks() {
  const ussdSteps = [
    { step: '1', title: 'Dial *483#', desc: 'Merchant dials the USSD code on any feature phone.' },
    { step: '2', title: 'Create Trade', desc: 'Enter supplier number & USD amount. Funds locked in escrow.' },
    { step: '3', title: 'Confirm Delivery', desc: 'Buyer confirms goods received. Smart contract releases payment.' },
  ]

  const blockchainSteps = [
    { step: '1', title: 'USSD → API', desc: 'Africa\'s Talking gateway routes the USSD session to Amana\'s API.' },
    { step: '2', title: 'API → Smart Contract', desc: 'Backend submits trade details to the on-chain escrow contract.' },
    { step: '3', title: 'Contract → Settlement', desc: 'USDC settles instantly to the supplier\'s wallet. No bank delays.' },
  ]

  return (
    <section id="how-it-works" className="relative py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#0d1a10]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-green-400 text-sm font-medium uppercase tracking-widest">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            From feature phone to blockchain
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Two sides of the same transaction — what the merchant sees and what happens under the hood.
          </p>
        </div>

        {/* Merchant view */}
        <div className="mb-16">
          <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
            <span className="text-green-400">📱</span> Merchant Experience (USSD)
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {ussdSteps.map((s) => (
              <div key={s.step} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                  {s.step}
                </div>
                <h4 className="text-white font-semibold mt-2 mb-1">{s.title}</h4>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Blockchain view */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
            <span className="text-green-400">⛓</span> Blockchain Settlement
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {blockchainSteps.map((s) => (
              <div key={s.step} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  {s.step}
                </div>
                <h4 className="text-white font-semibold mt-2 mb-1">{s.title}</h4>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider line showing the connection */}
        <div className="mt-12 flex items-center justify-center gap-3 text-gray-600 text-xs">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-green-700 to-transparent" />
          <span className="font-mono">USSD ⇄ API ⇄ Smart Contract ⇄ Stablecoin</span>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-green-700 to-transparent" />
        </div>
      </div>
    </section>
  )
}

/* ─── Everyone Eats Model ─── */
function EveryoneEats() {
  const slices = [
    { pct: 35, label: 'Front-End', desc: 'Merchant rebates, market infra, ambassador rewards', color: 'bg-green-500' },
    { pct: 40, label: 'Middle-End', desc: 'Engineering wages, audits, telecom routing, ops', color: 'bg-emerald-500' },
    { pct: 25, label: 'Back-End', desc: 'Sovereign float reserve + 10% founder royalty', color: 'bg-teal-500' },
  ]

  return (
    <section id="model" className="relative py-24 px-4 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-green-400 text-sm font-medium uppercase tracking-widest">The Model</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Everyone Eats 🍽
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Protocol revenue is programmatically distributed on-chain. Every stakeholder is aligned with growth.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {slices.map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center hover:border-green-700/40 transition-all">
              <div className={`w-20 h-20 ${s.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                <span className="text-white text-2xl font-bold">{s.pct}%</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">{s.label}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Revenue flow */}
        <div className="mt-12 bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <h4 className="text-white font-semibold mb-4 text-center">Revenue Sources</h4>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
              <div className="text-green-400 font-bold text-lg mb-1">1.0% FX Spread</div>
              <p className="text-gray-400 text-xs">On every trade settled via the protocol.</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
              <div className="text-green-400 font-bold text-lg mb-1">~4.5% APY on Float</div>
              <p className="text-gray-400 text-xs">Escrowed stablecoin float auto-swept to tokenized treasuries.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Roadmap ─── */
function Roadmap() {
  const phases = [
    {
      phase: 'Phase 1',
      title: 'Pilot Corridors',
      period: 'Q3 2026',
      items: ['Kenya (Nairobi–Mombasa)', 'Uganda (Kampala–Gulu)', 'Ghana (Accra–Kumasi)', '500 pre-vetted merchants', '$500k monthly TPV target'],
      status: 'active',
    },
    {
      phase: 'Phase 2',
      title: 'Regional Expansion',
      period: 'Q1 2027',
      items: ['Nigeria (Lagos–Kano)', 'Tanzania (Dar–Arusha)', 'Rwanda (Kigali corridor)', 'Mobile money integration', 'Multi-language USSD menus'],
      status: 'upcoming',
    },
    {
      phase: 'Phase 3',
      title: 'Pan-African Network',
      period: 'Q4 2027',
      items: ['10+ country coverage', 'B2B marketplace integration', 'DeFi yield optimization', 'On-chain credit scoring', 'DAO governance launch'],
      status: 'upcoming',
    },
  ]

  return (
    <section id="roadmap" className="relative py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#0d1a10]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-green-400 text-sm font-medium uppercase tracking-widest">Roadmap</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            From pilot to pan-African
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            A phased rollout across Africa's busiest trade corridors.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {phases.map((p) => (
            <div
              key={p.phase}
              className={`rounded-2xl p-6 border transition-all ${
                p.status === 'active'
                  ? 'bg-green-900/20 border-green-700/50'
                  : 'bg-white/[0.02] border-white/10 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold uppercase tracking-wider ${p.status === 'active' ? 'text-green-400' : 'text-gray-500'}`}>
                  {p.phase}
                </span>
                {p.status === 'active' && (
                  <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full">Active</span>
                )}
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{p.title}</h3>
              <p className="text-gray-500 text-sm mb-4">{p.period}</p>
              <ul className="space-y-2">
                {p.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.status === 'active' ? 'bg-green-400' : 'bg-gray-600'}`} />
                    <span className="text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Waitlist / Contact ─── */
function Waitlist() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <section id="waitlist" className="relative py-24 px-4 bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto text-center">
        <span className="text-green-400 text-sm font-medium uppercase tracking-widest">Get In Touch</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
          Ready to trade without trust issues?
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto mb-8">
          Join the waitlist for early access. Merchants in pilot corridors get priority onboarding.
        </p>

        {submitted ? (
          <div className="bg-green-900/30 border border-green-700/50 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-3xl mb-3">✓</div>
            <h3 className="text-white font-bold text-lg mb-2">You're on the list!</h3>
            <p className="text-gray-400 text-sm">We'll notify you when Amana launches in your corridor.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 outline-none focus:border-green-500 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all whitespace-nowrap"
              >
                Join →
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-3">No spam. We'll only email you about Amana launch updates.</p>
          </form>
        )}

        {/* Divider */}
        <div className="my-12 border-t border-white/5" />

        {/* Contact info */}
        <div className="text-gray-500 text-sm space-y-1">
          <p>Questions? Reach us at <span className="text-green-400">hello@amanaprotocol.io</span></p>
          <p className="text-xs">Amana Protocol — Built for African merchants, powered by blockchain.</p>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-white/5 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-700 flex items-center justify-center text-white font-bold text-[8px]">A</div>
          <span className="text-gray-500 text-sm">Amana Protocol <span className="text-gray-700">|</span> <span className="text-gray-600">Everyone Eats</span></span>
        </div>
        <div className="text-gray-600 text-xs">
          © 2026 Amana Protocol. Built on Celo & Base.
        </div>
      </div>
    </footer>
  )
}

/* ─── Main App ─── */
export default function App() {
  return (
    <div className="bg-[#0a0a0a] text-white antialiased">
      <Nav />
      <Hero />
      <Problem />
      <HowItWorks />
      <EveryoneEats />
      <Roadmap />
      <Waitlist />
      <Footer />
    </div>
  )
}