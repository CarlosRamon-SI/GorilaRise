import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Check, X, ExternalLink, Upload, Trash2 } from 'lucide-react'

interface Projeto {
  id: number
  titulo: string
  slug: string
  subtitulo?: string
  descricao: string
  conteudo?: string
  imagemUrl?: string
  icone: string
  ativo: boolean
}

const ICONES = [
  { value: 'heart',  label: '❤️  Coração' },
  { value: 'users',  label: '👥 Pessoas' },
  { value: 'music',  label: '🎵 Música' },
  { value: 'book',   label: '📚 Educação' },
  { value: 'leaf',   label: '🌿 Sustentabilidade' },
  { value: 'star',   label: '⭐ Destaque' },
  { value: 'zap',    label: '⚡ Energia' },
  { value: 'globe',  label: '🌍 Comunidade' },
]

const blank = () => ({
  titulo: '', subtitulo: '', descricao: '',
  conteudo: '', imagemUrl: '', icone: 'heart',
})

const BASE_URL = import.meta.env.VITE_SITE_URL ?? 'https://evo.adtecnologia.com.br'

export default function AdminProjetos() {
  const [items, setItems] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank())
  const [editId, setEditId] = useState<number | null>(null)
  const [editSlug, setEditSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Projeto[]>('/projetos')
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  function startEdit(p: Projeto) {
    setEditId(p.id)
    setEditSlug(p.slug)
    setForm({
      titulo: p.titulo,
      subtitulo: p.subtitulo ?? '',
      descricao: p.descricao,
      conteudo: p.conteudo ?? '',
      imagemUrl: p.imagemUrl ?? '',
      icone: p.icone,
    })
    setShowForm(true)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
    setEditSlug('')
    setForm(blank())
    setError('')
  }


  async function uploadImagem(file: File) {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const token = localStorage.getItem('gorila_token')
      const BASE_API = import.meta.env.VITE_API_URL ?? 'https://pressticket.adtecnologia.com.br'
      const res = await fetch(`${BASE_API}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'Erro no upload')
      const BASE_API_URL = import.meta.env.VITE_API_URL ?? 'https://pressticket.adtecnologia.com.br'
      setForm(f => ({ ...f, imagemUrl: `${BASE_API_URL}${data.url}` }))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      imagemUrl: form.imagemUrl || undefined,
      subtitulo: form.subtitulo || undefined,
      conteudo: form.conteudo || undefined,
    }
    try {
      if (editId) {
        const updated = await api.patch<Projeto>(`/projetos/${editId}`, payload)
        setItems(prev => prev.map(x => x.id === editId ? updated : x))
      } else {
        const created = await api.post<Projeto>('/projetos', payload)
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
    <div className="px-4 py-5 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Projetos Sociais</h1>
          <p className="text-zinc-400 text-sm">{items.length} projeto(s)</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
            <Plus size={16} /> Novo projeto
          </button>
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={submit} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-zinc-300 uppercase tracking-wider">
              {editId ? 'Editar projeto' : 'Novo projeto'}
            </h2>
            {editId && editSlug && (
              <a
                href={`${BASE_URL}/projetos/${editSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <ExternalLink size={13} /> Ver página
              </a>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Linha 1 — título + ícone */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-zinc-400 block mb-1">Título</label>
              <input required value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                placeholder="Ex: Ponto de Fusão" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Ícone</label>
              <select value={form.icone}
                onChange={e => setForm(f => ({ ...f, icone: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400">
                {ICONES.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>
          </div>

          {/* Subtítulo */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Subtítulo <span className="text-zinc-600">(tagline)</span></label>
            <input value={form.subtitulo}
              onChange={e => setForm(f => ({ ...f, subtitulo: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
              placeholder="Ex: Cultura hip-hop como transformação social" />
          </div>

          {/* Descrição curta */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Descrição curta <span className="text-zinc-600">(usada nos cards)</span></label>
            <textarea required rows={2} value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400 resize-none"
              placeholder="Resumo do projeto para exibição nos cards e navbar" />
          </div>

          {/* Divisor */}
          <div className="border-t border-zinc-700 pt-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Conteúdo da página</p>

            {/* Imagem */}
            <div className="mb-4">
              <label className="text-xs text-zinc-400 block mb-1">Imagem de capa <span className="text-zinc-600">(opcional — JPEG, PNG, WebP, máx 5MB)</span></label>
              {form.imagemUrl ? (
                <div className="relative w-fit">
                  <img src={form.imagemUrl} alt="preview" className="h-32 rounded-lg object-cover border border-zinc-700" />
                  <button type="button" onClick={() => setForm(f => ({ ...f, imagemUrl: '' }))}
                    className="absolute top-1 right-1 bg-zinc-900/80 hover:bg-red-600 p-1 rounded-md transition-colors">
                    <Trash2 size={13} className="text-white" />
                  </button>
                </div>
              ) : (
                <label className={`flex items-center gap-3 w-full border-2 border-dashed rounded-lg px-4 py-5 cursor-pointer transition-colors ${uploading ? 'border-yellow-400/50 bg-yellow-400/5' : 'border-zinc-700 hover:border-zinc-500'}`}>
                  <Upload size={18} className={uploading ? 'text-yellow-400 animate-bounce' : 'text-zinc-500'} />
                  <span className="text-sm text-zinc-400">
                    {uploading ? 'Enviando...' : 'Clique para selecionar uma imagem'}
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                    disabled={uploading}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadImagem(f) }} />
                </label>
              )}
            </div>

            {/* Conteúdo */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Conteúdo <span className="text-zinc-600">(separe parágrafos com linha em branco)</span>
              </label>
              <textarea rows={10} value={form.conteudo}
                onChange={e => setForm(f => ({ ...f, conteudo: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400 resize-y font-mono leading-relaxed"
                placeholder={"Primeiro parágrafo do projeto...\n\nSegundo parágrafo com mais detalhes...\n\nTerceiro parágrafo, etc."} />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
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

      {/* Lista */}
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
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{p.titulo}</p>
                  <a href={`${BASE_URL}/projetos/${p.slug}`} target="_blank" rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-yellow-400 transition-colors">
                    <ExternalLink size={13} />
                  </a>
                </div>
                {p.subtitulo && <p className="text-yellow-400/70 text-xs mb-1">{p.subtitulo}</p>}
                <p className="text-zinc-400 text-sm line-clamp-2">{p.descricao}</p>
                <p className="text-zinc-600 text-xs mt-1">/{p.slug}</p>
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
