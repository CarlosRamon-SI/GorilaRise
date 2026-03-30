import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { api } from '@/lib/api'
import { Check, Zap } from 'lucide-react'

interface Plano {
  id: number
  nome: string
  valor: string
  descricao?: string
}

const LEVEL_STYLES = [
  { border: 'border-zinc-300',        badge: 'bg-zinc-100 text-zinc-600',            cta: 'bg-gorila-primary text-white hover:bg-gorila-dark',        highlight: false },
  { border: 'border-blue-300',        badge: 'bg-blue-50 text-blue-700',             cta: 'bg-gorila-primary text-white hover:bg-gorila-dark',        highlight: false },
  { border: 'border-yellow-400 shadow-lg shadow-yellow-100', badge: 'bg-yellow-400 text-gorila-primary', cta: 'bg-yellow-400 text-gorila-primary hover:bg-yellow-300 font-black', highlight: true  },
  { border: 'border-purple-400',      badge: 'bg-purple-100 text-purple-700',        cta: 'bg-gorila-primary text-white hover:bg-gorila-dark',        highlight: false },
]

function parseBeneficios(descricao?: string): string[] {
  if (!descricao) return []
  return descricao.split('+').map(s => s.trim()).filter(Boolean)
}

export default function Planos() {
  const { data: planos = [], isLoading } = useQuery<Plano[]>({
    queryKey: ['planos'],
    queryFn: () => api.get<Plano[]>('/planos'),
  })

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <div className="bg-gorila-primary text-white py-16 text-center">
        <p className="text-gorila-yellow font-bold text-sm uppercase tracking-widest mb-3">Associe-se</p>
        <h1 className="text-4xl font-black mb-4">Escolha seu plano</h1>
        <p className="text-white/70 max-w-xl mx-auto text-base">
          Planos para todos os níveis. Cancele quando quiser.
        </p>
      </div>

      {/* Cards */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {planos.map((plano, i) => {
              const style = LEVEL_STYLES[i % LEVEL_STYLES.length]
              const beneficios = parseBeneficios(plano.descricao)

              return (
                <div key={plano.id}
                  className={`relative flex flex-col rounded-2xl border-2 p-6 ${style.border} ${style.highlight ? 'bg-white' : 'bg-white'}`}>

                  {style.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="flex items-center gap-1 bg-yellow-400 text-gorila-primary text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                        <Zap size={11} fill="currentColor" /> Mais popular
                      </span>
                    </div>
                  )}

                  {/* Badge nível */}
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit mb-4 ${style.badge}`}>
                    {plano.nome}
                  </span>

                  {/* Preço */}
                  <div className="mb-6">
                    <span className="text-sm text-gray-400">R$</span>
                    <span className="text-4xl font-black text-gorila-primary ml-1">
                      {Number(plano.valor).toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-gray-400 text-sm">/mês</span>
                  </div>

                  {/* Benefícios */}
                  {beneficios.length > 0 && (
                    <ul className="flex-1 space-y-2.5 mb-6">
                      {beneficios.map((b, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check size={15} className="text-green-500 shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link to="/cadastro" state={{ planoId: plano.id }}
                    className={`mt-auto block text-center text-sm font-bold py-3 px-4 rounded-xl transition-colors ${style.cta}`}>
                    Assinar agora
                  </Link>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* CTA O Teste */}
      <div className="bg-gorila-primary py-14 text-center text-white">
        <p className="text-gorila-yellow font-bold text-sm uppercase tracking-widest mb-3">Quer competir?</p>
        <h2 className="text-3xl font-black mb-4">Participe do processo seletivo</h2>
        <p className="text-white/70 max-w-lg mx-auto mb-8 text-sm">
          Uma vez por ano abrimos vagas para atletas que querem integrar nossas equipes competitivas.
        </p>
        <Link to="/o-teste"
          className="inline-flex items-center gap-2 bg-gorila-yellow text-gorila-primary font-black px-8 py-3 rounded-xl hover:bg-yellow-300 transition-colors">
          <Zap size={16} fill="currentColor" /> Conhecer O Teste
        </Link>
      </div>

      <Footer />
    </div>
  )
}
