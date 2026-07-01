import { useEffect, useState, useRef } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Trash2, X, Check, Upload, Building2, ExternalLink } from 'lucide-react'

interface Patrocinador {
  id: number
  nome: string
  descricao?: string | null
  logoUrl?: string | null
  link?: string | null
  categoria: 'PLATINA' | 'OURO' | 'PRATA' | 'BRONZE'
  ativo: boolean
}

const blank = () => ({ nome: '', descricao: '', logoUrl: '', link: '', categoria: 'OURO' as const })
const CATS = { PLATINA: 'Platina', OURO: 'Ouro', PRATA: 'Prata', BRONZE: 'Bronze' }
const CAT_COLORS: Record<string, string> = {
  PLATINA: 'bg-slate-400/20 text-slate-300',
  OURO: 'bg-yellow-500/20 text-yellow-400',
  PRATA: 'bg-zinc-400/20 text-zinc-300',
  BRONZE: 'bg-orange-700/20 text-orange-400',
}

export default function Patrocinadores() {
  const [items, setItems] = useState<Patrocinador[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank())
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get<Patrocinador[]>('/patrocinadores')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function startEdit(p: Patrocinador) {
    setEditId(p.id)
    setForm({ nome: p.nome, descricao: p.descricao ?? '', logoUrl: p.logoUrl ?? '', link: p.link ?? '', categoria: p.categoria })
    setShowForm(true); setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() { setShowForm(false); setEditId(null); setForm(blank()); setError('') }

  async function uploadLogo(file: File) {
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await api.upload<{ url: string }>('/upload', fd)
    setForm(p => ({ ...p, logoUrl: res.url }))
    setUploading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editId) {
        const updated = await api.patch<Patrocinador>(`/patrocinadores/${editId}`, form)
        setItems(prev => prev.map(p => p.id === editId ? updated : p))
      } else {
        const novo = await api.post<Patrocinador>('/patrocinadores', form)
        setItems(prev => [novo, ...prev])
      }
      cancelForm()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover patrocinador?')) return
    await api.delete(`/patrocinadores/${id}`)
    setItems(prev => prev.filter(p => p.id !== id))
  }

  async function toggleAtivo(p: Patrocinador) {
    const updated = await api.patch<Patrocinador>(`/patrocinadores/${p.id}`, { ativo: !p.ativo })
    setItems(prev => prev.map(item => item.id === p.id ? updated : item))
  }

  return (
    <div className="px-4 py-5 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Patrocinadores</h1>
          <p className="text-zinc-400 text-sm mt-1">Empresas e parceiros do clube de vantagens</p>
        </div>
        <button onClick={() => { cancelForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-yellow-400 text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300">
          <Plus size={16} /> Novo Patrocinador
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{editId ? 'Editar' : 'Novo'} Patrocinador</h3>
            <button type="button" onClick={cancelForm}><X size={18} className="text-zinc-400 hover:text-white" /></button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Nome da empresa <span className="text-red-400">*</span></label>
              <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                placeholder="ex: Farmácia Vida"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Categoria</label>
              <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value as typeof form.categoria }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {Object.entries(CATS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Site / Link</label>
              <input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
                placeholder="https://..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Logo</label>
              <div className="flex gap-2 mb-2">
                <input value={form.logoUrl} onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))}
                  placeholder="URL ou upload"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-lg text-zinc-300 disabled:opacity-50 shrink-0">
                  {uploading ? '...' : <Upload size={15} />}
                </button>
                <input ref={fileRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f) }} />
              </div>
              {/* Preview */}
              {form.logoUrl && (
                <div className="mb-2 p-3 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center gap-4">
                  <div className="bg-white rounded p-2 flex items-center justify-center w-28 h-14 shrink-0">
                    <img src={form.logoUrl} alt="preview claro" className="max-w-full max-h-full object-contain"
                      onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                  <div className="bg-gorila-primary rounded p-2 flex items-center justify-center w-28 h-14 shrink-0">
                    <img src={form.logoUrl} alt="preview escuro" className="max-w-full max-h-full object-contain"
                      onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">Pré-visualização em fundo claro (home) e escuro (rodapé)</p>
                </div>
              )}
              {/* Dicas */}
              <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 text-[11px] text-zinc-400 space-y-1">
                <p className="font-semibold text-zinc-300 mb-1.5">Orientações para a logo:</p>
                <p>• <span className="text-white">Formato ideal:</span> PNG com fundo transparente ou SVG — garante boa aparência em qualquer cor de fundo</p>
                <p>• <span className="text-white">Dimensões recomendadas:</span> horizontal, mínimo 300 × 150 px — logos muito quadradas ou verticais ficam pequenas na exibição</p>
                <p>• <span className="text-white">Tamanho máximo:</span> 5 MB por arquivo</p>
                <p>• <span className="text-white">Fundo branco:</span> evite — em fundos escuros (rodapé) fica com um retângulo branco visível; prefira fundo transparente</p>
                <p>• <span className="text-white">Cores:</span> a logo é exibida com as cores originais; verifique a pré-visualização acima antes de salvar</p>
              </div>
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
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-zinc-500"><Building2 size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhum patrocinador cadastrado.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(p => (
            <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
              {p.logoUrl ? (
                <img src={p.logoUrl} alt={p.nome} className="w-14 h-14 object-contain rounded-lg bg-white/5 p-1 shrink-0"
                  onError={e => (e.currentTarget.style.display = 'none')} />
              ) : (
                <div className="w-14 h-14 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                  <Building2 size={22} className="text-zinc-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{p.nome}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CAT_COLORS[p.categoria]}`}>{CATS[p.categoria]}</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <button onClick={() => toggleAtivo(p)}
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${p.ativo ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                  {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-yellow-400"><ExternalLink size={12} /></a>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(p)} className="text-zinc-600 hover:text-yellow-400 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(p.id)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
