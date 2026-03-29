import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Trophy, Clock, Target, Zap, Dumbbell, ExternalLink } from 'lucide-react';

const OTeste = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gorila-primary mb-3">Torne-se um Atleta Gorila Rise</h1>
          <p className="text-lg text-gray-600">Sua jornada rumo ao alto rendimento começa aqui.</p>
        </div>

        <div className="space-y-6">
          {/* Chamada de Talentos */}
          <div className="bg-gorila-yellow/10 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gorila-primary mb-4">
              📣 Chamada de Novos Talentos 2025
            </h2>
            <p className="text-gray-700 mb-4">
              Uma vez por ano, abrimos nossas portas para atletas que desejam integrar nossas equipes competitivas em 7 modalidades:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gorila-primary font-semibold">
              <div>• LPO (Levantamento de Peso Olímpico)</div>
              <div>• Atletismo</div>
              <div>• Basquete</div>
              <div>• Flag Football</div>
              <div>• Futebol</div>
              <div>• Cheerleading</div>
              <div>• Boxe</div>
            </div>
          </div>

          {/* Como Funciona */}
          <div>
            <h2 className="text-xl font-bold text-gorila-primary mb-4">Como Funciona Nossa Seleção?</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-bold text-gorila-primary mb-2">✅ Etapa 1: Teste Físico Integrado</h3>
              <p className="text-gray-700">
                Avaliamos 3 pilares fundamentais com protocolos reconhecidos mundialmente:
              </p>
            </div>
          </div>

          {/* Velocidade & Agilidade */}
          <div className="border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="text-gorila-yellow" size={20} />
              <h3 className="font-bold text-gorila-primary">Velocidade & Agilidade</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Testes-Chave:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 40 Yards Dash (36.5m)</li>
                  <li>• 3 Cones Drill</li>
                  <li>• Shuttle 5-10-5</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">O Que Avaliamos:</h4>
                <p className="text-sm text-gray-600">Tempo de reação, explosão e mudanças de direção</p>
              </div>
            </div>
          </div>

          {/* Força & Potência */}
          <div className="border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="text-gorila-yellow" size={20} />
              <h3 className="font-bold text-gorila-primary">Força & Potência</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Testes-Chave:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Salto Vertical</li>
                  <li>• Salto Horizontal</li>
                  <li>• Resistência Muscular</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">O Que Avaliamos:</h4>
                <p className="text-sm text-gray-600">Força explosiva, equilíbrio e resistência</p>
              </div>
            </div>
          </div>

          {/* Resistência & Mobilidade */}
          <div className="border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="text-gorila-yellow" size={20} />
              <h3 className="font-bold text-gorila-primary">Resistência & Mobilidade</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Testes-Chave:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Sit-Ups</li>
                  <li>• Ponte Isométrica</li>
                  <li>• Teste Vai e Vem 20m</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">O Que Avaliamos:</h4>
                <p className="text-sm text-gray-600">Capacidade aeróbica, estabilidade e flexibilidade</p>
              </div>
            </div>
          </div>

          {/* Inscrição */}
          <div className="bg-gorila-yellow/10 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold text-gorila-primary mb-4">📝 Faça sua Inscrição</h3>
            <p className="text-gray-700 mb-4">
              Inscreva-se agora para participar do processo seletivo 2025
            </p>
            <a
              href="https://forms.gle/inscricao-teste"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gorila-primary text-white px-6 py-3 rounded-lg hover:bg-gorila-dark transition-colors font-semibold"
            >
              Inscrever-se no Teste
              <ExternalLink size={16} />
            </a>
          </div>

          {/* Edital */}
          <div className="bg-gorila-primary text-white p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
              <Trophy size={24} />
              Edital de Recrutados
            </h3>
            <p className="text-gorila-yellow">Em breve, mais informações sobre datas e inscrições!</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OTeste;
