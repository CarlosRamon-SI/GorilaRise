import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Gift, ExternalLink, Tag, Loader2 } from 'lucide-react'

interface Vantagem {
  id: number
  empresa: string
  beneficio: string
  codigoDesc?: string | null
  logoUrl?: string | null
  link?: string | null
  categoria: string
}

export default function TabVantagens() {
  const { data: vantagens = [], isLoading, isError } = useQuery<Vantagem[]>({
    queryKey: ['vantagens'],
    queryFn: () => api.get('/vantagens'),
    staleTime: 5 * 60_000,
    retry: 1,
  })

  const categorias = [...new Set(vantagens.map(v => v.categoria))].sort()

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <Loader2 size={24} className="animate-spin text-gorila-primary" />
    </div>
  )

  if (isError) return (
    <Card>
      <CardContent className="py-12 text-center text-red-400 text-sm">
        Erro ao carregar vantagens. Tente novamente.
      </CardContent>
    </Card>
  )

  if (vantagens.length === 0) return (
    <Card>
      <CardContent className="py-12 text-center text-gray-400">
        <Gift size={36} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">Nenhuma vantagem disponível no momento.</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
            <Gift size={17} /> Clube de Vantagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Benefícios e descontos exclusivos para associados Gorila Rise. Apresente sua carteirinha ou use o código ao realizar a compra.
          </p>
        </CardContent>
      </Card>

      {categorias.map(cat => (
        <div key={cat}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">{cat}</p>
          <div className="space-y-3">
            {vantagens.filter(v => v.categoria === cat).map(v => (
              <Card key={v.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {v.logoUrl ? (
                      <img src={v.logoUrl} alt={v.empresa}
                        className="w-14 h-14 object-contain rounded-lg border border-gray-100 bg-gray-50 p-1 shrink-0"
                        onError={e => (e.currentTarget.style.display = 'none')} />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gorila-yellow/10 flex items-center justify-center shrink-0">
                        <Gift size={22} className="text-gorila-primary/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-bold text-gorila-primary">{v.empresa}</p>
                        {v.link && (
                          <a href={v.link} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-gorila-primary hover:underline shrink-0">
                            <ExternalLink size={12} /> Ver site
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{v.beneficio}</p>
                      {v.codigoDesc && (
                        <div className="flex items-center gap-2 mt-2">
                          <Tag size={12} className="text-gorila-primary shrink-0" />
                          <span className="text-xs text-gray-500">Código:</span>
                          <span className="font-mono font-bold text-gorila-primary bg-gorila-yellow/20 px-2 py-0.5 rounded text-sm tracking-wider">
                            {v.codigoDesc}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
