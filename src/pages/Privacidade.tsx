import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-black text-gorila-primary mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-500 mb-8">Última atualização: junho de 2025</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-gorila-primary mb-2">1. Dados Coletados</h2>
            <p>
              Coletamos os dados fornecidos no cadastro (nome, e-mail, CPF, telefone, endereço, data de
              nascimento) e informações de uso do sistema (registros de treino, avaliações físicas,
              histórico de acesso).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gorila-primary mb-2">2. Uso dos Dados</h2>
            <p>Seus dados são usados para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fornecer e personalizar os serviços de treinamento.</li>
              <li>Comunicação sobre sua conta e planos.</li>
              <li>Envio de notificações relacionadas ao treino (quando autorizado).</li>
              <li>Cumprimento de obrigações legais.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gorila-primary mb-2">3. Compartilhamento</h2>
            <p>
              Não vendemos ou compartilhamos seus dados pessoais com terceiros, exceto quando exigido por
              lei ou para a prestação do próprio serviço (ex.: processadores de pagamento).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gorila-primary mb-2">4. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia
              de senhas e transmissão segura via HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gorila-primary mb-2">5. Seus Direitos (LGPD)</h2>
            <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Confirmar a existência de tratamento dos seus dados.</li>
              <li>Acessar, corrigir ou excluir seus dados.</li>
              <li>Revogar consentimentos concedidos.</li>
              <li>Solicitar portabilidade dos dados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gorila-primary mb-2">6. Retenção de Dados</h2>
            <p>
              Mantemos seus dados enquanto a conta estiver ativa. Após cancelamento, os dados são
              anonimizados ou excluídos em até 90 dias, salvo obrigação legal de retenção.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gorila-primary mb-2">7. Contato do DPO</h2>
            <p>
              Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato:{' '}
              <a href="mailto:privacidade@gorilarise.com.br" className="text-gorila-primary hover:underline">
                privacidade@gorilarise.com.br
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
