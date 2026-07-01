import { useEffect, useState, useRef } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Trash2, X, Check, Upload, Gift, ExternalLink, Tag } from 'lucide-react'

interface Vantagem {
  id: number
  empresa: string
  beneficio: string
  codigoDesc?: string | null
  logoUrl?: string | null
  link?: string | null
  categoria: string
  ativo: boolean
}

const CATEGORIAS = ['Saúde', 'Alimentação', 'Esporte', 'Educação', 'Lazer', 'Beleza', 'Tecnologia', 'Outros']

const blank = () => ({
  empresa: '', beneficio: '', codigoDesc: '', logoUrl: '', link: '', categoria: 'Saúde'
})

export default function ClubeVantagens() {
  const [items, setItems] = useState<Vantagem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank())
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get<Vantagem[]>('/admin/vantagens')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function startEdit(v: Vantagem) {
    setEditId(v.id)
    setForm({
      empresa: v.empresa,
      beneficio: v.beneficio,
      codigoDesc: v.codigoDesc ?? '',
      logoUrl: v.logoUrl ?? '',
      link: v.link ?? '',
      categoria: v.categoria,
    })
    setShowForm(true); setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() { setShowForm(false); setEditId(null); setForm(blank()); setError('') }

  async function uploadLogo(file: File) {
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await api.upload<{ url: string }>('/upload', fd)
      setForm(p => ({ ...p, logoUrl: res.url }))
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editId) {
        const updated = await api.patch<Vantagem>(`/admin/vantagens/${editId}`, form)
        setItems(prev => prev.map(v => v.id === editId ? updated : v))
      } else {
        const nova = await api.post<Vantagem>('/admin/vantagens', form)
        setItems(prev => [nova, ...prev])
      }
      cancelForm()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover vantagem?')) return
    await api.delete(`/admin/vantagens/${id}`)
    setItems(prev => prev.filter(v => v.id !== id))
  }

  async function toggleAtivo(v: Vantagem) {
    const updated = await api.patch<Vantagem>(`/admin/vantagens/${v.id}`, { ativo: !v.ativo })
    setItems(prev => prev.map(item => item.id === v.id ? updated : item))
  }

  const categorias = [...new Set(items.map(v => v.categoria))].sort()

  return (
    <div className="px-4 py-5 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Clube de Vantagens</h1>
          <p className="text-zinc-400 text-sm mt-1">Benefícios e descontos exclusivos para associados</p>
        </div>
        <button
          onClick={() => { cancelForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-yellow-400 text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300"
        >
          <Plus size={16} /> Nova Vantagem
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">{editId ? 'Editar' : 'Nova'} Vantagem</h3>
            <button type="button" onClick={cancelForm}><X size={18} className="text-zinc-400 hover:text-white" /></button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Empresa parceira <span className="text-red-400">*</span></label>
              <input required value={form.empresa} onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))}
                placeholder="ex: Farmácia Vida"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Categoria</label>
              <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Descrição do benefício <span className="text-red-400">*</span></label>
              <textarea required value={form.beneficio} onChange={e => setForm(p => ({ ...p, beneficio: e.target.value }))}
                rows={2} placeholder="ex: 15% de desconto em todos os produtos com carteirinha Gorila Rise"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Código de desconto</label>
              <input value={form.codigoDesc} onChange={e => setForm(p => ({ ...p, codigoDesc: e.target.value }))}
                placeholder="ex: GORILA15"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Site / Link</label>
              <input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
                placeholder="https://..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Logo da empresa</label>
              <div className="flex gap-2">
                <input value={form.logoUrl} onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))}
                  placeholder="URL ou upload"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-lg text-zinc-300 disabled:opacity-50">
                  {uploading ? '...' : <Upload size={15} />}
                </button>
                <input ref={fileRef} type="file" className="hidden" accept="image/*"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f) }} />
              </div>
              {form.logoUrl && (
                <img src={form.logoUrl} alt="preview" className="mt-2 h-12 object-contain rounded bg-white/5 p-1"
                  onError={e => (e.currentTarget.style.display = 'none')} />
              )}
            </div>
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
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <Gift size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhuma vantagem cadastrada.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categorias.map(cat => {
            const grupo = items.filter(v => v.categoria === cat)
            return (
              <div key={cat}>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">{cat}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {grupo.map(v => (
                    <div key={v.id} className={`bg-zinc-900 border rounded-xl p-4 flex items-start gap-4 ${v.ativo ? 'border-zinc-800' : 'border-zinc-800/50 opacity-50'}`}>
                      {v.logoUrl ? (
                        <img src={v.logoUrl} alt={v.empresa} className="w-12 h-12 object-contain rounded-lg bg-white/5 p-1 shrink-0"
                          onError={e => (e.currentTarget.style.display = 'none')} />
                      ) : (
                        <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                          <Gift size={20} className="text-zinc-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{v.empresa}</p>
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{v.beneficio}</p>
                        {v.codigoDesc && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <Tag size={10} className="text-yellow-400" />
                            <span className="text-[11px] font-mono font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                              {v.codigoDesc}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => toggleAtivo(v)}
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${v.ativo ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                            {v.ativo ? 'Ativo' : 'Inativo'}
                          </button>
                          {v.link && (
                            <a href={v.link} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-yellow-400">
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => startEdit(v)} className="text-zinc-600 hover:text-yellow-400 transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(v.id)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
