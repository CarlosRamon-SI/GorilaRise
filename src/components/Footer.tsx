import { MapPin, Phone, Mail, Clock, Facebook, Youtube, Instagram, Music } from 'lucide-react'
import { useConfiguracoes } from '@/hooks/useConfiguracoes'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'

interface Patrocinador {
  id: number; nome: string; logoUrl?: string | null; link?: string | null; categoria: string
}

const CAT_ORDER: Record<string, number> = { PLATINA: 0, OURO: 1, PRATA: 2, BRONZE: 3 }

function PatrocinadoresFooter() {
  const { data = [] } = useQuery<Patrocinador[]>({
    queryKey: ['patrocinadores-publico'],
    queryFn:  () => api.get('/patrocinadores?ativo=true'),
    staleTime: 10 * 60_000,
    retry: 1,
  })
  const [idx, setIdx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [perPage, setPerPage] = useState(6)

  useEffect(() => {
    function calc() {
      if (!containerRef.current) return
      const w = containerRef.current.offsetWidth
      setPerPage(Math.max(2, Math.floor(w / 120)))
    }
    calc()
    const ro = new ResizeObserver(calc)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  if (data.length === 0) return null

  const ordenados = [...data].sort((a, b) => (CAT_ORDER[a.categoria] ?? 9) - (CAT_ORDER[b.categoria] ?? 9))
  const pages = Math.ceil(ordenados.length / perPage)
  const slice = ordenados.slice(idx * perPage, idx * perPage + perPage)
  const showControls = pages > 1

  return (
    <div className="border-t border-white/10 pt-8 mb-8">
      <p className="text-xs font-bold uppercase tracking-widest text-gorila-yellow/60 text-center mb-4">Patrocinadores</p>
      <div ref={containerRef} className="relative">
        <div className="flex justify-center items-center gap-5 min-h-[40px]">
          {showControls && (
            <button onClick={() => setIdx(i => (i - 1 + pages) % pages)}
              className="shrink-0 text-white/30 hover:text-white transition-colors text-lg">‹</button>
          )}
          <div className="flex flex-wrap justify-center items-center gap-5 flex-1">
            {slice.map(p => {
              const inner = p.logoUrl
                ? <img src={p.logoUrl} alt={p.nome} className="h-8 w-auto max-w-[100px] object-contain brightness-0 invert"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                : <span className="text-xs font-semibold text-white">{p.nome}</span>
              return p.link
                ? <a key={p.id} href={p.link} target="_blank" rel="noreferrer" title={p.nome}
                    className="opacity-60 hover:opacity-100 transition-opacity">{inner}</a>
                : <div key={p.id} className="opacity-60" title={p.nome}>{inner}</div>
            })}
          </div>
          {showControls && (
            <button onClick={() => setIdx(i => (i + 1) % pages)}
              className="shrink-0 text-white/30 hover:text-white transition-colors text-lg">›</button>
          )}
        </div>
        {showControls && (
          <div className="flex justify-center gap-1 mt-3">
            {Array.from({ length: pages }).map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-gorila-yellow' : 'bg-white/20'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const DIAS_LABEL: Record<string, string> = {
  segunda: 'Segunda',
  terca:   'Terça',
  quarta:  'Quarta',
  quinta:  'Quinta',
  sexta:   'Sexta',
  sabado:  'Sábado',
  domingo: 'Domingo',
}

const ORDEM_DIAS = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']

// Agrupa dias consecutivos com o mesmo horário para exibição compacta
function formatarHorarios(horarios: Record<string, { aberto: boolean; abertura: string; fechamento: string }>) {
  const lines: string[] = []
  let i = 0
  while (i < ORDEM_DIAS.length) {
    const dia = ORDEM_DIAS[i]
    const h = horarios[dia]
    if (!h) { i++; continue }

    if (!h.aberto) {
      // Agrupa dias fechados consecutivos
      let j = i
      while (j < ORDEM_DIAS.length && !horarios[ORDEM_DIAS[j]]?.aberto) j++
      if (j - i === 1) {
        lines.push(`${DIAS_LABEL[dia]}: Fechado`)
      } else {
        lines.push(`${DIAS_LABEL[dia]} a ${DIAS_LABEL[ORDEM_DIAS[j - 1]]}: Fechado`)
      }
      i = j
    } else {
      // Agrupa dias abertos com mesmo horário
      let j = i + 1
      while (
        j < ORDEM_DIAS.length &&
        horarios[ORDEM_DIAS[j]]?.aberto &&
        horarios[ORDEM_DIAS[j]].abertura === h.abertura &&
        horarios[ORDEM_DIAS[j]].fechamento === h.fechamento
      ) j++

      const range = j - i === 1
        ? DIAS_LABEL[dia]
        : `${DIAS_LABEL[dia]} a ${DIAS_LABEL[ORDEM_DIAS[j - 1]]}`
      lines.push(`${range}: ${h.abertura} - ${h.fechamento}`)
      i = j
    }
  }
  return lines
}

function safeHref(url?: string): string | undefined {
  if (!url) return undefined
  return /^https?:\/\//.test(url) ? url : `https://${url}`
}

const Footer = () => {
  const cfg = useConfiguracoes()

  const enderecoPartes = [
    cfg.logradouro && cfg.numero ? `${cfg.logradouro}, ${cfg.numero}` : cfg.logradouro,
    cfg.complemento,
    cfg.bairro,
    cfg.cidade && cfg.estado ? `${cfg.cidade} - ${cfg.estado}` : cfg.cidade,
  ].filter(Boolean)
  const endereco = enderecoPartes.join(' - ')

  const horarioLines = formatarHorarios(cfg.horarios)

  const redes = [
    { href: safeHref(cfg.facebook),  Icon: Facebook,  label: 'Facebook'  },
    { href: safeHref(cfg.youtube),   Icon: Youtube,   label: 'YouTube'   },
    { href: safeHref(cfg.instagram), Icon: Instagram, label: 'Instagram' },
    { href: safeHref(cfg.tiktok),    Icon: Music,     label: 'TikTok'    },
  ].filter(r => r.href)

  return (
    <footer className="bg-gorila-primary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Contato */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gorila-yellow">Contato</h3>
            <div className="space-y-3">
              {endereco && (
                <div className="flex items-start space-x-3">
                  <MapPin size={18} className="text-gorila-yellow mt-0.5 flex-shrink-0" />
                  <span>{endereco}</span>
                </div>
              )}
              {cfg.telefone && (
                <div className="flex items-center space-x-3">
                  <Phone size={18} className="text-gorila-yellow flex-shrink-0" />
                  <span>{cfg.telefone}</span>
                </div>
              )}
              {cfg.email && (
                <div className="flex items-center space-x-3">
                  <Mail size={18} className="text-gorila-yellow flex-shrink-0" />
                  <span>{cfg.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Horários */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gorila-yellow">Horários</h3>
            <div className="flex items-start space-x-3">
              <Clock size={18} className="text-gorila-yellow mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                {horarioLines.length > 0
                  ? horarioLines.map((line, i) => <p key={i}>{line}</p>)
                  : <p className="text-gray-400 text-sm">Consulte pelo telefone</p>
                }
              </div>
            </div>
          </div>

          {/* Redes sociais */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gorila-yellow">Redes Sociais</h3>
            <div className="space-y-3">
              {redes.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 hover:text-gorila-yellow transition-colors"
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Sobre */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gorila-yellow">Gorila Rise</h3>
            <p className="text-gray-300 leading-relaxed">Mantenha-se forte!</p>
          </div>
        </div>

        <PatrocinadoresFooter />

        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Esporte Clube Gorila Rise. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
