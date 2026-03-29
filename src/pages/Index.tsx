import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GorilaRiseLogo from '@/components/GorilaRiseLogo';
import TestModal from '@/components/TestModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Dumbbell, ShoppingBag, Gift, Building, MapPin, Clock, Bell, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifForm, setNotifForm] = useState({ nome: '', email: '', whatsapp: '' });
  const [notifSent, setNotifSent] = useState(false);

  const handleNotifSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrar com backend / webhook
    setNotifSent(true);
  };

  const upcomingEvents = [
    {
      day: '12', month: 'Abr', time: '09:00', type: 'Torneio',
      typeColor: 'bg-amber-500',
      title: 'Torneio Interno de Futevôlei',
      description: 'Disputa entre equipes do clube em categoria livre. Inscrições abertas até 10/04.',
      location: 'Quadra Principal',
    },
    {
      day: '19', month: 'Abr', time: '10:00', type: 'Workshop',
      typeColor: 'bg-blue-500',
      title: 'Workshop — LPO Módulo 2',
      description: 'Continuação do módulo de Levantamento de Peso Olímpico com foco em snatch.',
      location: 'Box Gorila Rise',
    },
    {
      day: '26', month: 'Abr', time: '14:00', type: 'Social',
      typeColor: 'bg-purple-500',
      title: 'Rise Kids — Dia do Atleta',
      description: 'Tarde esportiva e cultural para crianças e jovens do projeto social.',
      location: 'Área Externa',
    },
    {
      day: '03', month: 'Mai', time: '08:00', type: 'Treino',
      typeColor: 'bg-green-600',
      title: 'Treino Funcional Coletivo',
      description: 'Treino aberto para todos os membros. Traga sua equipe e venha suar!',
      location: 'Box Gorila Rise',
    },
    {
      day: '10', month: 'Mai', time: '19:00', type: 'Palestra',
      typeColor: 'bg-sky-500',
      title: 'Saúde Mental no Esporte',
      description: 'Bate-papo com psicólogo esportivo sobre performance e equilíbrio emocional.',
      location: 'Sala de Eventos',
    },
    {
      day: '17', month: 'Mai', time: '09:00', type: 'Campeonato',
      typeColor: 'bg-red-500',
      title: 'Campeonato Interno — Crossfit',
      description: 'Competição interna com três categorias: iniciante, intermediário e Rx.',
      location: 'Box Gorila Rise',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gorila-primary to-gorila-dark text-white min-h-[calc(100vh-64px)] flex items-center">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <div className="mb-6">
              <div className="flex justify-center mb-6">
                <GorilaRiseLogo size="lg" className="text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-8 text-gorila-yellow">
                Mantenha-se forte
              </h1>
            </div>
            <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cadastro">
                <Button className="bg-gorila-yellow text-gorila-primary hover:bg-yellow-400 font-bold text-lg px-8 py-3">
                  Entre para o Bando
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-gorila-primary font-bold text-lg px-8 py-3">
                  Já sou membro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gorila-primary mb-8">Sobre o Gorila Rise</h2>
            <div className="text-lg leading-relaxed text-gray-700 mb-8 text-left space-y-4">
              <p>Nascemos em 2018 com o propósito de transformar vidas através do esporte e da cultura. O que começou como um estudo de treino evoluiu para a <strong className="text-gorila-primary">Associação Esportiva e Cultural Gorila Rise</strong> — um espaço onde força, disciplina, superação e comunidade andam juntas.</p>
              <p>Aqui não é só academia. É um verdadeiro clube de atletas que treinam com excelência, equipamentos de ponta e profissionais altamente qualificados. Oferecemos treinos funcionais, CrossFit, levantamento de peso olímpico, futevôlei e muito mais, sempre com foco em resultados reais e na construção de uma versão mais forte de você.</p>
              <p>Além da performance, carregamos uma missão maior: promover inclusão, cidadania e desenvolvimento humano por meio do esporte, especialmente com o <strong className="text-gorila-primary">Projeto Rise Kids</strong>, que impacta crianças e jovens da nossa região.</p>
              <p className="font-semibold text-gorila-primary">No Gorila Rise você encontra:</p>
              <ul className="space-y-1 pl-4">
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gorila-yellow inline-block" />Treinos de alto nível</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gorila-yellow inline-block" />Comunidade unida e motivadora</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gorila-yellow inline-block" />Eventos, workshops e competições internas</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gorila-yellow inline-block" />Loja oficial e clube de vantagens exclusivas</li>
              </ul>
              <p className="font-bold text-gorila-primary pt-2">Mantenha-se forte.<br /><span className="font-normal text-gray-700">Aqui você não treina sozinho. Você evolui junto com o bando.</span></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gorila-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="text-gorila-primary" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gorila-primary mb-2">Excelência</h3>
                <p className="text-gray-600">Equipamentos de última geração e profissionais qualificados</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gorila-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-gorila-primary" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gorila-primary mb-2">Comunidade</h3>
                <p className="text-gray-600">Um bando unido em busca dos mesmos objetivos</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gorila-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="text-gorila-primary" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gorila-primary mb-2">Resultados</h3>
                <p className="text-gray-600">Métodos comprovados para alcançar seus objetivos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-gorila-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-3">Próximos Eventos</h2>
              <p className="text-gorila-yellow font-semibold">Fique por dentro da agenda do bando</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  className="bg-gorila-dark rounded-xl overflow-hidden hover:scale-[1.02] hover:shadow-xl transition-all duration-200"
                >
                  {/* Date + type bar */}
                  <div className="bg-gorila-yellow px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center leading-none">
                        <span className="text-3xl font-black text-gorila-primary">{event.day}</span>
                        <p className="text-xs font-bold text-gorila-primary uppercase tracking-wider">{event.month}</p>
                      </div>
                      <div className="w-px h-9 bg-gorila-primary/20" />
                      <div className="flex items-center gap-1 text-gorila-primary">
                        <Clock size={13} />
                        <span className="text-sm font-semibold">{event.time}</span>
                      </div>
                    </div>
                    <Badge className={`${event.typeColor} text-white border-0 text-xs`}>
                      {event.type}
                    </Badge>
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-white font-bold text-base mb-2 leading-snug">{event.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">{event.description}</p>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                      <MapPin size={12} />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA notificações */}
            <div className="text-center mt-10">
              <button
                onClick={() => { setNotifOpen(true); setNotifSent(false); }}
                className="inline-flex items-center gap-2 bg-gorila-yellow text-gorila-primary font-bold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors"
              >
                <Bell size={18} />
                Receber notificações de eventos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal notificações */}
      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gorila-primary text-xl font-bold">
              Fique por dentro dos eventos
            </DialogTitle>
          </DialogHeader>
          {notifSent ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <CheckCircle2 size={56} className="text-green-500" />
              <p className="text-gorila-primary font-semibold text-center text-lg">Cadastro realizado!</p>
              <p className="text-gray-500 text-center text-sm">
                Você receberá as novidades dos próximos eventos do Gorila Rise.
              </p>
            </div>
          ) : (
            <form onSubmit={handleNotifSubmit} className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notif-nome">Nome</Label>
                <Input
                  id="notif-nome"
                  placeholder="Seu nome"
                  required
                  value={notifForm.nome}
                  onChange={e => setNotifForm(f => ({ ...f, nome: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notif-email">E-mail</Label>
                <Input
                  id="notif-email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={notifForm.email}
                  onChange={e => setNotifForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notif-whatsapp">WhatsApp <span className="text-gray-400 font-normal">(opcional)</span></Label>
                <Input
                  id="notif-whatsapp"
                  placeholder="(11) 99999-9999"
                  value={notifForm.whatsapp}
                  onChange={e => setNotifForm(f => ({ ...f, whatsapp: e.target.value }))}
                />
              </div>
              <Button type="submit" className="bg-gorila-primary hover:bg-gorila-dark text-white mt-2">
                Quero receber notificações
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Main Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gorila-primary mb-12">
            Explore o Gorila Rise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gorila-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="text-gorila-primary" size={32} />
                </div>
                <CardTitle className="text-gorila-primary">Loja</CardTitle>
                <CardDescription>Produtos oficiais, suplementos, equipamentos esportivos e workshopp</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/loja">
                  <Button className="bg-gorila-primary hover:bg-gorila-dark text-white">
                    Visitar Loja
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gorila-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="text-gorila-primary" size={32} />
                </div>
                <CardTitle className="text-gorila-primary">Clube de Vantagens</CardTitle>
                <CardDescription>
                  Descontos exclusivos e benefícios especiais para nossos atletas
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/clube-vantagens">
                  <Button className="bg-gorila-primary hover:bg-gorila-dark text-white">
                    Conhecer Benefícios
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gorila-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="text-gorila-primary" size={32} />
                </div>
                <CardTitle className="text-gorila-primary">Institucional</CardTitle>
                <CardDescription>
                  Conheça nossa estrutura, esportes e projetos sociais
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/institucional">
                  <Button className="bg-gorila-primary hover:bg-gorila-dark text-white">
                    Saiba Mais
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gorila-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Pronto para se juntar ao bando?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Comece sua jornada de transformação hoje mesmo
          </p>
          <Link to="/cadastro">
            <Button className="bg-gorila-yellow text-gorila-primary hover:bg-yellow-400 font-bold text-lg px-8 py-3">
              Cadastre-se Agora
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
