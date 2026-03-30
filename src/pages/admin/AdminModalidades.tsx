import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Check, X } from 'lucide-react'

interface Modalidade {
  id: number
  nome: string
  descricao: string
  categoria: string
  ativa: boolean
}

const CATEGORIAS_PADRAO = ['combate', 'coletivo', 'individual', 'artistico']

const blank = () => ({ nome: '', descricao: '', categoria: 'combate' })

export default function AdminModalidades() {
  const [items, setItems] = useState<Modalidade[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank())
  const [categoriaCustom, setCategoriaCustom] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Categorias disponíveis = padrão + quaisquer novas já cadastradas
  const categoriasExistentes = Array.from(
    new Set([...CATEGORIAS_PADRAO, ...items.map(m => m.categoria)])
  )

  const categoriaFinal = form.categoria === '__nova__' ? categoriaCustom.trim() : form.categoria

  useEffect(() => {
    api.get<Modalidade[]>('/modalidades')
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  function startEdit(m: Modalidade) {
    const isCustom = !CATEGORIAS_PADRAO.includes(m.categoria)
    setEditId(m.id)
    setForm({ nome: m.nome, descricao: m.descricao, categoria: isCustom ? '__nova__' : m.categoria })
    setCategoriaCustom(isCustom ? m.categoria : '')
    setShowForm(true)
    setError('')
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
    setForm(blank())
    setCategoriaCustom('')
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.categoria === '__nova__' && !categoriaCustom.trim()) {
      setError('Informe o nome da nova categoria.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, categoria: categoriaFinal }
      if (editId) {
        const updated = await api.patch<Modalidade>(`/modalidades/${editId}`, payload)
        setItems(prev => prev.map(x => x.id === editId ? updated : x))
      } else {
        const created = await api.post<Modalidade>('/modalidades', payload)
        setItems(prev => [...prev, created])
      }
      cancelForm()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleAtiva(m: Modalidade) {
    try {
      const updated = await api.patch<Modalidade>(`/modalidades/${m.id}`, { ativa: !m.ativa })
      setItems(prev => prev.map(x => x.id === m.id ? updated : x))
    } catch (e: any) {
      alert(e.message)
    }
  }

  const catColor = (cat: string) => {
    const map: Record<string, string> = {
      combate:    'bg-red-500/20 text-red-400 border-red-500/30',
      coletivo:   'bg-blue-500/20 text-blue-400 border-blue-500/30',
      individual: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      artistico:  'bg-pink-500/20 text-pink-400 border-pink-500/30',
    }
    return map[cat] ?? 'bg-zinc-700 text-zinc-300 border-zinc-600'
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Modalidades</h1>
          <p className="text-zinc-400 text-sm">{items.length} cadastrada(s)</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Nova modalidade
          </button>
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={submit} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-sm text-zinc-300 uppercase tracking-wider">
            {editId ? 'Editar modalidade' : 'Nova modalidade'}
          </h2>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nome</label>
              <input
                required
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                placeholder="Ex: Jiu-Jitsu"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Categoria</label>
              <select
                value={form.categoria}
                onChange={e => {
                  setForm(f => ({ ...f, categoria: e.target.value }))
                  if (e.target.value !== '__nova__') setCategoriaCustom('')
                }}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
              >
                {categoriasExistentes.map(c => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
                <option value="__nova__">+ Nova categoria...</option>
              </select>
              {form.categoria === '__nova__' && (
                <input
                  required
                  autoFocus
                  value={categoriaCustom}
                  onChange={e => setCategoriaCustom(e.target.value)}
                  className="w-full mt-2 bg-zinc-800 border border-yellow-400/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                  placeholder="Nome da nova categoria"
                />
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Descrição</label>
            <textarea
              required
              rows={3}
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400 resize-none"
              placeholder="Descreva a modalidade..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={cancelForm}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <X size={15} /> Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-900 font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
            >
              <Check size={15} />
              {saving ? 'Salvando...' : editId ? 'Salvar alterações' : 'Criar modalidade'}
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">Nenhuma modalidade ainda. Crie a primeira!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(m => (
            <div
              key={m.id}
              className={`bg-zinc-900 rounded-xl border p-5 flex items-start justify-between gap-4 transition-colors ${m.ativa ? 'border-zinc-800' : 'border-zinc-800/40 opacity-60'}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{m.nome}</h3>
                  <span className={`text-xs border px-2 py-0.5 rounded-full capitalize ${catColor(m.categoria)}`}>
                    {m.categoria}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm line-clamp-2">{m.descricao}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleAtiva(m)}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                    m.ativa
                      ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                      : 'bg-zinc-700 text-zinc-400 border-zinc-600 hover:bg-zinc-600'
                  }`}
                >
                  {m.ativa ? 'Ativa' : 'Inativa'}
                </button>
                <button
                  onClick={() => startEdit(m)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
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
