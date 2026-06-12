import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import {
  LayoutDashboard, Wallet, Star, Ticket, Trophy, LogOut, ChevronRight,
  CalendarDays, MapPin, CheckCircle, Clock, Medal,
} from 'lucide-react'

function iniciais(nome: string) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://pressticket.adtecnologia.com.br'

const BENEFICIOS = [
  { cat: 'OURO', icon: '🥇', cor: 'border-yellow-400', loja: '15%', clube: '10%', camisas: '3 camisas/temporada', canecas: '2 canecas', chopp: '5L + desconto', dependentes: 'Até 3' },
  { cat: 'PRATA', icon: '🥈', cor: 'border-gray-400', loja: '10%', clube: '10%', camisas: '2 camisas/temporada', canecas: '1 caneca', chopp: '4L + desconto', dependentes: 'Até 2' },
  { cat: 'BRONZE', icon: '🥉', cor: 'border-orange-600', loja: '5%', clube: '10%', camisas: '1 camisa/temporada', canecas: '—', chopp: '2L', dependentes: 'Até 1' },
]

const MENU = [
  { id: 'dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'carteira',   label: 'Carteira',     icon: Wallet },
  { id: 'beneficios', label: 'Benefícios',   icon: Star },
  { id: 'ingressos',  label: 'Ingressos',    icon: Ticket },
  { id: 'ranking',    label: 'Ranking',      icon: Trophy },
]

interface Evento {
  id: number; titulo: string; descricao: string; data: string; local: string; imagemUrl: string | null; totalIngressos: number
}
interface Ingresso {
  id: number; codigo: string; criadoEm: string
  evento: { id: number; titulo: string; data: string; local: string; imagemUrl: string | null }
}
interface Pontos {
  total: number
  historico: { id: number; pontos: number; motivo: string; criadoEm: string }[]
}
interface RankingItem {
  id: number; nome: string; pontos: number; jogos: number; posicao: number
}

export default function PainelSocio() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  const qc = useQueryClient()

  const { data: eventos = [] } = useQuery<Evento[]>({
    queryKey: ['eventos-socio'],
    queryFn: () => api.get('/eventos?ativo=true'),
    enabled: !!user,
    retry: false,
  })

  const { data: ingressos = [] } = useQuery<Ingresso[]>({
    queryKey: ['meus-ingressos'],
    queryFn: () => api.get('/ingressos'),
    enabled: !!user,
    retry: false,
  })

  const { data: pontos } = useQuery<Pontos>({
    queryKey: ['meus-pontos'],
    queryFn: () => api.get('/pontos'),
    enabled: !!user,
    retry: false,
  })

  const { data: ranking = [] } = useQuery<RankingItem[]>({
    queryKey: ['ranking-socios'],
    queryFn: () => api.get('/ranking/socios'),
    enabled: tab === 'ranking' && !!user,
    retry: false,
  })

  const reservarIngresso = useMutation({
    mutationFn: (eventoId: number) => api.post(`/ingressos/${eventoId}`, {}),
    onSuccess: (data: any) => {
      toast.success(`Ingresso reservado! +${data.pontosGanhos} pontos`)
      qc.invalidateQueries({ queryKey: ['meus-ingressos'] })
      qc.invalidateQueries({ queryKey: ['meus-pontos'] })
      qc.invalidateQueries({ queryKey: ['ranking-socios'] })
    },
    onError: (e: any) => toast.error(e.message ?? 'Erro ao reservar ingresso'),
  })

  const cancelarIngresso = useMutation({
    mutationFn: (eventoId: number) => api.delete(`/ingressos/${eventoId}`),
    onSuccess: () => {
      toast.success('Ingresso cancelado.')
      qc.invalidateQueries({ queryKey: ['meus-ingressos'] })
    },
    onError: (e: any) => toast.error(e.message),
  })

  if (!user) return null

  const meusEventoIds = new Set(ingressos.map(i => i.evento.id))
  const proximosEventos = eventos.filter(e => new Date(e.data) >= new Date())
  const jogosAssistidos = ingressos.filter(i => new Date(i.evento.data) < new Date()).length
  const meuRanking = ranking.find(r => r.id === user.id)

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
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
                  <p className="text-gorila-yellow text-[10px] font-semibold tracking-wide">Sócio Torcedor</p>
                </div>
              </div>
            </div>
            <Button onClick={() => { logout(); navigate('/') }} variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5 gap-1.5 text-[12px] transition-all">
              <LogOut size={14} /><span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="lg:hidden sticky top-0 z-20 bg-gorila-primary border-b border-white/10 shadow-md">
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex min-w-max px-2 py-1.5 gap-0.5">
            {MENU.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-[56px] ${
                  tab === item.id ? 'bg-gorila-yellow text-gorila-primary' : 'text-white/50 hover:text-white'
                }`}>
                <item.icon size={15} />
                <span className="text-[9px] font-bold whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-gorila-primary rounded-xl overflow-hidden shadow-lg">
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gorila-yellow/70">Área do Sócio</p>
              </div>
              <nav className="flex flex-col py-1">
                {MENU.map(item => (
                  <button key={item.id} onClick={() => setTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-[13px] transition-all ${
                      tab === item.id ? 'bg-gorila-yellow text-gorila-primary font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}>
                    <item.icon size={14} className="shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {tab === item.id && <ChevronRight size={12} className="opacity-60" />}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">

            {/* Dashboard */}
            {tab === 'dashboard' && (
              <div className="space-y-4 animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gorila-primary text-base">Bem-vindo, {user.nome.split(' ')[0]}!</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-gorila-primary/5 rounded-xl">
                        <p className="text-2xl font-bold text-gorila-primary">{pontos?.total ?? 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Pontos acumulados</p>
                      </div>
                      <div className="p-4 bg-gorila-primary/5 rounded-xl">
                        <p className="text-2xl font-bold text-gorila-primary">{jogosAssistidos}</p>
                        <p className="text-xs text-gray-500 mt-1">Jogos assistidos</p>
                      </div>
                      <div className="p-4 bg-gorila-primary/5 rounded-xl">
                        <p className="text-2xl font-bold text-gorila-primary">
                          {meuRanking ? `#${meuRanking.posicao}` : '—'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Posição no ranking</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Próximos eventos no dashboard */}
                {proximosEventos.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-gorila-primary flex items-center gap-2 text-sm">
                        <CalendarDays size={15} /> Próximos Eventos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {proximosEventos.slice(0, 3).map(ev => (
                        <div key={ev.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-gorila-primary/20 transition-colors">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gorila-primary truncate">{ev.titulo}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock size={10} />
                              {new Date(ev.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                              {ev.local && <><MapPin size={10} className="ml-1" />{ev.local}</>}
                            </p>
                          </div>
                          {meusEventoIds.has(ev.id) ? (
                            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">Reservado</span>
                          ) : (
                            <button onClick={() => setTab('ingressos')}
                              className="text-[11px] font-bold bg-gorila-yellow text-gorila-primary px-3 py-1 rounded-full shrink-0 hover:bg-gorila-yellow/80 transition-colors">
                              Pegar ingresso
                            </button>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Carteira */}
            {tab === 'carteira' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
                    <Wallet size={17} /> Carteira Digital
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative rounded-2xl p-6 text-white overflow-hidden mb-6"
                    style={{ background: 'linear-gradient(135deg, #231f20 60%, #3a3335)' }}>
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gorila-yellow/10 -translate-y-10 translate-x-10" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <img src="/lovable-uploads/b1d0c406-fb12-494e-ad8c-a0ad4760dda0.png" alt="logo" className="h-10 w-10 object-contain" />
                        <span className="text-gorila-yellow font-black text-lg tracking-widest">GORILA RISE</span>
                      </div>
                      <p className="text-2xl font-bold mb-1">{user.nome}</p>
                      <p className="text-gorila-yellow text-sm font-medium mb-3">Sócio Torcedor</p>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-white/60 text-xs">Pontos</p>
                          <p className="font-bold text-gorila-yellow">{pontos?.total ?? 0} pts</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs">Ingressos</p>
                          <p className="font-bold text-white">{ingressos.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 py-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">QR Code de Identificação</p>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <QRCodeSVG value={`GORILA-RISE:SOCIO:${user.id}`} size={160} fgColor="#231f20" level="M" />
                    </div>
                    <p className="text-[11px] text-gray-400">Apresente para prioridade nos jogos</p>
                  </div>
                  {pontos && pontos.historico.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Histórico de Pontos</p>
                      <div className="space-y-1.5">
                        {pontos.historico.slice(0, 5).map(p => (
                          <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600">{p.motivo}</p>
                            <span className="text-xs font-bold text-gorila-primary">+{p.pontos} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Benefícios */}
            {tab === 'beneficios' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
                    <Star size={17} /> Benefícios por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {BENEFICIOS.map(b => (
                      <div key={b.cat} className={`border-2 ${b.cor} rounded-xl p-4 space-y-3`}>
                        <div className="text-center">
                          <span className="text-3xl">{b.icon}</span>
                          <p className="font-bold text-gorila-primary mt-1">{b.cat}</p>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between"><span className="text-gray-500">Loja oficial</span><span className="font-medium">{b.loja} desconto</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Clube de vantagens</span><span className="font-medium">{b.clube} desconto</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Camisas oficiais</span><span className="font-medium">{b.camisas}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Canecas 500ml</span><span className="font-medium">{b.canecas}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Chopp (Gorilla Kitchen)</span><span className="font-medium">{b.chopp}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Dependentes</span><span className="font-medium">{b.dependentes}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-4 text-center">
                    Todos os planos incluem: Kit de Boas-Vindas, prioridade em ingressos e sistema de pontuação.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Ingressos */}
            {tab === 'ingressos' && (
              <div className="space-y-4 animate-fade-in">
                {/* Meus ingressos */}
                {ingressos.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-gorila-primary text-sm flex items-center gap-2">
                        <CheckCircle size={15} className="text-green-500" /> Meus Ingressos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {ingressos.map(i => {
                        const passou = new Date(i.evento.data) < new Date()
                        return (
                          <div key={i.id} className={`flex items-center gap-3 p-3 rounded-xl border ${passou ? 'border-gray-100 opacity-60' : 'border-green-100 bg-green-50/50'}`}>
                            {i.evento.imagemUrl && (
                              <img src={`${BASE_URL}${i.evento.imagemUrl}`} alt=""
                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                                onError={e => (e.currentTarget.style.display = 'none')} />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{i.evento.titulo}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <CalendarDays size={10} />
                                {new Date(i.evento.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                {i.evento.local && <><MapPin size={10} className="ml-1" />{i.evento.local}</>}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{i.codigo}</p>
                            </div>
                            {passou ? (
                              <span className="text-[10px] text-gray-400 shrink-0">Encerrado</span>
                            ) : (
                              <button
                                onClick={() => cancelarIngresso.mutate(i.evento.id)}
                                disabled={cancelarIngresso.isPending}
                                className="text-xs text-red-400 hover:text-red-600 shrink-0 transition-colors">
                                Cancelar
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Eventos disponíveis */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-gorila-primary text-sm flex items-center gap-2">
                      <Ticket size={15} /> Próximos Eventos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {proximosEventos.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                        <Ticket size={36} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Nenhum evento disponível no momento.</p>
                        <p className="text-xs mt-1">Os eventos serão publicados pelo administrador.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {proximosEventos.map(ev => {
                          const temIngresso = meusEventoIds.has(ev.id)
                          return (
                            <div key={ev.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-gorila-primary/30 transition-colors">
                              {ev.imagemUrl && (
                                <img src={`${BASE_URL}${ev.imagemUrl}`} alt={ev.titulo}
                                  className="w-full h-32 object-cover"
                                  onError={e => (e.currentTarget.style.display = 'none')} />
                              )}
                              <div className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gorila-primary">{ev.titulo}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                                      <CalendarDays size={11} />
                                      {new Date(ev.data).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}
                                    </p>
                                    {ev.local && (
                                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <MapPin size={11} /> {ev.local}
                                      </p>
                                    )}
                                    {ev.descricao && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{ev.descricao}</p>}
                                  </div>
                                  {temIngresso ? (
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                      <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <CheckCircle size={10} /> Reservado
                                      </span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => reservarIngresso.mutate(ev.id)}
                                      disabled={reservarIngresso.isPending}
                                      className="shrink-0 bg-gorila-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gorila-dark transition-colors disabled:opacity-60">
                                      {reservarIngresso.isPending ? '...' : 'Reservar +10pts'}
                                    </button>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2">{ev.totalIngressos} reserva{ev.totalIngressos !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Ranking */}
            {tab === 'ranking' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
                    <Trophy size={17} /> Ranking de Engajamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ranking.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <Trophy size={36} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Nenhum sócio com pontos ainda.</p>
                      <p className="text-xs mt-1">Reserve ingressos para acumular pontos e aparecer no ranking!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {ranking.map(r => {
                        const isMe = r.id === user.id
                        const medalha = r.posicao === 1 ? '🥇' : r.posicao === 2 ? '🥈' : r.posicao === 3 ? '🥉' : null
                        return (
                          <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                            isMe ? 'border-gorila-yellow bg-gorila-yellow/10' : 'border-gray-100 hover:border-gray-200'
                          }`}>
                            <div className="w-8 text-center shrink-0">
                              {medalha ? (
                                <span className="text-lg">{medalha}</span>
                              ) : (
                                <span className="text-sm font-bold text-gray-400">#{r.posicao}</span>
                              )}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gorila-primary/10 flex items-center justify-center text-gorila-primary text-xs font-bold shrink-0">
                              {iniciais(r.nome)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${isMe ? 'text-gorila-primary' : ''}`}>
                                {r.nome} {isMe && <span className="text-[10px] text-gorila-primary font-normal">(você)</span>}
                              </p>
                              <p className="text-xs text-gray-400">{r.jogos} jogo{r.jogos !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Medal size={12} className="text-gorila-yellow" />
                              <span className="text-sm font-bold text-gorila-primary">{r.pontos}</span>
                              <span className="text-xs text-gray-400">pts</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
