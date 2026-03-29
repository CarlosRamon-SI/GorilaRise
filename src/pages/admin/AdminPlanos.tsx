import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface Plano {
  id: number
  nome: string
  valor: string
  descricao?: string
  ativo: boolean
}

export default function AdminPlanos() {
  const [items, setItems] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Plano[]>('/planos')
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Planos</h1>
      <p className="text-zinc-400 text-sm mb-8">{items.length} plano(s)</p>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-lg h-16 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">Nenhum plano cadastrado ainda.</p>
          <p className="text-zinc-600 text-sm mt-1">Funcionalidade de criação em breve.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{p.nome}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${p.ativo ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-zinc-700 text-zinc-400 border-zinc-600'}`}>
                  {p.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">
                R$ {Number(p.valor).toFixed(2)}
                <span className="text-zinc-500 text-sm font-normal">/mês</span>
              </p>
              {p.descricao && <p className="text-zinc-400 text-sm mt-2">{p.descricao}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
