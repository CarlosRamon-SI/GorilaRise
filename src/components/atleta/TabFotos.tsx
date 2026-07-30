import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Upload, Clock, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Foto {
  id: number
  tipo: 'INICIAL' | 'PROGRESSO'
  url: string
  criadoEm: string
}

const MIN_DIAS_ENTRE_FOTOS = 7

export default function TabFotos() {
  const [fotos, setFotos] = useState<Foto[]>([])
  const [uploading, setUploading] = useState(false)
  const [exclusaoPermitida, setExclusaoPermitida] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get<Foto[]>('/fotos-progresso')
      .then(setFotos)
      .catch(() => {})
    api.get<{ permitirAlteracaoFotos: boolean }>('/configuracoes')
      .then(cfg => setExclusaoPermitida(cfg.permitirAlteracaoFotos !== false))
      .catch(() => {})
  }, [])

  const ultima = fotos[fotos.length - 1]
  const primeira = fotos.length > 1 ? fotos[0] : null

  const proximoPermitidoEm = ultima ? (() => {
    const d = new Date(ultima.criadoEm)
    d.setDate(d.getDate() + MIN_DIAS_ENTRE_FOTOS)
    return d
  })() : null
  const bloqueadoPorIntervalo = !!proximoPermitidoEm && proximoPermitidoEm > new Date()

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.upload<{ url: string }>('/upload', fd)
      const nova = await api.post<Foto>('/fotos-progresso', { url: res.url })
      setFotos(prev => [...prev, nova])
      toast.success('Progresso registrado!')
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao enviar foto.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await api.delete(`/fotos-progresso/${id}`)
      setFotos(prev => prev.filter(f => f.id !== id))
      toast.success('Foto removida.')
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao remover foto.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
            <Camera size={17} /> Fotos de Progresso
          </CardTitle>
          {!bloqueadoPorIntervalo && (
            <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="bg-gorila-primary hover:bg-gorila-dark text-white text-xs gap-1.5">
              <Upload size={13} /> {uploading ? 'Enviando...' : 'Registrar progresso'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-500 mb-2">
          Registre sua evolução ao longo do tempo. Adicione quantas fotos precisar, com no mínimo {MIN_DIAS_ENTRE_FOTOS} dias entre um registro e outro.
        </p>
        <p className="text-xs text-gray-400 mb-4">
          {exclusaoPermitida
            ? 'Enviou uma foto errada? Você pode excluí-la na lista abaixo, ou pedir ao seu treinador.'
            : 'Enviou uma foto errada? A exclusão está desativada pelo clube — peça ao seu treinador para remover por você.'}
        </p>
        <input ref={fileRef} type="file" className="hidden"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />

        {bloqueadoPorIntervalo && proximoPermitidoEm && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
            <Clock size={14} className="flex-shrink-0" />
            Próximo registro liberado em {proximoPermitidoEm.toLocaleDateString('pt-BR')}.
          </div>
        )}

        {fotos.length === 0 ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center cursor-pointer hover:border-gorila-primary/40 transition-colors"
          >
            <Camera size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-400">Clique para registrar sua primeira foto de progresso</p>
            <p className="text-xs text-gray-300 mt-1">JPG, PNG ou WebP</p>
          </div>
        ) : (
          <div className="space-y-4">
            {primeira && ultima && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Comparativo</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1 text-center">Primeira — {new Date(primeira.criadoEm).toLocaleDateString('pt-BR')}</p>
                    <img src={primeira.url} alt="Primeira foto de progresso" onClick={() => setLightbox(primeira.url)}
                      className="w-full aspect-[3/4] object-cover rounded-lg border border-gray-200 cursor-zoom-in" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1 text-center">Mais recente — {new Date(ultima.criadoEm).toLocaleDateString('pt-BR')}</p>
                    <img src={ultima.url} alt="Foto de progresso mais recente" onClick={() => setLightbox(ultima.url)}
                      className="w-full aspect-[3/4] object-cover rounded-lg border border-gorila-yellow cursor-zoom-in" />
                  </div>
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Histórico ({fotos.length} foto{fotos.length !== 1 ? 's' : ''})</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[...fotos].reverse().map(f => (
                  <div key={f.id} className="rounded-lg overflow-hidden border border-gray-200 relative group">
                    <img src={f.url} alt="Progresso" onClick={() => setLightbox(f.url)}
                      className="w-full aspect-[3/4] object-cover cursor-zoom-in" />
                    <p className="text-[10px] text-gray-400 p-1 text-center">{new Date(f.criadoEm).toLocaleDateString('pt-BR')}</p>
                    {exclusaoPermitida && (
                      <button onClick={() => setConfirmDeleteId(f.id)} disabled={deletingId === f.id}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1.5 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {lightbox && (
        <div onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out">
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X size={28} />
          </button>
          <img src={lightbox} alt="Foto de progresso ampliada" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg" />
        </div>
      )}

      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover foto de progresso?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. A foto será removida permanentemente do seu histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDeleteId !== null) handleDelete(confirmDeleteId)
                setConfirmDeleteId(null)
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
