import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { CalendarCheck, Clock, Users } from 'lucide-react'

interface CheckinItem {
  id: number
  atletaNome: string
  atletaEmail: string
  turma: string
  horario: string
  data: string
}

export default function CheckinAdmin() {
  const [items, setItems] = useState<CheckinItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroData, setFiltroData] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    api.get<CheckinItem[]>(`/admin/checkin?data=${filtroData}`)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filtroData])

  const byTurma: Record<string, CheckinItem[]> = {}
  items.forEach(c => {
    if (!byTurma[c.turma]) byTurma[c.turma] = []
    byTurma[c.turma].push(c)
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Check-in por Turma</h1>
        <p className="text-zinc-400 text-sm mt-1">Visualize quais atletas confirmaram presença</p>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <label className="text-sm text-zinc-400">Data:</label>
        <input type="date" value={filtroData} onChange={e => { setFiltroData(e.target.value); setLoading(true) }}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <CalendarCheck size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum check-in registrado para esta data.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byTurma).map(([turma, checkins]) => (
            <div key={turma} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-yellow-400" />
                  <h3 className="font-semibold">{turma}</h3>
                  <span className="text-xs text-zinc-500">{checkins[0].horario}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Users size={13} />
                  {checkins.length}/6
                  <div className="flex gap-1 ml-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-sm ${i < checkins.length ? 'bg-green-500' : 'bg-zinc-700'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {checkins.map(c => (
                  <div key={c.id} className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 text-xs font-bold shrink-0">
                      {c.atletaNome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.atletaNome}</p>
                      <p className="text-xs text-zinc-500 truncate">{c.atletaEmail}</p>
                    </div>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 6 - checkins.length) }).map((_, i) => (
                  <div key={`vaga-${i}`} className="flex items-center gap-2 bg-zinc-800/40 border border-dashed border-zinc-700 rounded-lg px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-zinc-700/50 shrink-0" />
                    <p className="text-xs text-zinc-600">Vaga disponível</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
