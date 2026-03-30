import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ArrowLeft, Heart, Users, Music, BookOpen, Leaf, Star, Zap, Globe } from 'lucide-react'

interface ProjetoSocial {
  id: number
  titulo: string
  slug: string
  subtitulo?: string
  descricao: string
  conteudo?: string
  imagemUrl?: string
  icone: string
}

const ICONE_MAP: Record<string, any> = {
  heart: Heart, users: Users, music: Music,
  book: BookOpen, leaf: Leaf, star: Star, zap: Zap, globe: Globe,
}

export default function ProjetoPage() {
  const { slug } = useParams<{ slug: string }>()

  const { data: projeto, isLoading, isError } = useQuery<ProjetoSocial>({
    queryKey: ['projeto', slug],
    queryFn: () => api.get<ProjetoSocial>(`/projetos/${slug}`),
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20 max-w-3xl">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-48 bg-gray-100 rounded mt-8" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (isError || !projeto) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-gray-400 text-lg">Projeto não encontrado.</p>
          <Link to="/a-associacao" className="text-gorila-primary underline mt-4 inline-block">
            Voltar para A Associação
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const IconComp = ICONE_MAP[projeto.icone] ?? Heart

  // Quebra o conteúdo em parágrafos por linha em branco
  const paragrafos = projeto.conteudo
    ? projeto.conteudo.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
    : []

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <div className="bg-gorila-primary text-white">
        {projeto.imagemUrl && (
          <div
            className="h-64 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${projeto.imagemUrl})` }}
          >
            <div className="absolute inset-0 bg-gorila-primary/70" />
          </div>
        )}
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Link
            to="/a-associacao"
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={15} /> A Associação
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gorila-yellow/20 flex items-center justify-center shrink-0">
              <IconComp size={24} className="text-gorila-yellow" />
            </div>
            <div>
              <h1 className="text-3xl font-black">{projeto.titulo}</h1>
              {projeto.subtitulo && (
                <p className="text-gorila-yellow/80 text-sm mt-0.5">{projeto.subtitulo}</p>
              )}
            </div>
          </div>

          <p className="text-white/80 text-base leading-relaxed max-w-2xl">{projeto.descricao}</p>
        </div>
      </div>

      {/* Conteúdo */}
      {paragrafos.length > 0 && (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="prose prose-gray max-w-none space-y-5">
            {paragrafos.map((p, i) => (
              <p key={i} className="text-gray-600 leading-relaxed text-base">{p}</p>
            ))}
          </div>
        </div>
      )}

      {paragrafos.length === 0 && (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <p className="text-gray-400 italic text-sm">Conteúdo em breve.</p>
        </div>
      )}

      <Footer />
    </div>
  )
}
