import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { api } from '@/lib/api'
import { Heart, Star, Shield, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

export default function AnjosDoEsporte() {
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '', tipo: 'PF', mensagem: '' })
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      await api.post('/leads', { ...form, origem: 'anjos-do-esporte' })
      toast.success('Solicitação enviada! Entraremos em contato em breve.')
      setForm({ nome: '', email: '', whatsapp: '', tipo: 'PF', mensagem: '' })
    } catch {
      toast.error('Erro ao enviar. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gorila-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gorila-yellow/20 flex items-center justify-center mx-auto mb-6">
            <Heart size={32} className="text-gorila-yellow" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Anjos do Esporte</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Apoie o desenvolvimento esportivo da nossa comunidade e ainda reduza seus impostos.
          </p>
        </div>
      </section>

      {/* Benefícios fiscais */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-black text-gorila-primary text-center mb-3">Incentivos Fiscais</h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            A Lei de Incentivo ao Esporte permite deduzir parte do patrocínio diretamente do Imposto de Renda.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-blue-600">PF</span>
              </div>
              <h3 className="font-bold text-gorila-primary text-xl mb-2">Pessoa Física</h3>
              <p className="text-4xl font-black text-blue-600 mb-2">6%</p>
              <p className="text-gray-500 text-sm">de dedução no IR devido</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-gorila-yellow/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-gorila-primary">PJ</span>
              </div>
              <h3 className="font-bold text-gorila-primary text-xl mb-2">Pessoa Jurídica</h3>
              <p className="text-4xl font-black text-gorila-primary mb-2">2%</p>
              <p className="text-gray-500 text-sm">de dedução no IRPJ devido</p>
            </div>
          </div>
        </div>
      </section>

      {/* O que você apoia */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-black text-gorila-primary text-center mb-10">O que você apoia</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Star, title: 'Desenvolvimento de Atletas', desc: 'Equipamentos, uniformes e infraestrutura para jovens atletas da comunidade.' },
              { icon: Heart, title: 'Projetos Sociais', desc: 'Iniciação esportiva para crianças e adolescentes em situação de vulnerabilidade.' },
              { icon: Shield, title: 'Competições', desc: 'Participação em campeonatos regionais e nacionais, representando Mato Grosso.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gorila-yellow/20 flex items-center justify-center mx-auto mb-3">
                  <Icon size={22} className="text-gorila-primary" />
                </div>
                <h3 className="font-bold text-gorila-primary mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário de contato */}
      <section className="py-16 bg-gorila-primary">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-black text-white text-center mb-2">Quero ser um Anjo</h2>
          <p className="text-gray-300 text-center mb-8 text-sm">Preencha o formulário e nossa equipe entrará em contato.</p>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Nome completo <span className="text-red-500">*</span></label>
                <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                  placeholder="Seu nome"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gorila-primary" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Tipo</label>
                <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gorila-primary bg-white">
                  <option value="PF">Pessoa Física</option>
                  <option value="PJ">Pessoa Jurídica</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">E-mail <span className="text-red-500">*</span></label>
                <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gorila-primary" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">WhatsApp</label>
                <input value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))}
                  placeholder="(65) 9 9999-9999"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gorila-primary" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Mensagem</label>
              <textarea value={form.mensagem} onChange={e => setForm(p => ({ ...p, mensagem: e.target.value }))}
                rows={3} placeholder="Conte-nos como quer apoiar o Gorila Rise..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gorila-primary resize-none" />
            </div>
            <button type="submit" disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-gorila-primary hover:bg-gorila-dark text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50">
              <Heart size={16} /> {sending ? 'Enviando...' : 'Quero apoiar o esporte'}
              <ChevronRight size={16} />
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  )
}
