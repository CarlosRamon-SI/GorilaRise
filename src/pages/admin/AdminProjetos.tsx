import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Check, X } from 'lucide-react'

interface Projeto {
  id: number
  titulo: string
  descricao: string
  icone: string
  ativo: boolean
}

// Subconjunto de ícones do Lucide representados como emoji para simplicidade visual
const ICONES = [
  { value: 'heart',      label: '❤️  Coração' },
  { value: 'users',      label: '👥 Pessoas' },
  { value: 'music',      label: '🎵 Música' },
  { value: 'book',       label: '📚 Educação' },
  { value: 'leaf',       label: '🌿 Sustentabilidade' },
  { value: 'star',       label: '⭐ Destaque' },
  { value: 'zap',        label: '⚡ Energia' },
  { value: 'globe',      label: '🌍 Comunidade' },
]

const blank = () => ({ titulo: '', descricao: '', icone: 'heart' })

export default function AdminProjetos() {
  const [items, setItems] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank())
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Projeto[]>('/projetos')
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  function startEdit(p: Projeto) {
    setEditId(p.id)
    setForm({ titulo: p.titulo, descricao: p.descricao, icone: p.icone })
    setShowForm(true)
    setError('')
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
    setForm(blank())
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editId) {
        const updated = await api.patch<Projeto>(`/projetos/${editId}`, form)
        setItems(prev => prev.map(x => x.id === editId ? updated : x))
      } else {
        const created = await api.post<Projeto>('/projetos', form)
        setItems(prev => [...prev, created])
      }
      cancelForm()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleAtivo(p: Projeto) {
    try {
      const updated = await api.patch<Projeto>(`/projetos/${p.id}`, { ativo: !p.ativo })
      setItems(prev => prev.map(x => x.id === p.id ? updated : x))
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Projetos Sociais</h1>
          <p className="text-zinc-400 text-sm">{items.length} projeto(s)</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Novo projeto
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-sm text-zinc-300 uppercase tracking-wider">
            {editId ? 'Editar projeto' : 'Novo projeto'}
          </h2>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Título</label>
              <input
                required
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                placeholder="Ex: Ponto de Fusão"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Ícone</label>
              <select
                value={form.icone}
                onChange={e => setForm(f => ({ ...f, icone: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
              >
                {ICONES.map(i => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Descrição</label>
            <textarea
              required
              rows={4}
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400 resize-none"
              placeholder="Descreva o projeto social..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={cancelForm}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
              <X size={15} /> Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-900 font-semibold text-sm px-5 py-2 rounded-lg transition-colors">
              <Check size={15} />
              {saving ? 'Salvando...' : editId ? 'Salvar alterações' : 'Criar projeto'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">Nenhum projeto ainda. Crie o primeiro!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(p => (
            <div key={p.id}
              className={`bg-zinc-900 rounded-xl border p-5 flex items-start justify-between gap-4 ${p.ativo ? 'border-zinc-800' : 'border-zinc-800/40 opacity-60'}`}>
              <div className="flex-1 min-w-0">
                <p className="font-semibold mb-1">{p.titulo}</p>
                <p className="text-zinc-400 text-sm line-clamp-2">{p.descricao}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleAtivo(p)}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                    p.ativo
                      ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                      : 'bg-zinc-700 text-zinc-400 border-zinc-600 hover:bg-zinc-600'
                  }`}>
                  {p.ativo ? 'Ativo' : 'Inativo'}
                </button>
                <button onClick={() => startEdit(p)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                  <Pencil size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
