import { useState } from 'react'
import Stopwatch from './Stopwatch'
import CountdownTimer from './CountdownTimer'
import AdvancedIntervalTimer from './AdvancedIntervalTimer'

const TABS = [
  { id: 'stopwatch', label: 'Cronômetro' },
  { id: 'countdown', label: 'Regressivo' },
  { id: 'interval',  label: 'Intervalado' },
] as const

type Tab = typeof TABS[number]['id']

export default function TimerSystem() {
  const [active, setActive] = useState<Tab>('stopwatch')

  return (
    <div className="bg-[#0f0e0f] rounded-2xl overflow-hidden border border-white/[0.06]">
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.06] px-4 pt-4 gap-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className={`px-4 py-2 rounded-t-lg text-xs font-bold uppercase tracking-widest transition-all ${
              active === t.id
                ? 'bg-gorila-yellow text-gorila-primary'
                : 'text-white/30 hover:text-white/60'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="px-4 py-8">
        {active === 'stopwatch' && <Stopwatch />}
        {active === 'countdown' && <CountdownTimer />}
        {active === 'interval'  && <AdvancedIntervalTimer />}
      </div>
    </div>
  )
}
