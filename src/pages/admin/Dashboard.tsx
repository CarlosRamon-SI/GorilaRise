import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import {
  Users, ClipboardList, Layers, CreditCard, UserPlus, Heart,
  FileText, Users2, Bell, Building2, ChevronRight, TrendingUp,
} from 'lucide-react'

interface Stats {
  usuarios: number
  matriculas: number
  modalidades: number
  planos: number
  leads: number
  projetos: number
  documentos: number
  funcionarios?: number
  notificacoes?: number
  patrocinadores?: number
}

const statCards = (s: Stats) => [
  {
    label: 'Usuários ativos', value: s.usuarios, icon: Users,
    accent: 'border-l-gorila-yellow', iconCls: 'text-gorila-yellow',
    trend: '+12%', trendUp: true, to: '/admin/usuarios',
  },
  {
    label: 'Matrículas ativas', value: s.matriculas, icon: ClipboardList,
    accent: 'border-l-gorila-yellow', iconCls: 'text-gorila-yellow',
    trend: '+3%', trendUp: true, to: '/admin/matriculas',
  },
  {
    label: 'Funcionários', value: s.funcionarios ?? 0, icon: Users2,
    accent: 'border-l-zinc-600', iconCls: 'text-zinc-400',
    trend: null, trendUp: null, to: '/admin/funcionarios',
  },
  {
    label: 'Modalidades', value: s.modalidades, icon: Layers,
    accent: 'border-l-zinc-600', iconCls: 'text-zinc-400',
    trend: null, trendUp: null, to: '/admin/modalidades',
  },
  {
    label: 'Planos', value: s.planos, icon: CreditCard,
    accent: 'border-l-zinc-600', iconCls: 'text-zinc-400',
    trend: null, trendUp: null, to: '/admin/planos',
  },
  {
    label: 'Notificações env.', value: s.notificacoes ?? 0, icon: Bell,
    accent: 'border-l-zinc-600', iconCls: 'text-zinc-400',
    trend: null, trendUp: null, to: '/admin/notificacoes',
  },
  {
    label: 'Patrocinadores', value: s.patrocinadores ?? 0, icon: Building2,
    accent: 'border-l-zinc-600', iconCls: 'text-zinc-400',
    trend: null, trendUp: null, to: '/admin/patrocinadores',
  },
  {
    label: 'Leads', value: s.leads, icon: UserPlus,
    accent: 'border-l-gorila-yellow', iconCls: 'text-gorila-yellow',
    trend: '+8%', trendUp: true, to: '/admin/leads',
  },
  {
    label: 'Projetos Sociais', value: s.projetos, icon: Heart,
    accent: 'border-l-zinc-600', iconCls: 'text-zinc-400',
    trend: null, trendUp: null, to: '/admin/projetos',
  },
  {
    label: 'Documentos', value: s.documentos, icon: FileText,
    accent: 'border-l-zinc-600', iconCls: 'text-zinc-400',
    trend: null, trendUp: null, to: '/admin/documentos',
  },
]

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Stats>('/admin/stats')
      .then(setStats)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="px-4 pt-5 pb-6 md:px-8 md:pt-7 md:pb-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 bg-gorila-yellow rounded-full" />
            <h1 className="text-xl font-black tracking-tight text-white">Dashboard</h1>
          </div>
          <p className="text-zinc-500 text-xs pl-3 capitalize">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Atualizado agora</p>
          <div className="flex items-center gap-1.5 justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-zinc-400">Ao vivo</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {!stats && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl border-l-4 border-zinc-800 border border-zinc-800 p-5 animate-pulse h-36" />
          ))}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {statCards(stats).map(({ label, value, icon: Icon, accent, iconCls, trend, trendUp, to }) => (
            <Link
              key={label}
              to={to}
              className={`relative bg-zinc-900 rounded-xl border-l-4 ${accent} border-t border-r border-b border-zinc-800
                          hover:border-zinc-700 hover:bg-zinc-800/70 transition-all duration-200
                          group overflow-hidden p-5`}
            >
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 transition-colors mb-3">
                <Icon size={15} className={iconCls} />
              </div>
              <p className="text-2xl font-black tracking-tight text-white leading-none mb-1">
                {value ?? '—'}
              </p>
              <p className="text-zinc-500 text-[11px] leading-tight">{label}</p>
              {trend && (
                <div className={`flex items-center gap-1 mt-2 text-[10px] font-semibold ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
                  <TrendingUp size={10} />
                  {trend} vs. mês anterior
                </div>
              )}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={13} className="text-zinc-500" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
