import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Users, History, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Turma {
  id: number
  codigo: string
  horario: string
  dias: string | string[]
  modalidade: string
  vagas: number
  capacidade: number
  checkedIn: boolean
  disponivel: boolean
  encerrada: boolean
}

interface HistoricoItem {
  id: number; data: string; turma: string; horario: string; descricao: string
}

function formatDias(dias: string | string[]): string {
  if (Array.isArray(dias)) return dias.join(', ')
  return dias
}

function OcupacaoBar({ presente, capacidade }: { presente: number; capacidade: number }) {
  if (!capacidade) return null
  const pct = Math.round((presente / capacidade) * 100)
  const cheia = presente >= capacidade
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${cheia ? 'bg-red-400' : pct >= 75 ? 'bg-orange-400' : 'bg-gorila-yellow'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] font-medium shrink-0 ${cheia ? 'text-red-500' : 'text-gray-400'}`}>
        {presente}/{capacidade}
      </span>
    </div>
  )
}

export default function TabCheckin() {
  const queryClient = useQueryClient()
  const [actionId, setActionId] = useState<number | null>(null)
  const [showHistorico, setShowHistorico] = useState(false)

  // G-C10: date range for historico
  const defaultFim = new Date().toISOString().slice(0, 10)
  const defaultInicio = (() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10)
  })()
  const [histInicio, setHistInicio] = useState(defaultInicio)
  const [histFim, setHistFim] = useState(defaultFim)

  // G-C8: React Query for turmas (shared cache with dashboard)
  const { data: turmas = [], isLoading } = useQuery<Turma[]>({
    queryKey: ['turmas-dashboard'],
    queryFn: () => api.get('/turmas'),
    staleTime: 30_000,
    retry: 1,
  })

  const histValido = histInicio <= histFim
  const { data: historico = [], isLoading: histLoading, isError: histError } = useQuery<HistoricoItem[]>({
    queryKey: ['checkin-historico', histInicio, histFim],
    queryFn: () => api.get(`/checkin/historico?inicio=${histInicio}&fim=${histFim}`),
    enabled: showHistorico && histValido,
    retry: false,
  })

  async function handleCheckin(turma: Turma) {
    setActionId(turma.id)
    try {
      if (turma.checkedIn) {
        await api.delete(`/checkin/${turma.id}`)
        toast.success('Check-in cancelado.')
      } else {
        // G-C9: vagas esgotadas → mensagem específica (server retorna 409 com error string)
        if (turma.vagas === 0) {
          toast.error('Turma lotada. Não há vagas disponíveis.')
          setActionId(null)
          return
        }
        await api.post('/checkin', { turmaId: turma.id })
        toast.success('Check-in realizado com sucesso!')
      }
      queryClient.invalidateQueries({ queryKey: ['turmas-dashboard'] })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar check-in.'
      toast.error(msg)
    } finally {
      setActionId(null)
    }
  }

  // Ordenação: elegíveis para check-in primeiro, depois já feitos, depois encerradas/futuras
  const ordenadas = [...turmas].sort((a, b) => {
    const peso = (t: Turma) =>
      !t.encerrada && t.disponivel && !t.checkedIn && t.vagas > 0 ? 0  // pode fazer check-in
      : t.checkedIn                                                  ? 1  // já fez
      : !t.encerrada && t.disponivel && t.vagas === 0               ? 2  // lotada mas aberta
      : !t.encerrada && !t.disponivel                               ? 3  // janela ainda não abriu
      :                                                               4  // encerrada
    return peso(a) - peso(b) || a.horario.localeCompare(b.horario)
  })

  const meus = ordenadas.filter(t => t.checkedIn)
  const disponíveis = ordenadas.filter(t => !t.checkedIn)

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
            <CheckCircle size={17} /> Check-in de Presença
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <Clock size={14} className="mt-0.5 shrink-0" />
            <span>Check-in disponível a partir de 2h antes da aula. Cancelamentos devem ser feitos com no mínimo 1h de antecedência.</span>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : turmas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400 text-sm">
            Nenhuma turma disponível hoje.
          </CardContent>
        </Card>
      ) : (
        <>
          {meus.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-green-600 text-sm font-semibold">Meus Check-ins Hoje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {meus.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.modalidade}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} /> {t.horario} · {formatDias(t.dias)}
                        {t.codigo && <span className="bg-gorila-primary text-white text-[10px] px-1.5 py-0.5 rounded">{t.codigo}</span>}
                      </p>
                      <OcupacaoBar presente={t.capacidade - t.vagas} capacidade={t.capacidade} />
                    </div>
                    <Button size="sm" variant="outline"
                      onClick={() => handleCheckin(t)}
                      disabled={actionId === t.id}
                      className="ml-3 text-red-500 border-red-200 hover:bg-red-50 text-xs shrink-0">
                      {actionId === t.id ? <Loader2 size={12} className="animate-spin" /> : <><X size={12} className="mr-1" />Cancelar</>}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-gorila-primary text-sm font-semibold">Turmas de Hoje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {disponíveis.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Você já fez check-in em todas as turmas de hoje.</p>
              ) : disponíveis.map(t => {
                const lotada     = t.vagas === 0
                const bloqueada  = t.encerrada || !t.disponivel
                return (
                  <div key={t.id} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    t.encerrada     ? 'border-gray-100 bg-gray-50/50 opacity-60'
                    : lotada        ? 'border-red-200 bg-red-50/30'
                    : !t.disponivel ? 'border-gray-200 bg-gray-50/30'
                    :                 'border-gray-200 hover:border-gorila-primary/30'
                  }`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{t.modalidade}</p>
                        {t.encerrada     && <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">ENCERRADA</span>}
                        {!t.encerrada && lotada && <span className="text-[10px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded shrink-0">LOTADA</span>}
                        {!t.encerrada && !t.disponivel && <span className="text-[10px] font-bold text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">EM BREVE</span>}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} /> {t.horario} · {formatDias(t.dias)}
                        {t.codigo && <span className="bg-gorila-primary text-white text-[10px] px-1.5 py-0.5 rounded">{t.codigo}</span>}
                      </p>
                      <OcupacaoBar presente={t.capacidade - t.vagas} capacidade={t.capacidade} />
                    </div>
                    <Button size="sm"
                      onClick={() => handleCheckin(t)}
                      disabled={actionId === t.id || lotada || bloqueada}
                      className="ml-3 shrink-0 bg-gorila-primary hover:bg-gorila-dark text-white text-xs disabled:opacity-50">
                      {actionId === t.id
                        ? <Loader2 size={12} className="animate-spin" />
                        : t.encerrada
                          ? 'Encerrada'
                          : lotada
                            ? <><Users size={12} className="mr-1" />Lotada</>
                            : !t.disponivel
                              ? 'Em breve'
                              : 'Check-in'}
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </>
      )}

      {/* G-C10: Histórico com seletor de período */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-gorila-primary text-sm font-semibold flex items-center gap-2">
              <History size={15} /> Histórico
            </CardTitle>
            <Button size="sm" variant="outline" className="text-xs h-7"
              onClick={() => setShowHistorico(v => !v)}>
              {showHistorico ? 'Ocultar' : 'Ver histórico'}
            </Button>
          </div>
        </CardHeader>
        {showHistorico && (
          <CardContent>
            {/* G-C10: date range picker */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <label htmlFor="hist-inicio" className="text-xs text-gray-500 shrink-0">De</label>
              <input id="hist-inicio" type="date" value={histInicio} onChange={e => setHistInicio(e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-gorila-primary" />
              <label htmlFor="hist-fim" className="text-xs text-gray-500 shrink-0">até</label>
              <input id="hist-fim" type="date" value={histFim} onChange={e => setHistFim(e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-gorila-primary" />
            </div>
            {!histValido && (
              <p className="text-xs text-red-500 mb-3">A data inicial deve ser anterior à data final.</p>
            )}
            {histLoading ? (
              <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-gorila-primary" /></div>
            ) : histError ? (
              <p className="text-sm text-red-500 text-center py-4">Erro ao carregar histórico.</p>
            ) : historico.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum check-in no período.</p>
            ) : (
              <div className="space-y-1.5">
                {historico.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="text-xs font-semibold text-gorila-primary">{h.descricao}</p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {h.horario} · Turma {h.turma}
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-500 shrink-0 ml-2">
                      {new Date(h.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
