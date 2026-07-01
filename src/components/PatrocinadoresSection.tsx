import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { useConfiguracoes } from '@/hooks/useConfiguracoes'
import { ExternalLink } from 'lucide-react'

interface Patrocinador {
  id: number
  nome: string
  descricao?: string | null
  logoUrl?: string | null
  link?: string | null
  categoria: 'PLATINA' | 'OURO' | 'PRATA' | 'BRONZE'
}

const CAT_ORDER: Record<string, number> = { PLATINA: 0, OURO: 1, PRATA: 2, BRONZE: 3 }
const CAT_LABEL: Record<string, string> = { PLATINA: 'Platina', OURO: 'Ouro', PRATA: 'Prata', BRONZE: 'Bronze' }
const CAT_STYLE: Record<string, string> = {
  PLATINA: 'text-slate-500 border-slate-300',
  OURO:    'text-yellow-600 border-yellow-400',
  PRATA:   'text-zinc-500 border-zinc-300',
  BRONZE:  'text-orange-700 border-orange-400',
}
const CAT_COLS: Record<string, number> = { PLATINA: 4, OURO: 5, PRATA: 6, BRONZE: 6 }

function CatCarousel({ cat, items }: { cat: string; items: Patrocinador[] }) {
  const [idx, setIdx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [perPage, setPerPage] = useState(CAT_COLS[cat] ?? 5)

  useEffect(() => {
    function calc() {
      if (!containerRef.current) return
      const w = containerRef.current.offsetWidth
      const base = CAT_COLS[cat] ?? 5
      setPerPage(Math.max(2, Math.min(base, Math.floor(w / 150))))
    }
    calc()
    const ro = new ResizeObserver(calc)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [cat])

  const pages = Math.ceil(items.length / perPage)
  const slice = items.slice(idx * perPage, idx * perPage + perPage)
  const showControls = pages > 1

  return (
    <div ref={containerRef}>
      <div className="flex items-center gap-2">
        {showControls && (
          <button onClick={() => setIdx(i => (i - 1 + pages) % pages)}
            className="shrink-0 w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gorila-primary hover:border-gorila-primary transition-colors text-sm">
            ‹
          </button>
        )}
        <div className="flex flex-wrap justify-center gap-5 flex-1">
          {slice.map(p => (
            <div key={p.id} className="flex flex-col items-center gap-2 w-40 group">
              <div className="w-36 h-20 flex items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-3 group-hover:border-gorila-primary/20 transition-colors">
                {p.logoUrl ? (
                  <img src={p.logoUrl} alt={p.nome}
                    className="max-w-full max-h-full object-contain"
                    onError={e => (e.currentTarget.style.display = 'none')} />
                ) : (
                  <span className="text-xs font-bold text-gorila-primary/40 text-center leading-tight">{p.nome}</span>
                )}
              </div>
              <p className="text-xs font-semibold text-gorila-primary text-center leading-tight">{p.nome}</p>
              {p.descricao && (
                <p className="text-[10px] text-gray-400 text-center leading-tight">{p.descricao}</p>
              )}
              {p.link && (
                <a href={p.link} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-gorila-primary/50 hover:text-gorila-primary transition-colors">
                  <ExternalLink size={10} /> Ver site
                </a>
              )}
            </div>
          ))}
        </div>
        {showControls && (
          <button onClick={() => setIdx(i => (i + 1) % pages)}
            className="shrink-0 w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gorila-primary hover:border-gorila-primary transition-colors text-sm">
            ›
          </button>
        )}
      </div>
      {showControls && (
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: pages }).map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-gorila-primary' : 'bg-gray-200'}`} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PatrocinadoresSection() {
  const cfg = useConfiguracoes()
  const { data: patrocinadores = [] } = useQuery<Patrocinador[]>({
    queryKey: ['patrocinadores-publico'],
    queryFn:  () => api.get('/patrocinadores?ativo=true'),
    staleTime: 10 * 60_000,
    retry: 1,
  })

  if (patrocinadores.length === 0) return null

  const mostrarCategorias = cfg.exibirCategoriasPatrocinadores
  const categorias = [...new Set(patrocinadores.map(p => p.categoria))]
    .sort((a, b) => CAT_ORDER[a] - CAT_ORDER[b])

  return (
    <section className="bg-white py-16 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gorila-primary/50 mb-2">Apoiadores</p>
          <h2 className="text-2xl font-black text-gorila-primary">Nossos Patrocinadores</h2>
        </div>

        {mostrarCategorias ? (
          <div className="space-y-10">
            {categorias.map(cat => (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`text-[10px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded-full ${CAT_STYLE[cat]}`}>
                    {CAT_LABEL[cat]}
                  </div>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <CatCarousel cat={cat} items={patrocinadores.filter(p => p.categoria === cat)} />
              </div>
            ))}
          </div>
        ) : (
          <CatCarousel cat="OURO" items={patrocinadores} />
        )}
      </div>
    </section>
  )
}
