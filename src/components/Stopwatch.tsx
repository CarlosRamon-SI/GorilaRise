import { Play, Pause, RotateCcw } from 'lucide-react'
import { useStopwatch } from '@/hooks/useStopwatch'
import { formatTime } from '@/utils/timeFormatter'

const R = 88
const CIRC = 2 * Math.PI * R

export default function Stopwatch() {
  const { time, isRunning, start, pause, reset } = useStopwatch()
  const seconds = time % 60
  const progress = seconds / 60
  const dashoffset = CIRC * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-8 py-2">
      <div className="relative w-52 h-52 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
          <circle
            cx="100" cy="100" r={R} fill="none"
            stroke="#f0c419" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashoffset}
            style={{ transition: isRunning ? 'stroke-dashoffset 0.25s linear' : 'none' }}
          />
        </svg>
        <div className="text-center z-10 select-none">
          <div className="text-5xl font-black font-mono tabular-nums text-white tracking-tight leading-none">
            {formatTime(time)}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 mt-2">
            {isRunning ? 'em curso' : time > 0 ? 'pausado' : 'pronto'}
          </div>
        </div>
      </div>

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
