import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface Foto {
  id: number
  tipo: 'INICIAL' | 'PROGRESSO'
  url: string
  criadoEm: string
}

export default function TabFotos({ tipo }: { tipo: 'INICIAL' | 'PROGRESSO' }) {
  const [fotos, setFotos] = useState<Foto[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get<Foto[]>(`/fotos-progresso?tipo=${tipo}`)
      .then(setFotos)
      .catch(() => {})
  }, [tipo])

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.upload<{ url: string }>('/upload', fd)
      const nova = await api.post<Foto>('/fotos-progresso', { url: res.url, tipo })
      setFotos(prev => [...prev, nova])
      toast.success('Foto enviada!')
    } catch {
      toast.error('Erro ao enviar foto.')
    } finally {
      setUploading(false)
    }
  }

  const titulo = tipo === 'INICIAL' ? 'Foto Inicial' : 'Fotos de Progresso (24 Semanas)'
  const desc = tipo === 'INICIAL'
    ? 'Foto de referência inicial para acompanhamento do seu progresso.'
    : 'Comparativo visual da sua evolução ao longo de 24 semanas.'

  const fotoPrincipal = fotos[fotos.length - 1]
  const fotoAnterior = fotos.length > 1 ? fotos[0] : null

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
            <Camera size={17} /> {titulo}
          </CardTitle>
          <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="bg-gorila-primary hover:bg-gorila-dark text-white text-xs gap-1.5">
            <Upload size={13} /> {uploading ? 'Enviando...' : 'Enviar Foto'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-500 mb-4">{desc}</p>
        <input ref={fileRef} type="file" className="hidden"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />

        {fotos.length === 0 ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center cursor-pointer hover:border-gorila-primary/40 transition-colors"
          >
            <Camera size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-400">Clique para enviar a primeira foto</p>
            <p className="text-xs text-gray-300 mt-1">JPG, PNG ou WebP</p>
          </div>
        ) : tipo === 'INICIAL' ? (
          <div className="space-y-3">
            {fotos.map(f => (
              <div key={f.id} className="rounded-xl overflow-hidden border border-gray-200">
                <img src={f.url} alt="Foto inicial" className="w-full max-h-96 object-cover" />
                <p className="text-xs text-gray-400 p-2 text-right">
                  {new Date(f.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {fotoAnterior && fotoPrincipal && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Comparativo</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1 text-center">Antes — {new Date(fotoAnterior.criadoEm).toLocaleDateString('pt-BR')}</p>
                    <img src={fotoAnterior.url} alt="Antes" className="w-full aspect-[3/4] object-cover rounded-lg border border-gray-200" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1 text-center">Depois — {new Date(fotoPrincipal.criadoEm).toLocaleDateString('pt-BR')}</p>
                    <img src={fotoPrincipal.url} alt="Depois" className="w-full aspect-[3/4] object-cover rounded-lg border border-gorila-yellow" />
                  </div>
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Histórico ({fotos.length} fotos)</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {fotos.map(f => (
                  <div key={f.id} className="rounded-lg overflow-hidden border border-gray-200">
                    <img src={f.url} alt="Progresso" className="w-full aspect-[3/4] object-cover" />
                    <p className="text-[10px] text-gray-400 p-1 text-center">{new Date(f.criadoEm).toLocaleDateString('pt-BR', { month:'short', year:'2-digit' })}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
