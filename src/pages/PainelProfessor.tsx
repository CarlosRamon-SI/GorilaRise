import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import {
  LayoutDashboard, Users, Dumbbell, CheckCircle, FileText,
  LogOut, ChevronRight, Target, BarChart3, Shield
} from 'lucide-react'

interface Atleta { id: number; nome: string; email: string; matriculas?: { status: string }[] }

function iniciais(nome: string) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function EmBreve({ titulo }: { titulo: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <Dumbbell size={24} className="text-gorila-yellow mb-4" />
        <h3 className="font-bold text-gorila-primary text-lg mb-1">{titulo}</h3>
        <p className="text-gray-400 text-sm">Esta funcionalidade será ativada quando o backend estiver disponível.</p>
        <span className="mt-4 inline-block text-xs font-bold bg-gorila-yellow/20 text-gorila-primary px-3 py-1 rounded-full uppercase tracking-wide">Em breve</span>
      </CardContent>
    </Card>
  )
}

const MENU = [
  { id: 'dashboard',    label: 'Dashboard',         icon: LayoutDashboard },
  { id: 'atletas',      label: 'Meus Atletas',       icon: Users },
  { id: 'prescricao',   label: 'Prescrever Treino',  icon: Dumbbell },
  { id: 'checkin',      label: 'Check-in / Turmas',  icon: CheckCircle },
  { id: 'anamneses',    label: 'Fichas de Anamnese', icon: FileText },
  { id: 'desempenho',   label: 'Desempenho',         icon: BarChart3 },
  { id: 'escalacao',    label: 'Escalação',          icon: Target },
]

export default function PainelProfessor() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')

  const { data: atletas } = useQuery<Atleta[]>({
    queryKey: ['professor-atletas'],
    queryFn: () => api.get('/professor/atletas'),
    enabled: !!user,
  })

  useEffect(() => {
    if (!user) return
    if (user.role !== 'PROFESSOR' && user.role !== 'TREINADOR' && user.role !== 'ADMIN') {
      navigate('/painel', { replace: true })
    }
  }, [user, navigate])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gorila-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="shrink-0">
              <div className="w-9 h-9 rounded-md overflow-hidden" style={{ backgroundColor: '#1a1718' }}>
                <img src="/lovable-uploads/b1d0c406-fb12-494e-ad8c-a0ad4760dda0.png" alt="Gorila Rise" className="w-full h-full object-contain" />
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gorila-yellow flex items-center justify-center font-bold text-gorila-primary text-sm shrink-0">
                {iniciais(user.nome)}
              </div>
              <div>
                <p className="font-bold leading-tight">{user.nome}</p>
                <p className="text-gorila-yellow text-xs font-medium">Professor / Treinador</p>
              </div>
            </div>
          </div>
          <Button onClick={() => { logout(); navigate('/') }} variant="ghost" size="sm" className="text-white hover:text-gorila-yellow hover:bg-transparent gap-1.5">
            <LogOut size={16} /><span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-gorila-primary text-base">Menu do Professor</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-2">
                <nav className="flex flex-col">
                  {MENU.map(item => (
                    <button key={item.id} onClick={() => setTab(item.id)}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        tab === item.id ? 'bg-gorila-primary text-white font-medium' : 'hover:bg-gray-50 text-gray-700'
                      }`}>
                      <span className="flex items-center gap-2.5"><item.icon size={15} />{item.label}</span>
                      <ChevronRight size={13} className="opacity-40" />
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
            {user.role === 'ADMIN' && (
              <Link to="/admin"><Button className="w-full bg-gorila-yellow text-gorila-primary hover:bg-yellow-400 font-bold text-sm">Ir para o Admin</Button></Link>
            )}
          </div>

          <div className="lg:col-span-3">
            {tab === 'dashboard' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Users size={16} className="text-gorila-yellow" /> Atletas Vinculados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gorila-primary">{atletas?.length ?? '—'}</p>
                      <p className="text-xs text-gray-500 mt-1">atletas sob sua supervisão</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Dumbbell size={16} className="text-gorila-yellow" /> Treinos Prescritos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gorila-primary">—</p>
                      <p className="text-xs text-gray-500 mt-1">esta semana</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Shield size={16} className="text-gorila-yellow" /> Check-ins Hoje
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gorila-primary">—</p>
                      <p className="text-xs text-gray-500 mt-1">presença confirmada</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {tab === 'atletas' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
                    <Users size={17} /> Meus Atletas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!atletas || atletas.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Users size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Nenhum atleta vinculado.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {atletas.map(a => (
                        <div key={a.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gorila-primary/30 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-gorila-yellow/20 flex items-center justify-center font-bold text-gorila-primary text-sm shrink-0">
                            {iniciais(a.nome)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{a.nome}</p>
                            <p className="text-xs text-gray-400 truncate">{a.email}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            a.matriculas?.some(m => m.status === 'ATIVA') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {a.matriculas?.some(m => m.status === 'ATIVA') ? 'ATIVA' : 'INATIVA'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === 'prescricao'  && <EmBreve titulo="Prescrever Treino" />}
            {tab === 'checkin'     && <EmBreve titulo="Check-in / Turmas" />}
            {tab === 'anamneses'   && <EmBreve titulo="Fichas de Anamnese" />}
            {tab === 'desempenho'  && <EmBreve titulo="Avaliação de Desempenho" />}
            {tab === 'escalacao'   && <EmBreve titulo="Escalação de Times" />}
          </div>
        </div>
      </div>
    </div>
  )
}
