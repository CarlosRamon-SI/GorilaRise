import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Users, AlertCircle, History } from 'lucide-react'
import { toast } from 'sonner'

interface Turma {
  id: number
  codigo: string
  horario: string
  dias: string | string[]
  modalidade: string
  vagas: number
  checkedIn: boolean
}

function formatDias(dias: string | string[]): string {
  if (Array.isArray(dias)) return dias.join(', ')
  return dias
}

interface HistoricoItem {
  id: number; data: string; turma: string; horario: string; descricao: string
}

export default function TabCheckin() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)
  const [showHistorico, setShowHistorico] = useState(false)

  const { data: historico = [] } = useQuery<HistoricoItem[]>({
    queryKey: ['checkin-historico'],
    queryFn: () => api.get('/checkin/historico'),
    enabled: showHistorico,
    retry: false,
  })

  function fetchTurmas() {
    setLoading(true)
    api.get<Turma[]>('/turmas')
      .then(setTurmas)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTurmas() }, [])

  async function handleCheckin(turma: Turma) {
    setActionId(turma.id)
    try {
      if (turma.checkedIn) {
        await api.delete(`/checkin/${turma.id}`)
        toast.success('Check-in cancelado.')
      } else {
        await api.post('/checkin', { turmaId: turma.id })
        toast.success('Check-in realizado com sucesso!')
      }
      // re-fetch from server to ensure state is accurate
      fetchTurmas()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar check-in.'
      toast.error(msg)
    } finally {
      setActionId(null)
    }
  }

  const meus = turmas.filter(t => t.checkedIn)
  const disponíveis = turmas.filter(t => !t.checkedIn)

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
            <CheckCircle size={17} /> Check-in de Presença
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 mb-0">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>Faça check-in com até 2h de antecedência. Para faltar, cancele com no mínimo 2h de antecedência. Capacidade: 6 atletas por turma.</span>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : turmas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400 text-sm">
            Nenhuma turma disponível no momento.
          </CardContent>
        </Card>
      ) : (
        <>
          {meus.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-green-600 text-sm font-semibold">Meus Check-ins</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {meus.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{t.modalidade}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} /> {t.horario} · {formatDias(t.dias)}
                        {t.codigo && t.codigo !== '—' && (
                          <span className="ml-1 bg-gorila-primary text-white text-[10px] px-1.5 py-0.5 rounded">{t.codigo}</span>
                        )}
                      </p>
                    </div>
                    <Button size="sm" variant="outline"
                      onClick={() => handleCheckin(t)}
                      disabled={actionId === t.id}
                      className="text-red-500 border-red-200 hover:bg-red-50 text-xs">
                      {actionId === t.id ? '...' : 'Cancelar'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-gorila-primary text-sm font-semibold">Grade de Turmas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {disponíveis.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Você já fez check-in em todas as turmas disponíveis.</p>
              ) : disponíveis.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gorila-primary/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{t.modalidade}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <Clock size={11} /> {t.horario} · {formatDias(t.dias)}
                      {t.codigo && t.codigo !== '—' && (
                        <span className="ml-1 bg-gorila-primary text-white text-[10px] px-1.5 py-0.5 rounded">{t.codigo}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Users size={10} /> {t.vagas} vagas
                    </p>
                  </div>
                  <Button size="sm"
                    onClick={() => handleCheckin(t)}
                    disabled={actionId === t.id}
                    className="bg-gorila-primary hover:bg-gorila-dark text-white text-xs">
                    {actionId === t.id ? '...' : 'Check-in'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
      {/* Histórico */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gorila-primary text-sm font-semibold flex items-center gap-2">
              <History size={15} /> Histórico (últimos 30 dias)
            </CardTitle>
            <Button size="sm" variant="outline" className="text-xs h-7"
              onClick={() => setShowHistorico(v => !v)}>
              {showHistorico ? 'Ocultar' : 'Ver histórico'}
            </Button>
          </div>
        </CardHeader>
        {showHistorico && (
          <CardContent>
            {historico.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum check-in nos últimos 30 dias.</p>
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
