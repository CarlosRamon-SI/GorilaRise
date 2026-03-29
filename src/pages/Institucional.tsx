
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Heart, FileText, Leaf, Target, Dumbbell, Medal, Zap, ExternalLink } from 'lucide-react';

const Institucional = () => {
  const esportes = [
    {
      nome: 'Atletismo',
      icon: Target,
      descricao: 'Corridas, saltos e arremessos em pista oficial'
    },
    {
      nome: 'Basquete',
      icon: Trophy,
      descricao: 'Quadra oficial para treinos e competições'
    },
    {
      nome: 'Boxe',
      icon: Medal,
      descricao: 'Ring profissional com equipamentos de segurança'
    },
    {
      nome: 'Cheerleader',
      icon: Heart,
      descricao: 'Modalidade de torcida organizada com coreografias'
    },
    {
      nome: 'Flag Futebol',
      icon: Target,
      descricao: 'Modalidade sem contato com foco na estratégia'
    },
    {
      nome: 'Futebol',
      icon: Trophy,
      descricao: 'Campo oficial para todas as categorias'
    },
    {
      nome: 'Levantamento de Peso Olímpico',
      icon: Dumbbell,
      descricao: 'Plataforma oficial com barras e anilhas olímpicas'
    },
    {
      nome: 'Natação',
      icon: Trophy,
      descricao: 'Piscina semiolímpica para todos os níveis'
    }
  ];

  const projetos = [{
    nome: 'Ponto de Fusão',
    icon: Zap,
    descricao: 'Promover a cultura hip-hop como ferramenta de transformação social, integrando seus quatro elementos fundamentais (DJ, MC, Breaking e Graffiti) para engajar jovens em atividades artísticas, educativas e comunitárias, reforçando identidade, crítica social e expressão criativa.',
    cor: 'bg-orange-100 text-orange-600'
  }];

  const valores = [{
    titulo: 'Transparência',
    descricao: 'Prestação de contas clara e acessível a todos os membros',
    icon: FileText
  }, {
    titulo: 'Sustentabilidade',
    descricao: 'Práticas ecológicas e responsabilidade ambiental',
    icon: Leaf
  }, {
    titulo: 'Inclusão',
    descricao: 'Esporte acessível para todas as idades e classes sociais',
    icon: Users
  }];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gorila-primary mb-4">O Clube</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conheça as modalidades, projetos e a estrutura da Associação Esportiva e Cultural Gorila Rise
          </p>
        </div>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gorila-primary mb-4">Esportes Olímpicos</h2>
            <p className="text-lg text-gray-600">
              Modalidades para todos os gostos e objetivos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {esportes.map((esporte, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gorila-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                    <esporte.icon className="text-gorila-primary" size={32} />
                  </div>
                  <CardTitle className="text-gorila-primary">{esporte.nome}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-4">{esporte.descricao}</p>
                  <a 
                    href={`https://forms.gle/inscricao-${esporte.nome.toLowerCase().replace(/\s+/g, '-')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-gorila-primary hover:bg-gorila-dark text-white text-sm px-4 py-2 inline-flex items-center gap-2">
                      Inscrever-se
                      <ExternalLink size={14} />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gorila-primary mb-4">
              Projetos Culturais
            </h2>
            <p className="text-lg text-gray-600">
              Desenvolvendo talentos além do esporte
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
            {projetos.map((projeto, index) => 
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${projeto.cor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <projeto.icon size={32} />
                  </div>
                  <CardTitle className="text-gorila-primary">{projeto.nome}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">{projeto.descricao}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gorila-primary mb-4">
              Documentos Oficiais
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <FileText className="text-gorila-yellow" size={32} />
                  <div>
                    <CardTitle className="text-gorila-primary">Estatuto Social</CardTitle>
                    <CardDescription>Documento fundador do clube</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Documento que estabelece a natureza, finalidade e funcionamento 
                  do Esporte Clube Gorila Rise.
                </p>
                <Badge className="bg-gorila-primary text-white">
                  Disponível para consulta
                </Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <FileText className="text-gorila-yellow" size={32} />
                  <div>
                    <CardTitle className="text-gorila-primary">Regimento Interno</CardTitle>
                    <CardDescription>Normas e regulamentos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Regulamentação detalhada sobre uso das instalações, 
                  direitos e deveres dos associados.
                </p>
                <Badge className="bg-gorila-primary text-white">
                  Disponível para consulta
                </Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gorila-primary mb-4">
              Nossos Valores
            </h2>
            <p className="text-lg text-gray-600">
              Compromissos que guiam nossas ações
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valores.map((valor, index) => 
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gorila-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                    <valor.icon className="text-gorila-primary" size={32} />
                  </div>
                  <CardTitle className="text-gorila-primary">{valor.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">{valor.descricao}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="bg-gray-50 -mx-4 px-4 py-12 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gorila-primary mb-4">
              Diretoria Executiva
            </h2>
            <p className="text-lg text-gray-600">
              Gestão 2024-2026
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-24 h-24 bg-gorila-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gorila-primary mb-2">Presidente</h3>
              <p className="text-gray-600">João Silva</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gorila-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gorila-primary mb-2">Vice-Presidente</h3>
              <p className="text-gray-600">Maria Santos</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gorila-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gorila-primary mb-2">Diretor Esportivo</h3>
              <p className="text-gray-600">Carlos Oliveira</p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Institucional;
