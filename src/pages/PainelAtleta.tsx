import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TimerSystem from '@/components/TimerSystem'
import TabAnamnese from '@/components/atleta/TabAnamnese'
import TabCheckin from '@/components/atleta/TabCheckin'
import TabRecordes from '@/components/atleta/TabRecordes'
import TabProntuario from '@/components/atleta/TabProntuario'
import TabFotos from '@/components/atleta/TabFotos'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import {
  LayoutDashboard, User, CreditCard, Dumbbell, Clock, FileText,
  CheckCircle, Trophy, Camera, LogOut, ChevronRight,
  CalendarDays, ShieldCheck, Mail, Layers, Target, Calendar,
  Upload, Activity, Zap, Bell
} from 'lucide-react'

interface Perfil {
  id: number
  nome: string
  email: string
  role: string
  criadoEm: string
  fotoPerfil?: string
  matriculas?: {
    id: number
    status: string
    modalidade: { nome: string; categoria: string }
    plano: { nome: string; valor: string }
  }[]
}

interface TurmaResumida {
  id: number; horario: string; modalidade: string; checkedIn: boolean
}

interface RecordeResumido {
  id: number; exercicio: string; carga: string; data: string
}

interface TreinoPrescrito {
  id: number; atletaNome: string; titulo: string; exercicios: string | null; criadoEm: string
}

interface WOD {
  id: number; titulo: string; descricao?: string; exercicios?: string; data: string; autorNome?: string
}

interface Notificacao {
  id: number; titulo: string; corpo: string; tipo: string; criadoEm: string
}

function iniciais(nome: string) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const MENU = [
  { id: 'dashboard',      label: 'Dashboard',         short: 'Home',     icon: LayoutDashboard },
  { id: 'perfil',         label: 'Meu Perfil',         short: 'Perfil',   icon: User },
  { id: 'matricula',      label: 'Cartão Associado',   short: 'Cartão',   icon: CreditCard },
  { id: 'ficha',          label: 'Ficha de Treino',    short: 'Ficha',    icon: Dumbbell },
  { id: 'anamnese',       label: 'Anamnese',           short: 'Anamnese', icon: FileText },
  { id: 'checkin',        label: 'Check-in',           short: 'Check-in', icon: CheckCircle },
  { id: 'recordes',       label: 'Recordes Pessoais',  short: 'Records',  icon: Trophy },
  { id: 'prontuario',     label: 'Prontuário',         short: 'Prontu.',  icon: Activity },
  { id: 'foto-inicial',   label: 'Foto Inicial',       short: 'Foto Ini', icon: Camera },
  { id: 'foto-progresso', label: 'Foto 24 Semanas',    short: 'Foto 24s', icon: Camera },
  { id: 'notificacoes',   label: 'Notificações',       short: 'Avisos',   icon: Bell },
  { id: 'cronometro',     label: 'Cronômetro',         short: 'Timer',    icon: Clock },
]

