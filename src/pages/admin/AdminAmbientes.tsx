import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { MapPin, Plus, Check, X, Pencil } from 'lucide-react'

interface Ambiente {
  id: number
  nome: string
  descricao?: string | null
  capacidade: number
  ativo: boolean
}

const EMPTY: Omit<Ambiente, 'id'> = { nome: '', descricao: '', capacidade: 10, ativo: true }

export default function AdminAmbientes() {
  const [items, setItems] = useState<Ambiente[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Omit<Ambiente, 'id'>>(EMPTY)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    api.get<Ambiente[]>('/admin/ambientes')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setForm(EMPTY)
    setEditId(null)
    setError('')
    setShowForm(true)
  }

  function openEdit(a: Ambiente) {
    setForm({ nome: a.nome, descricao: a.descricao ?? '', capacidade: a.capacidade, ativo: a.ativo })
    setEditId(a.id)
    setError('')
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (editId) {
        const updated = await api.patch<Ambiente>(`/admin/ambientes/${editId}`, form)
        setItems(prev => prev.map(a => a.id === editId ? updated : a))
      } else {
        const created = await api.post<Ambiente>('/admin/ambientes', form)
        setItems(prev => [created, ...prev])
      }
      setShowForm(false)
      setEditId(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAtivo(a: Ambiente) {
    try {
      const updated = await api.patch<Ambiente>(`/admin/ambientes/${a.id}`, { ativo: !a.ativo })
      setItems(prev => prev.map(x => x.id === a.id ? updated : x))
    } catch { /* silencia */ }
  }

  return (
    <div className="px-4 py-5 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin size={20} className="text-gorila-yellow" /> Ambientes
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Espaços físicos com capacidade de atletas</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gorila-yellow text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 transition-colors"
        >
          <Plus size={15} /> Novo Ambiente
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-8 space-y-4">
          <h3 className="font-semibold text-sm">{editId ? 'Editar Ambiente' : 'Novo Ambiente'}</h3>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Nome *</label>
              <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                placeholder="ex: Sala Principal"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Capacidade *</label>
              <input required type="number" min={1} value={form.capacidade}
                onChange={e => setForm(p => ({ ...p, capacidade: Number(e.target.value) }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Descrição</label>
            <input value={form.descricao ?? ''} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
              placeholder="ex: Mat de BJJ, 200m²"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => setForm(p => ({ ...p, ativo: e.target.checked }))} />
            <label htmlFor="ativo" className="text-sm text-zinc-300">Ambiente ativo</label>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-gorila-yellow text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 disabled:opacity-50">
              <Check size={15} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="flex items-center gap-2 border border-zinc-600 text-zinc-400 px-4 py-2 rounded-lg text-sm hover:border-zinc-400 hover:text-zinc-200">
              <X size={15} /> Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">Nenhum ambiente cadastrado.</div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800">
              <tr className="text-zinc-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-center">Capacidade</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {items.map(a => (
                <tr key={a.id} className={`hover:bg-zinc-800/30 transition-colors ${!a.ativo ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-medium">{a.nome}</td>
                  <td className="px-4 py-3 text-zinc-400">{a.descricao || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-full">{a.capacidade} atletas</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.ativo ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400'}`}>
                      {a.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(a)}
                        className="text-zinc-400 hover:text-white transition-colors p-1">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => toggleAtivo(a)}
                        className="text-xs px-2 py-1 rounded border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors">
                        {a.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
