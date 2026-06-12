import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { DollarSign, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Pagamento {
  id: number
  atletaNome: string
  planoNome: string
  valor: string
  status: 'PAGO' | 'PENDENTE' | 'ATRASADO'
  dataVencimento: string
  dataPagamento?: string | null
}

const STATUS_STYLE: Record<string, string> = {
  PAGO:     'bg-green-500/20 text-green-400',
  PENDENTE: 'bg-yellow-500/20 text-yellow-400',
  ATRASADO: 'bg-red-500/20 text-red-400',
}

export default function Financeiro() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [items, setItems] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'TODOS' | 'PAGO' | 'PENDENTE' | 'ATRASADO'>('TODOS')
  const [registrando, setRegistrando] = useState<number | null>(null)

  useEffect(() => {
    api.get<Pagamento[]>('/financeiro')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function registrarPago(p: Pagamento) {
    if (!isAdmin) return
    setRegistrando(p.id)
    try {
      const updated = await api.patch<Pagamento>(`/financeiro/${p.id}/pagar`, {})
      setItems(prev => prev.map(x => x.id === p.id ? updated : x))
    } catch (e: any) {
      alert(e.message ?? 'Erro ao registrar pagamento.')
    } finally {
      setRegistrando(null)
    }
  }

  const filtrados = filtro === 'TODOS' ? items : items.filter(p => p.status === filtro)
  const totais = {
    pago:     items.filter(p => p.status === 'PAGO').reduce((s, p) => s + Number(p.valor), 0),
    pendente: items.filter(p => p.status === 'PENDENTE').reduce((s, p) => s + Number(p.valor), 0),
    atrasado: items.filter(p => p.status === 'ATRASADO').reduce((s, p) => s + Number(p.valor), 0),
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="px-4 py-5 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <p className="text-zinc-400 text-sm mt-1">Relatório de pagamentos e inadimplência</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Recebido',  value: totais.pago,     color: 'text-green-400',  border: 'border-green-500/20' },
          { label: 'Pendente',  value: totais.pendente,  color: 'text-yellow-400', border: 'border-yellow-500/20' },
          { label: 'Atrasado',  value: totais.atrasado,  color: 'text-red-400',    border: 'border-red-500/20' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`bg-zinc-900 rounded-xl p-5 border ${border}`}>
            <DollarSign size={20} className={`${color} mb-2`} />
            <p className={`text-2xl font-bold ${color}`}>{fmt(value)}</p>
            <p className="text-zinc-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {(['TODOS', 'PAGO', 'PENDENTE', 'ATRASADO'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filtro === f ? 'bg-yellow-400 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}>
            {f === 'TODOS' ? 'Todos' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-16 text-zinc-500"><p>Nenhum pagamento encontrado.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Atleta', 'Plano', 'Valor', 'Vencimento', 'Pagamento', 'Status', ...(isAdmin ? ['Ação'] : [])].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-4 font-medium">{p.atletaNome}</td>
                  <td className="py-3 px-4 text-zinc-400 text-sm">{p.planoNome}</td>
                  <td className="py-3 px-4 text-sm font-medium">{fmt(Number(p.valor))}</td>
                  <td className="py-3 px-4 text-zinc-400 text-sm">{new Date(p.dataVencimento).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 px-4 text-zinc-400 text-sm">{p.dataPagamento ? new Date(p.dataPagamento).toLocaleDateString('pt-BR') : '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4">
                      {p.status !== 'PAGO' && (
                        <button
                          disabled={registrando === p.id}
                          onClick={() => registrarPago(p)}
                          className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors px-2 py-1 rounded hover:bg-green-400/10 disabled:opacity-50">
                          {registrando === p.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                          Registrar pago
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