function FichaTreinoTab() {
  const { user } = useAuth()
  const { data: fichas = [], isLoading } = useQuery<TreinoPrescrito[]>({
    queryKey: ['ficha-treino'],
    queryFn: () => api.get('/ficha-treino'),
    enabled: !!user,
    retry: false,
  })

  type Exercicio = { nome: string; series?: number; repeticoes?: string; carga?: string }

  function parseExercicios(raw: string | null): Exercicio[] {
    if (!raw) return []
    try { return JSON.parse(raw) } catch { return [] }
  }

  if (isLoading) return (
    <Card>
      <CardContent className="py-12">
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />)}</div>
      </CardContent>
    </Card>
  )

  if (fichas.length === 0) return (
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

  return (
    <div className="space-y-4">
      {fichas.map(ficha => {
        const exercicios = parseExercicios(ficha.exercicios)
        return (
          <Card key={ficha.id}>
            <CardHeader>
              <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
                <Dumbbell size={17} /> {ficha.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400 mb-4">Prescrito para: {ficha.atletaNome}</p>
              {exercicios.length > 0 ? (
                <div className="space-y-2">
                  {exercicios.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-sm font-medium">{ex.nome}</p>
                      <div className="flex gap-3 text-xs text-gray-500">
                        {ex.series && <span>{ex.series} séries</span>}
                        {ex.repeticoes && <span>× {ex.repeticoes}</span>}
                        {ex.carga && <span className="bg-gorila-yellow/20 text-gorila-primary font-bold px-2 py-0.5 rounded-full">{ex.carga}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 whitespace-pre-line">{ficha.exercicios}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
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

  const queryClient = useQueryClient()
  const fotoPerfilRef = useRef<HTMLInputElement>(null)

  const { data: perfil, isLoading } = useQuery<Perfil>({
    queryKey: ['perfil-me'],
    queryFn: () => api.get('/auth/me'),
    enabled: !!user,
  })

  const { data: turmasData = [] } = useQuery<TurmaResumida[]>({
    queryKey: ['turmas-dashboard'],
    queryFn: () => api.get('/turmas'),
    enabled: !!user,
  })

  const { data: recordesData = [] } = useQuery<RecordeResumido[]>({
    queryKey: ['recordes-dashboard'],
    queryFn: () => api.get('/recordes'),
    enabled: !!user,
  })

  const { data: fichaData, isLoading: fichaLoading } = useQuery<TreinoPrescrito[]>({
    queryKey: ['ficha-treino'],
    queryFn: () => api.get('/ficha-treino'),
    enabled: !!user,
    retry: false,
  })

  const todayStr = new Date().toISOString().slice(0, 10)
  const { data: wods = [] } = useQuery<WOD[]>({
    queryKey: ['wod-hoje'],
    queryFn: () => api.get('/wod'),
    enabled: !!user,
    retry: false,
  })

  const { data: notificacoes = [] } = useQuery<Notificacao[]>({
    queryKey: ['notificacoes-atleta'],
    queryFn: () => api.get('/notificacoes'),
    enabled: !!user,
    refetchInterval: 120_000,
    retry: false,
  })

  const checkinHoje = turmasData.filter(t => t.checkedIn)
  const ultimoRecorde = recordesData[0] ?? null
  const fichaAtual = fichaData?.[0] ?? null
  const wodHoje = wods.find(w => w.data === todayStr) ?? wods[0] ?? null

  async function handleFotoPerfilUpload(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await api.upload<{ url: string }>('/upload', fd)
      await api.patch('/auth/me', { fotoPerfil: res.url })
      queryClient.invalidateQueries({ queryKey: ['perfil-me'] })
      toast.success('Foto atualizada!')
    } catch {
      toast.error('Erro ao enviar foto.')
    }
  }

  const handleLogout = () => { logout(); navigate('/') }

  if (!user) return null

  const matriculaAtiva = perfil?.matriculas?.find(m => m.status === 'ATIVA')

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      {/* Header */}
      <header className="bg-gorila-primary text-white shadow-xl border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link to="/" className="shrink-0">
                <div className="w-8 h-8 rounded-md overflow-hidden opacity-90 hover:opacity-100 transition-opacity" style={{ backgroundColor: '#1a1718' }}>
                  <img src="/lovable-uploads/b1d0c406-fb12-494e-ad8c-a0ad4760dda0.png" alt="Gorila Rise" className="w-full h-full object-contain" />
                </div>
              </Link>
              <div className="w-px h-6 bg-white/15" />
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gorila-yellow flex items-center justify-center font-black text-gorila-primary text-xs shrink-0 shadow-sm">
                  {iniciais(user.nome)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[13px] font-bold leading-tight">{user.nome}</p>
                  <p className="text-gorila-yellow text-[10px] font-semibold tracking-wide">
                    {user.role === 'ADMIN' ? 'Administrador'
                      : user.role === 'TREINADOR' ? (
                          user.funcao === 'NUTRICIONISTA' ? 'Nutricionista'
                          : user.funcao === 'FISIOTERAPEUTA' ? 'Fisioterapeuta'
                          : 'Professor / Treinador'
                        )
                      : 'Atleta Gorila Rise'}
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5 gap-1.5 text-[12px] transition-all">
              <LogOut size={14} />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Mobile tab bar ─────────────────────────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-20 bg-gorila-primary border-b border-white/10 shadow-md">
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex min-w-max px-2 py-1.5 gap-0.5">
            {MENU.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-150 min-w-[56px] ${
                  tab === item.id
                    ? 'bg-gorila-yellow text-gorila-primary'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={15} className="shrink-0" />
                <span className="text-[9px] font-bold whitespace-nowrap leading-tight">{item.short}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar — desktop only */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            <div className="bg-gorila-primary rounded-xl overflow-hidden shadow-lg">
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gorila-yellow/70">Menu do Atleta</p>
              </div>
              <nav className="flex flex-col py-1">
                {MENU.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-[13px] transition-all duration-150 ${
                      tab === item.id
                        ? 'bg-gorila-yellow text-gorila-primary font-bold'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={14} className="shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {tab === item.id && <ChevronRight size={12} className="opacity-60 shrink-0" />}
                  </button>
                ))}
              </nav>
            </div>

            {(user.role === 'ADMIN' || user.role === 'TREINADOR') && (
              <Link to="/admin">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gorila-yellow/40 text-gorila-primary bg-gorila-yellow/90 hover:bg-gorila-yellow font-bold text-[12px] tracking-wide transition-colors duration-150">
                  <LayoutDashboard size={13} />
                  Ir para o Admin
                </button>
              </Link>
            )}
          </div>

          {/* Conteúdo */}
          <div className="lg:col-span-3">

            {/* Dashboard */}
            {tab === 'dashboard' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Check-in — card destaque */}
                  <div className="bg-gorila-primary rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center">
                        <Calendar size={14} className="text-gorila-yellow" />
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-white/50">Check-in Hoje</p>
                    </div>
                    {checkinHoje.length > 0 ? (
                      <>
                        <p className="text-lg font-black text-gorila-yellow leading-tight">✓ Confirmado</p>
                        <p className="text-[11px] text-white/40 mt-1">{checkinHoje[0].modalidade} · {checkinHoje[0].horario}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-base font-black text-white/60 leading-tight">Sem check-in</p>
                        <p className="text-[11px] text-white/40 mt-1">Nenhuma turma confirmada hoje</p>
                      </>
                    )}
                    <button
                      onClick={() => setTab('checkin')}
                      className="mt-3 w-full text-[11px] font-bold py-1.5 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-colors duration-150"
                    >
                      {checkinHoje.length > 0 ? 'Alterar Horário' : 'Fazer Check-in'}
                    </button>
                  </div>

                  {/* Ficha de Treino */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-gorila-yellow/15 flex items-center justify-center">
                        <Target size={14} className="text-gorila-primary" />
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Ficha de Treino</p>
                    </div>
                    {fichaLoading ? (
                      <div className="h-8 bg-gray-100 rounded animate-pulse" />
                    ) : fichaAtual ? (
                      <>
                        <p className="text-base font-black text-gorila-primary leading-tight">{fichaAtual.titulo}</p>
                        <p className="text-[11px] text-gray-400 mt-1">Prescrito por seu treinador</p>
                        <button
                          onClick={() => setTab('ficha')}
                          className="inline-block mt-3 bg-gorila-yellow text-gorila-primary text-[10px] font-black px-2.5 py-1 rounded-full tracking-wide"
                        >
                          VER FICHA
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-base font-medium text-gray-400 leading-tight">Sem ficha prescrita</p>
                        <p className="text-[11px] text-gray-300 mt-1">Aguardando seu treinador</p>
                      </>
                    )}
                  </div>

                  {/* Último Recorde */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-gorila-yellow/15 flex items-center justify-center">
                        <Trophy size={14} className="text-gorila-primary" />
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Último Recorde</p>
                    </div>
                    {ultimoRecorde ? (
                      <>
                        <p className="text-base font-black text-gorila-primary leading-tight">{ultimoRecorde.exercicio}: {ultimoRecorde.carga}</p>
                        <p className="text-[11px] text-gray-400 mt-1">{new Date(ultimoRecorde.data).toLocaleDateString('pt-BR')}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-base font-medium text-gray-400 leading-tight">Nenhum recorde</p>
                        <button onClick={() => setTab('recordes')} className="mt-2 text-gorila-primary text-xs font-semibold hover:underline">
                          Registrar PR →
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* WOD do Dia */}
                {wodHoje && (
                  <div className="bg-gorila-yellow/10 border border-gorila-yellow/30 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap size={16} className="text-gorila-primary" />
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gorila-primary/70">WOD do Dia — {new Date(wodHoje.data + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    </div>
                    <p className="text-base font-black text-gorila-primary mb-1">{wodHoje.titulo}</p>
                    {wodHoje.descricao && <p className="text-sm text-gray-600 mb-2">{wodHoje.descricao}</p>}
                    {wodHoje.exercicios && (
                      <pre className="text-xs text-gray-600 bg-white/60 rounded-lg p-3 whitespace-pre-wrap font-mono">{wodHoje.exercicios}</pre>
                    )}
                    {wodHoje.autorNome && <p className="text-[11px] text-gray-400 mt-2">Publicado por {wodHoje.autorNome}</p>}
                  </div>
                )}

                {/* Relógio — widget de marca */}
                <div className="bg-gorila-primary rounded-xl px-4 sm:px-6 py-5 flex items-center justify-between shadow-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Agora</p>
                    <div className="text-3xl sm:text-4xl font-black font-mono text-white leading-none tracking-tight">
                      {clock.toLocaleTimeString('pt-BR')}
                    </div>
                    <p className="text-gorila-yellow text-[11px] mt-1.5 capitalize font-medium truncate">
                      {clock.toLocaleDateString('pt-BR', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gorila-yellow/30 flex items-center justify-center shrink-0 ml-3">
                    <Clock size={18} className="text-gorila-yellow/70" />
                  </div>
                </div>
              </div>
            )}

            {/* Meu Perfil */}
            {tab === 'perfil' && (
              <div className="space-y-4 animate-fade-in">
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
                          <div
                            onClick={() => fotoPerfilRef.current?.click()}
                            className="w-24 h-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1 overflow-hidden cursor-pointer hover:border-gorila-primary/40 transition-colors"
                          >
                            {perfil?.fotoPerfil ? (
                              <img src={perfil.fotoPerfil} alt="Foto perfil" className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <Camera size={24} className="text-gray-300" />
                                <span className="text-[10px] text-gray-400 font-medium">3×4</span>
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => fotoPerfilRef.current?.click()}
                            className="flex items-center gap-1 text-xs text-gorila-primary hover:underline"
                          >
                            <Upload size={11} /> Enviar foto
                          </button>
                          <input
                            ref={fotoPerfilRef}
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleFotoPerfilUpload(f) }}
                          />
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
              <div className="space-y-4 animate-fade-in">
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

            {tab === 'notificacoes' && (
              <div className="space-y-3 animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
                      <Bell size={17} /> Notificações do Clube
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {notificacoes.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                        <Bell size={36} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">Nenhuma notificação ainda.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notificacoes.map(n => (
                          <div key={n.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition-colors">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-bold text-sm text-gorila-primary">{n.titulo}</p>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                n.tipo === 'EVENTO' ? 'bg-blue-100 text-blue-700'
                                : n.tipo === 'COMUNICADO' ? 'bg-purple-100 text-purple-700'
                                : 'bg-gorila-yellow/20 text-gorila-primary'
                              }`}>{n.tipo}</span>
                            </div>
                            <p className="text-sm text-gray-600">{n.corpo}</p>
                            <p className="text-[11px] text-gray-400 mt-2">
                              {new Date(n.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
