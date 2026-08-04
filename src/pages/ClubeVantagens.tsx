import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GorilaRiseLogo from '@/components/GorilaRiseLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, ShoppingBag, Calendar, Utensils, CreditCard, ExternalLink, Tag, Loader2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';

interface Vantagem {
  id: number
  empresa: string
  beneficio: string
  codigoDesc?: string | null
  logoUrl?: string | null
  link?: string | null
  categoria: string
}

const ClubeVantagens = () => {
  const { data: vantagens = [], isLoading: vantagensLoading } = useQuery<Vantagem[]>({
    queryKey: ['vantagens-publico'],
    queryFn: () => api.get('/vantagens'),
    retry: false,
  });
  const categorias = [...new Set(vantagens.map(v => v.categoria))].sort();
  const beneficios = [{
    titulo: '25% de Desconto na Loja',
    descricao: 'Desconto especial em todos os produtos da loja oficial',
    icon: ShoppingBag,
    cor: 'bg-green-100 text-green-600'
  }, {
    titulo: 'Acesso Prioritário a Eventos',
    descricao: 'Seja o primeiro a se inscrever em workshops e competições',
    icon: Calendar,
    cor: 'bg-blue-100 text-blue-600'
  }, {
    titulo: 'Desconto na Cozinha',
    descricao: '15% de desconto em todos os lanches e refeições',
    icon: Utensils,
    cor: 'bg-orange-100 text-orange-600'
  }];
  return <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gorila-yellow rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="text-gorila-primary" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gorila-primary mb-4">Clube de Vantagens</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">O Clube de Vantagens Gorila Rise é uma rede de ofertas exclusivas aos atletas com benefícios em diversos segmentos.</p>
        </div>

        {/* Como Funciona */}
        <section className="mb-16">
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-gorila-primary mb-6 text-center">
              Como Funciona
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 mb-6 text-center">Estabelecimentos parceiros comprometem-se a garantir descontos e benefícios aos atletas.</p>
              
              <div className="bg-white rounded-lg p-6 border-l-4 border-gorila-yellow">
                <h3 className="text-xl font-semibold text-gorila-primary mb-3">Utilização</h3>
                <p className="text-gray-700">Para obter as vantagens oferecidas pelos parceiros do Clube de Vantagens Gorila Rise, os atletas deverão apresentar, no ato da compra, o cartão virtual,  que deverá ser exigido pelos estabelecimentos comerciais.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefícios Principais */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gorila-primary mb-8 text-center">
            Benefícios Exclusivos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {beneficios.map((beneficio, index) => <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${beneficio.cor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <beneficio.icon size={32} />
                  </div>
                  <CardTitle className="text-gorila-primary">{beneficio.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">{beneficio.descricao}</p>
                </CardContent>
              </Card>)}
          </div>
        </section>

        {/* Cartão Virtual */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gorila-primary mb-4">
              Seu Cartão de Associado
            </h2>
            <p className="text-lg text-gray-600">
              Apresente seu cartão virtual e aproveite os descontos
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <Card className="bg-gradient-to-r from-gorila-primary to-gorila-dark text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <GorilaRiseLogo size="sm" className="text-white" />
                  <CreditCard size={24} />
                </div>
                <div className="mb-4">
                  <p className="text-sm opacity-80">Nome do Associado</p>
                  <p className="text-lg font-bold">ATLETA GORILA RISE</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm opacity-80">Válido até</p>
                    <p className="font-bold">12/2025</p>
                  </div>
                  <Badge className="bg-gorila-yellow text-gorila-primary">
                    ATIVO
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Rede de Parceiros */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gorila-primary mb-4">
              Rede de Parceiros
            </h2>
            <p className="text-lg text-gray-600">
              Descontos especiais em estabelecimentos parceiros
            </p>
          </div>

          {vantagensLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-gorila-primary" />
            </div>
          ) : vantagens.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Gift size={40} className="mx-auto mb-3 opacity-40" />
              <p>Nenhum parceiro cadastrado no momento. Em breve teremos novidades!</p>
            </div>
          ) : (
            <div className="space-y-10">
              {categorias.map(categoria => (
                <div key={categoria}>
                  <h3 className="text-xl font-bold text-gorila-primary mb-4">{categoria}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {vantagens.filter(v => v.categoria === categoria).map(v => (
                      <Card key={v.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3 mb-3">
                            {v.logoUrl ? (
                              <img src={v.logoUrl} alt={v.empresa}
                                className="w-12 h-12 object-contain rounded-lg border border-gray-100 bg-gray-50 p-1 shrink-0"
                                onError={e => (e.currentTarget.style.display = 'none')} />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gorila-yellow flex items-center justify-center shrink-0">
                                <Gift className="text-gorila-primary" size={22} />
                              </div>
                            )}
                            <p className="font-bold text-gorila-primary leading-tight pt-1">{v.empresa}</p>
                          </div>
                          <p className="text-sm text-gray-600">{v.beneficio}</p>
                          {v.codigoDesc && (
                            <div className="flex items-center gap-2 mt-3">
                              <Tag size={12} className="text-gorila-primary shrink-0" />
                              <span className="font-mono font-bold text-gorila-primary bg-gorila-yellow/20 px-2 py-0.5 rounded text-xs tracking-wider">
                                {v.codigoDesc}
                              </span>
                            </div>
                          )}
                          {v.link && (
                            <a href={v.link} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 text-xs text-gorila-primary hover:underline mt-3">
                              <ExternalLink size={12} /> Ver site
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA - Ficha de Inscrição */}
        <section className="mt-16 text-center bg-gorila-primary text-white py-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Faça Parte do Clube!</h2>
          <p className="text-xl mb-8 text-gray-300">
            Preencha sua ficha de inscrição e comece a aproveitar todos os benefícios
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ficha-inscricao">
              <Button className="bg-gorila-yellow text-gorila-primary hover:bg-yellow-400 font-bold text-lg px-8 py-3 flex items-center space-x-2">
                <FileText size={20} />
                <span>Preencher Ficha de Inscrição</span>
              </Button>
            </Link>
            <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gorila-primary font-bold text-lg px-8 py-3">
              Acessar Minha Conta
            </Button>
          </div>
        </section>
      </div>

      <Footer />
    </div>;
};
export default ClubeVantagens;