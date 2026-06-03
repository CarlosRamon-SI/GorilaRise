import { useEffect, useState, useRef } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Trash2, X, Check, Upload, Medal } from 'lucide-react'

interface Premiacao {
  id: number
  titulo: string
  descricao: string
  atletaNome: string
  data: string
  imagemUrl?: string
  ativo: boolean
}

const blank = () => ({ titulo: '', descricao: '', atletaNome: '', data: '', imagemUrl: '' })

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://pressticket.adtecnologia.com.br'

export default function Premiacoes() {
  const [items, setItems] = useState<Premiacao[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank())
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get<Premiacao[]>('/premiacoes')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function startEdit(p: Premiacao) {
    setEditId(p.id)
    setForm({ titulo: p.titulo, descricao: p.descricao, atletaNome: p.atletaNome, data: p.data, imagemUrl: p.imagemUrl ?? '' })
    setShowForm(true); setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() { setShowForm(false); setEditId(null); setForm(blank()); setError('') }

  async function uploadImagem(file: File) {
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await api.upload<{ url: string }>('/upload', fd)
    setForm(p => ({ ...p, imagemUrl: res.url }))
    setUploading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (editId) {
        const updated = await api.patch<Premiacao>(`/premiacoes/${editId}`, form)
        setItems(prev => prev.map(p => p.id === editId ? updated : p))
      } else {
        const novo = await api.post<Premiacao>('/premiacoes', form)
        setItems(prev => [novo, ...prev])
      }
      cancelForm()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover esta premiação?')) return
    await api.delete(`/premiacoes/${id}`)
    setItems(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Premiações e Conquistas</h1>
          <p className="text-zinc-400 text-sm mt-1">Registro de prêmios da associação e dos atletas</p>
        </div>
        <button onClick={() => { cancelForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-yellow-400 text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300">
          <Plus size={16} /> Nova Premiação
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{editId ? 'Editar' : 'Nova'} Premiação</h3>
            <button type="button" onClick={cancelForm}><X size={18} className="text-zinc-400 hover:text-white" /></button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Título <span className="text-red-400">*</span></label>
              <input required value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                placeholder="ex: Campeão Regional 2025"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Atleta / Equipe</label>
              <input value={form.atletaNome} onChange={e => setForm(p => ({ ...p, atletaNome: e.target.value }))}
                placeholder="Nome do atleta ou equipe"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Data</label>
              <input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Imagem</label>
              <div className="flex gap-2">
                <input value={form.imagemUrl} onChange={e => setForm(p => ({ ...p, imagemUrl: e.target.value }))}
                  placeholder="URL ou upload abaixo"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-lg text-zinc-300 transition-colors">
                  <Upload size={15} />
                </button>
                <input ref={fileRef} type="file" className="hidden" accept="image/*"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImagem(f) }} />
              </div>
              {form.imagemUrl && <img src={`${BASE_URL}${form.imagemUrl}`} alt="" className="mt-2 h-20 rounded-lg object-cover" onError={e => (e.currentTarget.style.display = 'none')} />}
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Descrição</label>
            <textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
              rows={3} placeholder="Detalhes sobre a conquista..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-yellow-400 text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 disabled:opacity-50">
              <Check size={15} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={cancelForm} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800">Cancelar</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-36 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-zinc-500"><Medal size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhuma premiação cadastrada.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(p => (
            <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group">
              {p.imagemUrl && (
                <img src={`${BASE_URL}${p.imagemUrl}`} alt={p.titulo}
                  className="w-full h-36 object-cover"
                  onError={e => (e.currentTarget.style.display = 'none')} />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold flex items-center gap-1.5"><Medal size={14} className="text-yellow-400" />{p.titulo}</p>
                    {p.atletaNome && <p className="text-sm text-zinc-400 mt-0.5">{p.atletaNome}</p>}
                    {p.data && <p className="text-xs text-zinc-500 mt-1">{new Date(p.data).toLocaleDateString('pt-BR')}</p>}
                    {p.descricao && <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{p.descricao}</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => startEdit(p)} className="text-zinc-600 hover:text-yellow-400 transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
