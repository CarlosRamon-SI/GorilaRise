import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TimerSystem from '@/components/TimerSystem'
import DietPrescription from '@/components/DietPrescription'
import TabAnamnese from '@/components/atleta/TabAnamnese'
import TabCheckin from '@/components/atleta/TabCheckin'
import TabRecordes from '@/components/atleta/TabRecordes'
import TabProntuario from '@/components/atleta/TabProntuario'
import TabFotos from '@/components/atleta/TabFotos'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { QRCodeSVG } from 'qrcode.react'
import {
  LayoutDashboard, User, CreditCard, Dumbbell, Clock, FileText,
  CheckCircle, Trophy, Camera, LogOut, ChevronRight,
  CalendarDays, ShieldCheck, Mail, Layers, Target, Calendar,
  Upload, Activity
} from 'lucide-react'

interface Perfil {
  id: number
  nome: string
  email: string
  role: string
  criadoEm: string
  matriculas?: {
    id: number
    status: string
    modalidade: { nome: string; categoria: string }
    plano: { nome: string; valor: string }
  }[]
}

function iniciais(nome: string) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const MENU = [
  { id: 'dashboard',    label: 'Dashboard',         icon: LayoutDashboard },
  { id: 'perfil',       label: 'Meu Perfil',         icon: User },
  { id: 'matricula',    label: 'Cartão Associado',   icon: CreditCard },
  { id: 'ficha',        label: 'Ficha de Treino',    icon: Dumbbell },
  { id: 'anamnese',     label: 'Anamnese',           icon: FileText },
  { id: 'checkin',      label: 'Check-in',           icon: CheckCircle },
  { id: 'recordes',     label: 'Recordes Pessoais',  icon: Trophy },
  { id: 'prontuario',   label: 'Prontuário',         icon: Activity },
  { id: 'foto-inicial', label: 'Foto Inicial',       icon: Camera },
  { id: 'foto-progresso', label: 'Foto 24 Semanas',  icon: Camera },
  { id: 'cronometro',   label: 'Cronômetro',         icon: Clock },
  { id: 'dieta',        label: 'Dieta',              icon: FileText },
]

function FichaTreinoTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
          <Dumbbell size={17} /> Ficha de Treino
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-10 text-gray-400">
          <Dumbbell size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Nenhum treino prescrito ainda.</p>
          <p className="text-xs mt-1">Seu treinador publicará sua ficha em breve.</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PainelAtleta() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  const [clock, setClock] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const { data: perfil, isLoading } = useQuery<Perfil>({
    queryKey: ['perfil-me'],
    queryFn: () => api.get('/auth/me'),
    enabled: !!user,
  })

  const handleLogout = () => { logout(); navigate('/') }

  if (!user) return null

  const matriculaAtiva = perfil?.matriculas?.find(m => m.status === 'ATIVA')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <p className="text-gorila-yellow text-xs font-medium">
                  {user.role === 'ADMIN' ? 'Administrador' : user.role === 'PROFESSOR' ? 'Professor' : user.role === 'TREINADOR' ? 'Treinador' : 'Atleta Gorila Rise'}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:text-gorila-yellow hover:bg-transparent gap-1.5">
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-gorila-primary text-base">Menu do Atleta</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-2">
                <nav className="flex flex-col">
                  {MENU.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setTab(item.id)}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        tab === item.id
                          ? 'bg-gorila-primary text-white font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <item.icon size={15} />
                        {item.label}
                      </span>
                      <ChevronRight size={13} className="opacity-40" />
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {(user.role === 'ADMIN' || user.role === 'TREINADOR' || user.role === 'PROFESSOR') && (
              <Link to="/admin">
                <Button className="w-full bg-gorila-yellow text-gorila-primary hover:bg-yellow-400 font-bold text-sm">
                  Ir para o Admin
                </Button>
              </Link>
            )}
          </div>

          {/* Conteúdo */}
          <div className="lg:col-span-3">

            {/* Dashboard */}
            {tab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Calendar size={16} className="text-gorila-yellow" /> Check-in Hoje
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-bold text-green-600">✓ Confirmado</p>
                      <p className="text-xs text-gray-500 mt-1">Horário: 08:00 – 10:00</p>
                      <Button size="sm" onClick={() => setTab('checkin')} className="w-full mt-3 bg-gorila-primary hover:bg-gorila-dark text-xs">Alterar Horário</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Target size={16} className="text-gorila-yellow" /> Próximo Treino
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold">Treino de Peito</p>
                      <p className="text-xs text-gray-500 mt-1">4 exercícios • 45 min</p>
                      <span className="inline-block mt-3 bg-gorila-yellow text-gorila-primary text-xs font-bold px-2.5 py-0.5 rounded-full">Em andamento</span>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Trophy size={16} className="text-gorila-yellow" /> Último Recorde
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold">Supino: 80kg</p>
                      <p className="text-xs text-gray-500 mt-1">Batido há 3 dias</p>
                      <p className="text-xs text-green-600 mt-1 font-medium">+5kg do recorde anterior</p>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gorila-primary text-base">Relógio</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-6">
                    <div className="text-5xl font-mono font-bold text-gorila-primary mb-2">
                      {clock.toLocaleTimeString('pt-BR')}
                    </div>
                    <p className="text-gray-500 capitalize">
                      {clock.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Meu Perfil */}
            {tab === 'perfil' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
                      <User size={17} /> Meu Perfil
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />)}</div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <div className="w-24 h-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1 overflow-hidden">
                            <Camera size={24} className="text-gray-300" />
                            <span className="text-[10px] text-gray-400 font-medium">3×4</span>
                          </div>
                          <button className="flex items-center gap-1 text-xs text-gorila-primary hover:underline">
                            <Upload size={11} /> Enviar foto
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm flex-1">
                          <div className="flex items-start gap-2">
                            <User size={14} className="text-gorila-primary mt-0.5 shrink-0" />
                            <div>
                              <p className="text-gray-400 text-xs">Nome</p>
                              <p className="font-medium">{perfil?.nome}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Mail size={14} className="text-gorila-primary mt-0.5 shrink-0" />
                            <div>
                              <p className="text-gray-400 text-xs">E-mail</p>
                              <p className="font-medium">{perfil?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <ShieldCheck size={14} className="text-gorila-primary mt-0.5 shrink-0" />
                            <div>
                              <p className="text-gray-400 text-xs">Perfil</p>
                              <p className="font-medium">{perfil?.role}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <CalendarDays size={14} className="text-gorila-primary mt-0.5 shrink-0" />
                            <div>
                              <p className="text-gray-400 text-xs">Membro desde</p>
                              <p className="font-medium">
                                {perfil?.criadoEm ? new Date(perfil.criadoEm).toLocaleDateString('pt-BR') : '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Cartão Associado */}
            {tab === 'matricula' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
                      <CreditCard size={17} /> Cartão Associado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />)}</div>
                    ) : matriculaAtiva ? (
                      <div className="space-y-6">
                        {/* Card visual */}
                        <div className="relative rounded-2xl p-6 text-white overflow-hidden"
                          style={{ background: 'linear-gradient(135deg, #231f20 60%, #3a3335)' }}>
                          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gorila-yellow/10 -translate-y-10 translate-x-10" />
                          <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 translate-y-8 -translate-x-8" />
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                              <img src="/lovable-uploads/b1d0c406-fb12-494e-ad8c-a0ad4760dda0.png" alt="logo" className="h-10 w-10 object-contain" />
                              <span className="text-gorila-yellow font-black text-lg tracking-widest">GORILA RISE</span>
                            </div>
                            <p className="text-2xl font-bold mb-1">{perfil?.nome}</p>
                            <p className="text-gorila-yellow text-sm font-medium mb-4">{matriculaAtiva.modalidade.nome} · {matriculaAtiva.plano.nome}</p>
                            <div className="flex items-end justify-between">
                              <div>
                                <p className="text-white/60 text-xs">Status</p>
                                <span className="inline-block mt-0.5 text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-full">
                                  {matriculaAtiva.status}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-white/60 text-xs">Plano</p>
                                <p className="text-gorila-yellow font-bold">R$ {Number(matriculaAtiva.plano.valor).toFixed(2).replace('.',',')}/mês</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col items-center gap-3 py-4">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">QR Code de Identificação</p>
                          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <QRCodeSVG
                              value={`GORILA-RISE:MATRICULA:${matriculaAtiva.id}:${perfil?.id}`}
                              size={160}
                              fgColor="#231f20"
                              level="M"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400">Apresente na entrada da academia</p>
                        </div>

                        {/* Dados */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-start gap-2">
                            <Layers size={14} className="text-gorila-primary mt-0.5 shrink-0" />
                            <div>
                              <p className="text-gray-400 text-xs">Modalidade</p>
                              <p className="font-medium">{matriculaAtiva.modalidade.nome}</p>
                              <p className="text-xs text-gray-400">{matriculaAtiva.modalidade.categoria}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <CreditCard size={14} className="text-gorila-primary mt-0.5 shrink-0" />
                            <div>
                              <p className="text-gray-400 text-xs">Plano</p>
                              <p className="font-medium">{matriculaAtiva.plano.nome}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <ShieldCheck size={14} className="text-green-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-gray-400 text-xs">Status</p>
                              <span className="inline-block mt-0.5 text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                {matriculaAtiva.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <CreditCard size={36} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Nenhuma matrícula ativa.</p>
                        <Link to="/planos" className="mt-3 inline-block text-gorila-primary text-sm font-semibold hover:underline">Ver planos →</Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {tab === 'ficha'          && <FichaTreinoTab />}
            {tab === 'anamnese'       && <TabAnamnese />}
            {tab === 'checkin'        && <TabCheckin />}
            {tab === 'recordes'       && <TabRecordes />}
            {tab === 'prontuario'     && <TabProntuario />}
            {tab === 'foto-inicial'   && <TabFotos tipo="INICIAL" />}
            {tab === 'foto-progresso' && <TabFotos tipo="PROGRESSO" />}
            {tab === 'cronometro'     && <TimerSystem />}
            {tab === 'dieta'          && <DietPrescription userName={user.nome} />}

          </div>
        </div>
      </div>
    </div>
  )
}
