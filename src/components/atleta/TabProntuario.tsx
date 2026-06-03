import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, Upload, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface Biometria {
  peso: string
  altura: string
  pressaoArterial: string
  bioimpedancia: string
}

interface Documento {
  id: number
  nome: string
  url: string
  criadoEm: string
}

export default function TabProntuario() {
  const [bio, setBio] = useState<Biometria>({ peso: '', altura: '', pressaoArterial: '', bioimpedancia: '' })
  const [docs, setDocs] = useState<Documento[]>([])
  const [savingBio, setSavingBio] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get<{ biometria: Biometria; documentos: Documento[] }>('/prontuario')
      .then(d => {
        if (d.biometria) setBio(d.biometria)
        if (d.documentos) setDocs(d.documentos)
      })
      .catch(() => {})
  }, [])

  async function saveBio(e: React.FormEvent) {
    e.preventDefault()
    setSavingBio(true)
    try {
      await api.post('/prontuario', bio)
      toast.success('Biometria salva!')
    } catch {
      toast.error('Erro ao salvar biometria.')
    } finally {
      setSavingBio(false)
    }
  }

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.upload<{ url: string; nome: string }>('/upload', fd)
      const novo = await api.post<Documento>('/prontuario/documentos', { url: res.url, nome: res.nome || file.name })
      setDocs(prev => [novo, ...prev])
      toast.success('Documento enviado!')
    } catch {
      toast.error('Erro ao enviar documento.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
            <Activity size={17} /> Prontuário Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveBio} className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700">Dados Biométricos</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {([
                { label: 'Peso (kg)', key: 'peso', placeholder: 'ex: 75.5' },
                { label: 'Altura (cm)', key: 'altura', placeholder: 'ex: 178' },
                { label: 'Pressão Arterial', key: 'pressaoArterial', placeholder: 'ex: 120/80' },
                { label: 'Bioimpedância (%)', key: 'bioimpedancia', placeholder: 'ex: 18.3' },
              ] as const).map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-600 mb-1">{label}</label>
                  <input value={bio[key]} onChange={e => setBio(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gorila-primary" />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingBio} className="bg-gorila-primary hover:bg-gorila-dark text-white text-sm">
                {savingBio ? 'Salvando...' : 'Salvar Biometria'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gorila-primary text-sm font-semibold flex items-center gap-2">
              <FileText size={15} /> Exames e Laudos
            </CardTitle>
            <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="bg-gorila-primary hover:bg-gorila-dark text-white text-xs gap-1.5">
              <Upload size={13} /> {uploading ? 'Enviando...' : 'Enviar Exame'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <input ref={fileRef} type="file" className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />

          {docs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum documento enviado.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map(d => (
                <a key={d.id} href={d.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gorila-primary/30 transition-colors group">
                  <FileText size={16} className="text-gorila-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.nome}</p>
                    <p className="text-xs text-gray-400">{new Date(d.criadoEm).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className="text-xs text-gorila-primary opacity-0 group-hover:opacity-100 transition-opacity">Abrir →</span>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
