import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Termos() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-black text-gorila-primary mb-2">Termos e Condições</h1>
        <p className="text-sm text-gray-500 mb-8">Última atualização: junho de 2025</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-gorila-primary mb-2">1. Aceitação</h2>
            <p>
              Ao se cadastrar no Gorila Rise, você concorda com estes Termos e Condições. O acesso aos
              serviços está condicionado à leitura e aceitação integral deste documento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gorila-primary mb-2">2. Sobre o Serviço</h2>
            <p>
              O Gorila Rise é um sistema de gestão e treinamento esportivo. Oferecemos planos de
              treinamento, acompanhamento nutricional, avaliações físicas e acesso à nossa comunidade de
              atletas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gorila-primary mb-2">3. Responsabilidades do Usuário</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fornecer informações verídicas no cadastro.</li>
              <li>Manter a confidencialidade de suas credenciais de acesso.</li>
              <li>Não compartilhar acesso com terceiros.</li>
              <li>Comunicar imediatamente qualquer uso não autorizado da conta.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gorila-primary mb-2">4. Planos e Pagamentos</h2>
            <p>
              Os planos disponíveis e seus valores estão descritos na página de planos. O pagamento é
              mensal e a renovação ocorre automaticamente. O cancelamento pode ser solicitado a qualquer
              momento com efeito no próximo ciclo de cobrança.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gorila-primary mb-2">5. Saúde e Responsabilidade</h2>
            <p>
              Nossos treinadores são profissionais qualificados, porém recomendamos consulta médica prévia
              antes de iniciar qualquer programa de treinamento. O Gorila Rise não se responsabiliza por
              lesões decorrentes de prática inadequada.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gorila-primary mb-2">6. Alterações nos Termos</h2>
            <p>
              Reservamo-nos o direito de atualizar estes termos a qualquer momento. Notificações serão
              enviadas por e-mail. O uso continuado do serviço após alterações implica aceitação das novas
              condições.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gorila-primary mb-2">7. Contato</h2>
            <p>
              Dúvidas sobre estes termos podem ser enviadas para{' '}
              <a href="mailto:contato@gorilarise.com.br" className="text-gorila-primary hover:underline">
                contato@gorilarise.com.br
              </a>
              .
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
