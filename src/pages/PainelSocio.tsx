import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { QRCodeSVG } from 'qrcode.react'
import {
  LayoutDashboard, Wallet, Star, Ticket, Trophy, LogOut, ChevronRight
} from 'lucide-react'

function iniciais(nome: string) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

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

export default function PainelSocio() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')

  if (!user) return null

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

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gorila-primary rounded-xl overflow-hidden shadow-lg">
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gorila-yellow/70">Área do Sócio</p>
              </div>
              <nav className="flex flex-col py-1">
                {MENU.map(item => (
                  <button key={item.id} onClick={() => setTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-[13px] transition-all duration-150 ${
                      tab === item.id ? 'bg-gorila-yellow text-gorila-primary font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}>
                    <item.icon size={14} className="shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {tab === item.id && <ChevronRight size={12} className="opacity-60 shrink-0" />}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {tab === 'dashboard' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gorila-primary text-base">Bem-vindo, {user.nome.split(' ')[0]}!</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-gorila-primary/5 rounded-xl">
                        <p className="text-2xl font-bold text-gorila-primary">0</p>
                        <p className="text-xs text-gray-500 mt-1">Pontos acumulados</p>
                      </div>
                      <div className="p-4 bg-gorila-primary/5 rounded-xl">
                        <p className="text-2xl font-bold text-gorila-primary">0</p>
                        <p className="text-xs text-gray-500 mt-1">Jogos assistidos</p>
                      </div>
                      <div className="p-4 bg-gorila-primary/5 rounded-xl">
                        <p className="text-2xl font-bold text-gorila-primary">—</p>
                        <p className="text-xs text-gray-500 mt-1">Posição no ranking</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {tab === 'carteira' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
                    <Wallet size={17} /> Carteira Digital
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Card visual */}
                  <div className="relative rounded-2xl p-6 text-white overflow-hidden mb-6"
                    style={{ background: 'linear-gradient(135deg, #231f20 60%, #3a3335)' }}>
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gorila-yellow/10 -translate-y-10 translate-x-10" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <img src="/lovable-uploads/b1d0c406-fb12-494e-ad8c-a0ad4760dda0.png" alt="logo" className="h-10 w-10 object-contain" />
                        <span className="text-gorila-yellow font-black text-lg tracking-widest">GORILA RISE</span>
                      </div>
                      <p className="text-2xl font-bold mb-1">{user.nome}</p>
                      <p className="text-gorila-yellow text-sm font-medium">Sócio Torcedor</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3 py-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">QR Code de Identificação</p>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <QRCodeSVG value={`GORILA-RISE:SOCIO:${user.id}`} size={160} fgColor="#231f20" level="M" />
                    </div>
                    <p className="text-[11px] text-gray-400">Apresente para prioridade nos jogos</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {tab === 'beneficios' && (
              <div className="space-y-4">
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
              </div>
            )}

            {tab === 'ingressos' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
                    <Ticket size={17} /> Ingressos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 text-gray-400">
                    <Ticket size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhum jogo disponível no momento.</p>
                    <p className="text-xs mt-1">Os eventos serão publicados pelo administrador.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {tab === 'ranking' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
                    <Trophy size={17} /> Ranking de Engajamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 text-gray-400">
                    <Trophy size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Comece a acumular pontos assistindo aos jogos!</p>
                    <p className="text-xs mt-1">Frequência nos jogos = mais pontos = mais benefícios.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
