import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Check, X } from 'lucide-react'

interface Plano {
  id: number
  nome: string
  valor: string
  descricao?: string
  ativo: boolean
}

const blank = () => ({ nome: '', valor: '', descricao: '' })

export default function AdminPlanos() {
  const [items, setItems] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank())
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Plano[]>('/planos')
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  function startEdit(p: Plano) {
    setEditId(p.id)
    setForm({ nome: p.nome, valor: Number(p.valor).toFixed(2), descricao: p.descricao ?? '' })
    setShowForm(true)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
    setForm(blank())
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const valor = parseFloat(form.valor.replace(',', '.'))
    if (isNaN(valor) || valor <= 0) { setError('Valor inválido.'); return }
    setSaving(true)
    setError('')
    const payload = { nome: form.nome, valor, descricao: form.descricao || undefined }
    try {
      if (editId) {
        const updated = await api.patch<Plano>(`/planos/${editId}`, payload)
        setItems(prev => prev.map(x => x.id === editId ? updated : x))
      } else {
        const created = await api.post<Plano>('/planos', payload)
        setItems(prev => [...prev, created].sort((a, b) => Number(a.valor) - Number(b.valor)))
      }
      cancelForm()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleAtivo(p: Plano) {
    try {
      const updated = await api.patch<Plano>(`/planos/${p.id}`, { ativo: !p.ativo })
      setItems(prev => prev.map(x => x.id === p.id ? updated : x))
    } catch (e: any) {
      alert(e.message)
    }
  }

  const levelColors = [
    'from-zinc-700 to-zinc-600',
    'from-blue-900 to-blue-800',
    'from-yellow-800 to-yellow-700',
    'from-purple-900 to-purple-800',
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Planos</h1>
          <p className="text-zinc-400 text-sm">{items.length} plano(s) cadastrado(s)</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
            <Plus size={16} /> Novo plano
          </button>
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={submit} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-8 space-y-4">
          <h2 className="font-semibold text-sm text-zinc-300 uppercase tracking-wider">
            {editId ? 'Editar plano' : 'Novo plano'}
          </h2>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nome do plano</label>
              <input required value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                placeholder="Ex: Plano Prata" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Valor mensal (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">R$</span>
                <input required value={form.valor}
                  onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                  placeholder="0,00" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Descrição <span className="text-zinc-600">(opcional — benefícios do plano)</span></label>
            <textarea rows={2} value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400 resize-none"
              placeholder="Ex: Acesso a 1 modalidade + academia + área de lazer" />
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={cancelForm}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
              <X size={15} /> Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-900 font-semibold text-sm px-5 py-2 rounded-lg transition-colors">
              <Check size={15} />
              {saving ? 'Salvando...' : editId ? 'Salvar alterações' : 'Criar plano'}
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl h-40 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">Nenhum plano cadastrado ainda.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p, i) => (
            <div key={p.id}
              className={`relative rounded-xl p-6 bg-gradient-to-br ${levelColors[i % levelColors.length]} border border-white/10 ${!p.ativo ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-white">{p.nome}</h3>
                <button onClick={() => toggleAtivo(p)}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                    p.ativo
                      ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                      : 'bg-zinc-700/50 text-zinc-400 border-zinc-600 hover:bg-zinc-600/50'
                  }`}>
                  {p.ativo ? 'Ativo' : 'Inativo'}
                </button>
              </div>

              <p className="text-3xl font-black text-yellow-400 mb-1">
                R$ {Number(p.valor).toFixed(2).replace('.', ',')}
              </p>
              <p className="text-white/50 text-xs mb-4">/mês</p>

              {p.descricao && (
                <p className="text-white/70 text-xs leading-relaxed border-t border-white/10 pt-3">
                  {p.descricao}
                </p>
              )}

              <button onClick={() => startEdit(p)}
                className="absolute bottom-4 right-4 p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Pencil size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
