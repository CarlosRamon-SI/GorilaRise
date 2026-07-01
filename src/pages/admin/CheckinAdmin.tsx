import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { CalendarCheck, Clock, Users, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface TurmaCheckin {
  id: number
  codigo: string
  horario: string
  descricao: string
  capacidade: number
  checkins: { id: number; atletaNome: string; atletaEmail: string }[]
}

export default function CheckinAdmin() {
  const [turmas, setTurmas] = useState<TurmaCheckin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtroData, setFiltroData] = useState(new Date().toISOString().slice(0, 10))
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    api.get<TurmaCheckin[]>(`/admin/checkin?data=${filtroData}`, controller.signal)
      .then(setTurmas)
      .catch(e => {
        if (e instanceof Error && e.name !== 'AbortError') setError(e.message ?? 'Erro ao carregar dados.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [filtroData, refreshKey])

  const totalPresentes = turmas.reduce((s, t) => s + t.checkins.length, 0)

  return (
    <div className="px-4 py-5 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Check-in por Turma</h1>
        <p className="text-zinc-400 text-sm mt-1">Visualize quais atletas confirmaram presença</p>
      </div>

      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <label className="text-sm text-zinc-400">Data:</label>
        <input
          type="date"
          value={filtroData}
          onChange={e => setFiltroData(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
        />
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 text-sm transition-colors"
        >
          <RefreshCw size={13} /> Atualizar
        </button>
      </div>

      {!loading && !error && (
        <p className="text-xs text-zinc-500 mb-6">
          {totalPresentes} presença{totalPresentes !== 1 ? 's' : ''} confirmada{totalPresentes !== 1 ? 's' : ''} em {turmas.length} turma{turmas.length !== 1 ? 's' : ''}
        </p>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-400 rounded-lg p-4 text-sm mb-6">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-xl animate-pulse" />)}
        </div>
      ) : turmas.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <CalendarCheck size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhuma turma ativa encontrada.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {turmas.map(t => {
            const n = t.checkins.length
            const vagas = Math.max(0, t.capacidade - n)
            const pct = t.capacidade > 0 ? Math.round((n / t.capacidade) * 100) : 0
            const cheia = vagas === 0
            return (
              <div key={t.id} className={`bg-zinc-900 border rounded-xl p-5 ${cheia ? 'border-orange-500/40' : 'border-zinc-800'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-yellow-400" />
                    <h3 className="font-semibold text-white">{t.descricao}</h3>
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">{t.codigo}</span>
                    <span className="text-xs text-zinc-400">{t.horario}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${cheia ? 'text-orange-400' : 'text-white'}`}>
                      {n}/{t.capacidade}
                    </span>
                    <div className="flex gap-1">
                      {Array.from({ length: t.capacidade }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-sm ${i < n ? (cheia ? 'bg-orange-400' : 'bg-green-500') : 'bg-zinc-700'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Barra de ocupação */}
                <div className="h-1 bg-zinc-800 rounded-full mb-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${cheia ? 'bg-orange-400' : 'bg-yellow-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {t.checkins.map(c => (
                    <div key={c.id} className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                      <div className="w-7 h-7 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 text-xs font-bold shrink-0">
                        {c.atletaNome.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate text-white">{c.atletaNome}</p>
                        <p className="text-xs text-zinc-500 truncate">{c.atletaEmail}</p>
                      </div>
                      <CheckCircle size={13} className="text-green-400 shrink-0" />
                    </div>
                  ))}
                  {Array.from({ length: vagas }).map((_, i) => (
                    <div key={`vaga-${i}`} className="flex items-center gap-2 bg-zinc-800/40 border border-dashed border-zinc-700 rounded-lg px-3 py-2">
                      <div className="w-7 h-7 rounded-full bg-zinc-700/50 shrink-0" />
                      <p className="text-xs text-zinc-600">Aguardando check-in</p>
                    </div>
                  ))}
                </div>

                {n === 0 && (
                  <p className="text-xs text-zinc-600 text-center mt-2 flex items-center justify-center gap-1">
                    <Users size={11} /> Nenhum atleta confirmado nesta turma
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
