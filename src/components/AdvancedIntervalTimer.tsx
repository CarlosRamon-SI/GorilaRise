import { Play, Pause, RotateCcw, Plus, Trash2 } from 'lucide-react'
import { useAdvancedIntervalTimer, IntervalConfig } from '@/hooks/useAdvancedIntervalTimer'
import { formatTime } from '@/utils/timeFormatter'

const R = 88
const CIRC = 2 * Math.PI * R

export default function AdvancedIntervalTimer() {
  const {
    intervalos, rounds, currentTime, isRunning,
    currentPhase, currentRound, currentInterval,
    setRounds, start, pause, reset,
    addInterval, removeInterval, updateInterval,
  } = useAdvancedIntervalTimer()

  const isRest = currentPhase === 'tempoB'
  const accentColor = isRest ? '#60a5fa' : '#f0c419'
  const phaseLabel = currentPhase === 'start'
    ? 'preparar'
    : isRest
      ? `descanso · série ${currentInterval + 1}`
      : `trabalho · série ${currentInterval + 1}`

  const current = intervalos[currentInterval]
  const phaseTotal = currentPhase === 'start'
    ? 10
    : current
      ? (isRest ? current.tempoB.minutos : current.tempoA.minutos) * 60
        + (isRest ? current.tempoB.segundos : current.tempoA.segundos)
      : 0
  const progress = phaseTotal > 0 ? currentTime / phaseTotal : 0
  const dashoffset = CIRC * (1 - progress)

  function updTime(id: string, phase: 'tempoA' | 'tempoB', field: 'minutos' | 'segundos', val: number) {
    const iv = intervalos.find(i => i.id === id)
    if (iv) updateInterval(id, { [phase]: { ...iv[phase], [field]: val } })
  }

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      {/* Ring + Digits */}
      <div className="relative w-52 h-52 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
          <circle
            cx="100" cy="100" r={R} fill="none"
            stroke={accentColor} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashoffset}
            style={{ transition: isRunning ? 'stroke-dashoffset 0.25s linear' : 'none' }}
          />
        </svg>
        <div className="text-center z-10 select-none">
          <div className="text-5xl font-black font-mono tabular-nums text-white tracking-tight leading-none">
            {formatTime(currentTime)}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5" style={{ color: accentColor + 'aa' }}>
            {phaseLabel}
          </div>
          <div className="text-[10px] text-white/25 mt-0.5">
            round {currentRound}/{rounds}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button onClick={reset}
          className="w-11 h-11 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
          <RotateCcw size={15} />
        </button>
        <button
          onClick={isRunning ? pause : start}
          className="w-16 h-16 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
          style={{ backgroundColor: accentColor, color: '#231f20', boxShadow: `0 8px 24px ${accentColor}33` }}>
          {isRunning ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
        </button>
        <div className="w-11 h-11" />
      </div>

      {/* Config */}
      {!isRunning && (
        <div className="w-full max-w-sm space-y-3">
          {/* Rounds */}
          <div className="flex items-center justify-between bg-white/5 border border-white/8 rounded-xl px-4 py-3">
            <span className="text-xs uppercase tracking-widest text-white/40">Rounds</span>
            <input
              type="number" min={1} max={20} value={rounds}
              onChange={e => setRounds(Number(e.target.value))}
              className="w-14 bg-white/5 border border-white/10 rounded-lg text-center text-sm font-mono font-bold text-white py-1 focus:outline-none focus:ring-1 focus:ring-gorila-yellow"
            />
          </div>

          {/* Intervalos */}
          {intervalos.map((iv, idx) => (
            <div key={iv.id} className="bg-white/5 border border-white/8 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Série {idx + 1}</span>
                {intervalos.length > 1 && (
                  <button onClick={() => removeInterval(iv.id)} className="text-white/25 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(['tempoA', 'tempoB'] as const).map(phase => (
                  <div key={phase}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: phase === 'tempoA' ? '#f0c419' : '#60a5fa' }} />
                      <span className="text-[10px] uppercase tracking-widest" style={{ color: phase === 'tempoA' ? '#f0c41999' : '#60a5fa99' }}>
                        {phase === 'tempoA' ? 'trabalho' : 'descanso'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <div className="flex flex-col items-center gap-0.5 flex-1">
                        <span className="text-[8px] text-white/25 uppercase">min</span>
                        <input
                          type="number" min={0} max={59} value={iv[phase].minutos}
                          onChange={e => updTime(iv.id, phase, 'minutos', Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded text-center text-sm font-mono font-bold text-white py-1 focus:outline-none focus:ring-1 focus:ring-gorila-yellow"
                        />
                      </div>
                      <span className="text-white/20 text-lg font-mono self-end mb-0.5">:</span>
                      <div className="flex flex-col items-center gap-0.5 flex-1">
                        <span className="text-[8px] text-white/25 uppercase">seg</span>
                        <input
                          type="number" min={0} max={59} value={iv[phase].segundos}
                          onChange={e => updTime(iv.id, phase, 'segundos', Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded text-center text-sm font-mono font-bold text-white py-1 focus:outline-none focus:ring-1 focus:ring-gorila-yellow"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button onClick={addInterval}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/15 text-white/35 hover:border-white/25 hover:text-white/60 transition-all text-xs font-medium">
            <Plus size={13} /> Adicionar série
          </button>
        </div>
      )}
    </div>
  )
}
