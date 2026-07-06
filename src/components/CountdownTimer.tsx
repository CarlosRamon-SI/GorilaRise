import { Play, Pause, RotateCcw } from 'lucide-react'
import { useCountdown } from '@/hooks/useCountdown'
import { formatTime } from '@/utils/timeFormatter'

const R = 88
const CIRC = 2 * Math.PI * R

export default function CountdownTimer() {
  const { time, originalTime, isRunning, minutes, seconds, setMinutes, setSeconds, start, pause, reset } = useCountdown()

  const progress = (time === 0 || originalTime === 0) ? 1 : time / originalTime
  const dashoffset = CIRC * (1 - progress)
  const almostDone = time > 0 && time <= 10

  return (
    <div className="flex flex-col items-center gap-8 py-2">
      <div className="relative w-52 h-52 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
          <circle
            cx="100" cy="100" r={R} fill="none"
            stroke={almostDone ? '#ef4444' : '#f0c419'} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashoffset}
            style={{ transition: isRunning ? 'stroke-dashoffset 0.9s linear' : 'none' }}
          />
        </svg>
        <div className="text-center z-10 select-none">
          <div className={`text-5xl font-black font-mono tabular-nums tracking-tight leading-none ${almostDone ? 'text-red-400' : 'text-white'}`}>
            {formatTime(time)}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 mt-2">
            {isRunning ? 'contando' : time > 0 ? 'pausado' : originalTime > 0 ? 'fim!' : 'pronto'}
          </div>
        </div>
      </div>

      {!isRunning && (
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] uppercase tracking-widest text-white/30">min</span>
            <input
              type="number" min={0} max={99} value={minutes}
              onChange={e => setMinutes(Number(e.target.value))}
              className="w-16 bg-white/5 border border-white/10 rounded-lg text-center text-lg font-mono font-bold text-white py-1.5 focus:outline-none focus:ring-1 focus:ring-gorila-yellow"
            />
          </div>
          <span className="text-white/20 text-2xl font-mono mb-0.5 mt-4">:</span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] uppercase tracking-widest text-white/30">seg</span>
            <input
              type="number" min={0} max={59} value={seconds}
              onChange={e => setSeconds(Number(e.target.value))}
              className="w-16 bg-white/5 border border-white/10 rounded-lg text-center text-lg font-mono font-bold text-white py-1.5 focus:outline-none focus:ring-1 focus:ring-gorila-yellow"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button onClick={reset}
          className="w-11 h-11 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
          <RotateCcw size={15} />
        </button>
        <button
          onClick={isRunning ? pause : start}
          className="w-16 h-16 rounded-full bg-gorila-yellow flex items-center justify-center text-gorila-primary hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-gorila-yellow/20">
          {isRunning ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
        </button>
        <div className="w-11 h-11" />
      </div>
    </div>
  )
}
