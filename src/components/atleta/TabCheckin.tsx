import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Users, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Turma {
  id: number
  codigo: string
  horario: string
  dias: string
  modalidade: string
  vagas: number
  checkedIn: boolean
}

export default function TabCheckin() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)

  useEffect(() => {
    api.get<Turma[]>('/turmas')
      .then(setTurmas)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleCheckin(turma: Turma) {
    setActionId(turma.id)
    try {
      if (turma.checkedIn) {
        await api.delete(`/checkin/${turma.id}`)
        setTurmas(prev => prev.map(t => t.id === turma.id ? { ...t, checkedIn: false } : t))
        toast.success('Check-in cancelado.')
      } else {
        await api.post('/checkin', { turmaId: turma.id })
        setTurmas(prev => prev.map(t => t.id === turma.id ? { ...t, checkedIn: true } : t))
        toast.success('Check-in realizado com sucesso!')
      }
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
                        <Clock size={11} /> {t.horario} · {t.dias}
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
                      <Clock size={11} /> {t.horario} · {t.dias}
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
    </div>
  )
}
