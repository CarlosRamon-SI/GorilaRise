import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface Modalidade {
  id: number
  nome: string
  descricao: string
  categoria: string
  ativa: boolean
}

export default function AdminModalidades() {
  const [items, setItems] = useState<Modalidade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Modalidade[]>('/modalidades')
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Modalidades</h1>
      </div>
      <p className="text-zinc-400 text-sm mb-8">{items.length} modalidade(s)</p>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-lg h-16 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">Nenhuma modalidade cadastrada ainda.</p>
          <p className="text-zinc-600 text-sm mt-1">Funcionalidade de criação em breve.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((m) => (
            <div key={m.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{m.nome}</h3>
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700 capitalize">
                    {m.categoria}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm">{m.descricao}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ml-4 ${m.ativa ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-zinc-700 text-zinc-400 border-zinc-600'}`}>
                {m.ativa ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
