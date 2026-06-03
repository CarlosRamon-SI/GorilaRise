import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Medal } from 'lucide-react'

interface Premiacao {
  id: number
  titulo: string
  descricao: string
  atletaNome: string
  data: string
  imagemUrl?: string
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://pressticket.adtecnologia.com.br'

export default function PremiacoesPublicas() {
  const [items, setItems] = useState<Premiacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Premiacao[]>('/premiacoes?ativo=true')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-gorila-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gorila-yellow/20 flex items-center justify-center mx-auto mb-6">
            <Medal size={32} className="text-gorila-yellow" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Premiações e Conquistas</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            O orgulho do Gorila Rise em cada competição e conquista dos nossos atletas.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-60 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Medal size={48} className="mx-auto mb-4 opacity-30" />
              <p>Nenhuma premiação publicada ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.map(p => (
                <div key={p.id} className="rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  {p.imagemUrl && (
                    <img src={`${BASE_URL}${p.imagemUrl}`} alt={p.titulo}
                      className="w-full h-48 object-cover"
                      onError={e => (e.currentTarget.style.display = 'none')} />
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Medal size={16} className="text-gorila-yellow shrink-0" />
                      <h3 className="font-bold text-gorila-primary">{p.titulo}</h3>
                    </div>
                    {p.atletaNome && <p className="text-sm text-gray-600 mb-1 font-medium">{p.atletaNome}</p>}
                    {p.data && <p className="text-xs text-gray-400 mb-3">{new Date(p.data).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}</p>}
                    {p.descricao && <p className="text-sm text-gray-500 leading-relaxed">{p.descricao}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
