import { useState } from 'react'
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

const TURMAS_MOCK: Turma[] = [
  { id: 1, codigo: 'T1', horario: '05:30', dias: 'Seg–Sex', modalidade: 'Treino geral', vagas: 6, checkedIn: false },
  { id: 2, codigo: 'T2', horario: '06:30', dias: 'Seg–Sex', modalidade: 'Treino geral', vagas: 6, checkedIn: false },
  { id: 3, codigo: 'T3', horario: '07:30', dias: 'Seg–Sex', modalidade: 'Treino personalizado', vagas: 6, checkedIn: false },
  { id: 4, codigo: 'T4', horario: '09:00', dias: 'Seg, Qua, Sex', modalidade: 'Projeto Gorila Rise – Adolescentes 15–18 anos', vagas: 6, checkedIn: false },
  { id: 5, codigo: 'T5', horario: '15:00', dias: 'Seg, Qua, Sex', modalidade: 'Projeto Gorila Rise – Adolescentes 15–18 anos', vagas: 6, checkedIn: false },
  { id: 6, codigo: 'T6–T9', horario: '17:00–20:00', dias: 'Seg–Sex', modalidade: 'Treino personalizado', vagas: 6, checkedIn: false },
  { id: 7, codigo: 'T10', horario: '21:00', dias: 'Seg, Qua, Sex', modalidade: 'Projeto Gorila Rise – Jovens 18–21 anos', vagas: 6, checkedIn: false },
  { id: 8, codigo: 'T11', horario: '09:00', dias: 'Ter, Qui', modalidade: 'Projeto Gorila Rise – Crianças/Adolescentes 6–11 anos', vagas: 6, checkedIn: false },
  { id: 9, codigo: 'T12', horario: '10:00', dias: 'Ter, Qui', modalidade: 'Projeto Gorila Rise – Adolescentes 12–14 anos', vagas: 6, checkedIn: false },
  { id: 10, codigo: 'T13', horario: '15:00', dias: 'Ter, Qui', modalidade: 'Iniciação Esportiva – 6–11 anos', vagas: 6, checkedIn: false },
  { id: 11, codigo: 'T14', horario: '16:00', dias: 'Ter, Qui', modalidade: 'Iniciação Esportiva – 12–14 anos', vagas: 6, checkedIn: false },
  { id: 12, codigo: '—', horario: '16:00–18:00', dias: 'Sábado', modalidade: 'Treino coletivo', vagas: 6, checkedIn: false },
  { id: 13, codigo: '—', horario: '08:00–10:00', dias: 'Domingo', modalidade: 'Treino coletivo', vagas: 6, checkedIn: false },
]

function isAvailable(horario: string): boolean {
  const now = new Date()
  const parts = horario.split(':')
  if (parts.length < 2) return true
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  const clasTime = new Date()
  clasTime.setHours(h, m, 0, 0)
  const diff = clasTime.getTime() - now.getTime()
  return diff > 0 && diff <= 2 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000
}

export default function TabCheckin() {
  const [turmas, setTurmas] = useState<Turma[]>(TURMAS_MOCK)
  const [loading, setLoading] = useState<number | null>(null)

  async function handleCheckin(id: number, checkedIn: boolean) {
    setLoading(id)
    await new Promise(r => setTimeout(r, 600))
    setTurmas(prev => prev.map(t => t.id === id ? { ...t, checkedIn: !checkedIn } : t))
    toast.success(checkedIn ? 'Check-in cancelado.' : 'Check-in realizado com sucesso!')
    setLoading(null)
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
                    {t.codigo !== '—' && <span className="ml-1 bg-gorila-primary text-white text-[10px] px-1.5 py-0.5 rounded">{t.codigo}</span>}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCheckin(t.id, true)}
                  disabled={loading === t.id}
                  className="text-red-500 border-red-200 hover:bg-red-50 text-xs"
                >
                  {loading === t.id ? '...' : 'Cancelar'}
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
          {disponíveis.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gorila-primary/30 transition-colors">
              <div>
                <p className="text-sm font-medium">{t.modalidade}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <Clock size={11} /> {t.horario} · {t.dias}
                  {t.codigo !== '—' && <span className="ml-1 bg-gorila-primary text-white text-[10px] px-1.5 py-0.5 rounded">{t.codigo}</span>}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Users size={10} /> {t.vagas} vagas
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleCheckin(t.id, false)}
                disabled={loading === t.id}
                className="bg-gorila-primary hover:bg-gorila-dark text-white text-xs"
              >
                {loading === t.id ? '...' : 'Check-in'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
