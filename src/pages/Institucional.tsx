import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Leaf, Users, Zap } from 'lucide-react';

// TODO: substituir por useQuery(() => fetch('/api/modalidades')) quando o painel admin estiver pronto
interface Modalidade {
  id: number;
  nome: string;
  descricao: string;
  categoria: 'combate' | 'coletivo' | 'individual' | 'artistico';
}

const modalidades: Modalidade[] = [
  { id: 1, nome: 'Atletismo', descricao: 'Corridas, saltos e arremessos em pista oficial.', categoria: 'individual' },
  { id: 2, nome: 'Basquete', descricao: 'Quadra oficial para treinos e competições.', categoria: 'coletivo' },
  { id: 3, nome: 'Boxe', descricao: 'Ring profissional com equipamentos de segurança.', categoria: 'combate' },
  { id: 4, nome: 'Cheerleading', descricao: 'Modalidade artística com coreografias e acrobacias.', categoria: 'artistico' },
  { id: 5, nome: 'Flag Futebol', descricao: 'Modalidade sem contato físico com foco em estratégia.', categoria: 'coletivo' },
  { id: 6, nome: 'Futebol', descricao: 'Campo oficial para todas as categorias.', categoria: 'coletivo' },
  { id: 7, nome: 'Levantamento de Peso Olímpico', descricao: 'Plataforma oficial com barras e anilhas olímpicas.', categoria: 'individual' },
  { id: 8, nome: 'Natação', descricao: 'Piscina semiolímpica para todos os níveis.', categoria: 'individual' },
];

const categoriaLabel: Record<Modalidade['categoria'], string> = {
  combate: 'Combate',
  coletivo: 'Coletivo',
  individual: 'Individual',
  artistico: 'Artístico',
};

const categoriaCor: Record<Modalidade['categoria'], string> = {
  combate: 'bg-red-100 text-red-700',
  coletivo: 'bg-blue-100 text-blue-700',
  individual: 'bg-green-100 text-green-700',
  artistico: 'bg-purple-100 text-purple-700',
};

const Institucional = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gorila-primary mb-4">A Associação</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conheça as modalidades, projetos e a estrutura da Associação Esportiva e Cultural Gorila Rise.
          </p>
        </div>

        {/* Modalidades */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gorila-primary mb-8">Modalidades</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modalidades.map((m) => (
              <Card key={m.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoriaCor[m.categoria]}`}>
                      {categoriaLabel[m.categoria]}
                    </span>
                  </div>
                  <CardTitle className="text-gorila-primary text-base">{m.nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 leading-relaxed">{m.descricao}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA O Teste */}
        <section className="mb-16 bg-gorila-primary rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-gorila-yellow font-bold text-sm uppercase tracking-wider mb-1">Quer competir?</p>
            <h2 className="text-2xl font-bold text-white mb-2">Participe do processo seletivo</h2>
            <p className="text-gray-300 text-sm max-w-md">
              Uma vez por ano abrimos inscrições para atletas que querem integrar nossas equipes competitivas. Saiba como funciona O Teste.
            </p>
          </div>
          <Link to="/o-teste" className="shrink-0">
            <Button className="bg-gorila-yellow text-gorila-primary hover:bg-yellow-400 font-bold px-6 flex items-center gap-2">
              <Zap size={16} fill="currentColor" />
              Conhecer O Teste
            </Button>
          </Link>
        </section>

        {/* Projetos Culturais */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gorila-primary mb-8">Projetos Culturais</h2>
          <Card className="max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Zap size={20} className="text-orange-500" />
                </div>
                <CardTitle className="text-gorila-primary">Ponto de Fusão</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm leading-relaxed">
                Promover a cultura hip-hop como ferramenta de transformação social, integrando seus quatro elementos fundamentais — DJ, MC, Breaking e Graffiti — para engajar jovens em atividades artísticas, educativas e comunitárias, reforçando identidade, crítica social e expressão criativa.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Documentos */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gorila-primary mb-8">Documentos Oficiais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            {[
              { titulo: 'Estatuto Social', desc: 'Documento fundador da associação.' },
              { titulo: 'Regimento Interno', desc: 'Normas de uso, direitos e deveres dos associados.' },
            ].map((doc) => (
              <Card key={doc.titulo} className="flex items-start gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-gorila-yellow/20 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-gorila-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gorila-primary text-sm">{doc.titulo}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{doc.desc}</p>
                  <span className="text-xs text-gray-400 mt-1 inline-block">Disponível em breve</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Valores */}
        <section>
          <h2 className="text-2xl font-bold text-gorila-primary mb-8">Nossos Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: FileText, titulo: 'Transparência', desc: 'Prestação de contas clara e acessível a todos os membros.' },
              { icon: Leaf, titulo: 'Sustentabilidade', desc: 'Práticas ecológicas e responsabilidade ambiental.' },
              { icon: Users, titulo: 'Inclusão', desc: 'Esporte acessível para todas as idades e classes sociais.' },
            ].map(({ icon: Icon, titulo, desc }) => (
              <Card key={titulo} className="p-5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-gorila-yellow/20 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-gorila-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gorila-primary text-sm">{titulo}</p>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default Institucional;
