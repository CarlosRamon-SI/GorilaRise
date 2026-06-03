# EVO – Sistema de Gestão de Academia
## Especificação de Atores, Telas e Permissões

| | |
|---|---|
| **Cliente** | Gorila Rise |
| **Sistema** | EVO |
| **Data** | 20/04/2026 |
| **Preenchido por** | Thiago Alexandre |

---

## 1. Atores do Sistema

Lista consolidada de todos os perfis de usuário identificados para o sistema EVO.

| Ator (Papel) | Descrição | Qtd. Aprox. |
|---|---|---|
| Administrador | Gestão estratégica, financeira, controle de acessos, relatórios gerais e CMS de conteúdo. | 2 |
| Professor / Fisioterapeuta | Prescrição de treinos, avaliação física, feedback técnico, escalação de times, fotos de progresso e análise de desempenho dos atletas. | 5–10 |
| Nutricionista | Planejamento alimentar, prescrição de dietas individualizadas e acompanhamento nutricional. | 2 |
| Atleta | Consulta treinos e dietas, registra PRs, realiza check-in, preenche anamnese, adiciona exames e configura dispositivos. | 200+ |
| Sócio Torcedor | Apoiador da marca com acesso a clube de vantagens, ingressos prioritários e engajamento por gamificação. | 50+ |

---

## 2. Telas e Módulos do Sistema

Visão completa de todos os módulos funcionais identificados durante o levantamento de requisitos.

| Tela / Módulo | Descrição | Quem Acessa? |
|---|---|---|
| Dashboard Geral | Visão macro: faturamento, novos alunos, metas, retenção e produtividade. | Administrador |
| Gestão de Alunos | Cadastro, status de pagamento, contratos, suspensão por inadimplência. | Administrador |
| Financeiro / Planos | Relatórios de pagamentos, integração com gateway (PIX + cartão recorrente) e gestão de planos. | Administrador |
| Gestão de Funcionários | Cadastro de professores (login via CREF), permissões e vínculo atleta-treinador. | Administrador |
| Premiações e Conquistas | Registro de prêmios da associação e dos atletas (ex: Prêmio Jeje de Oyá). | Admin, Público |
| Anjos do Esporte (Captação) | Portal de patrocinadores e doadores (PF até 6% IR / PJ até 2% IR). | Admin, Público |
| Prescrição de Treino | Montagem de planilhas (drag-and-drop), banco de exercícios + vídeos, importação de treinos, WOD diário. | Professor, Admin |
| Módulo de Dieta | Elaboração de planos alimentares, cálculo de macros e taxa metabólica basal. | Nutricionista, Admin |
| Painel do Atleta – Meu Treino | Visualização de exercícios do dia, vídeos demonstrativos e dieta. | Atleta |
| Check-in / Presença | Marcação de presença com até 2h de antecedência; turmas com capacidade de 6 pessoas. | Atleta, Professor |
| Recordes Pessoais (PRs) | Registro de cargas e tempos; gráfico de % de carga e correlação força × técnica. | Atleta, Professor |
| Ficha de Anamnese | Preenchida 1 vez pelo atleta. Seções: dados pessoais, objetivos, histórico clínico, hábitos e termo. | Atleta (preenche), Professor/Nutri (lê) |
| Prontuário Médico | Exames, laudos, medicamentos, pressão arterial, peso, altura, envergadura e bioimpedância. | Atleta (adiciona), Prof./Nutri (lê) |
| Fotos de Progresso | Comparativo lado a lado; tirada pelo avaliador. Visível apenas para atleta e treinador. | Professor, Atleta |
| Avaliação de Desempenho | Gráficos técnicos (pontos, passes, dribles, desarmes, cartões) e físicos (distância, velocidade, sprint, zonas metabólicas). | Todos |
| Escalação de Times | Professor analisa scores dos atletas e publica lista de convocados por modalidade. | Professor |
| Cronômetro | Crescente, decrescente e intervalado; configurável pelo atleta conforme orientação do professor. | Atleta |
| Cartão de Associado | Exibe plano, data início/fim, status e QR Code dinâmico. | Atleta, Sócio Torcedor |
| Configuração de Dispositivos | Pareamento com relógios/wearables, GPS, frequência cardíaca e integração com bioimpedância. | Atleta |
| Área do Sócio Torcedor | Home do clube, carteira digital, marketplace de benefícios, ranking de engajamento e gestão de ingressos. | Sócio Torcedor |
| Gestão de Patrocinadores | Logomarca, descrição e empresa; gestão de filiadas ao clube de vantagens. | Admin |
| Notificações / Comunicados | Envio aprovado apenas pelo Admin; todos os eventos comunicados; sem filtragem pelo associado. | Admin (envia), Todos (recebe) |
| Portal Sub-Admin (Consultoria) | Professor pode criar sua consultoria esportiva, vincular alunos próprios e ter portal de admin separado. | Professor (sub-admin) |

---

## 3. Detalhes e Permissões por Ator

### 3.1 Administrador

**Funções Principais**

- Planejamento estratégico, controle financeiro e auditoria do sistema.
- Gestão de usuários: cadastro, suspensão por inadimplência e controle de permissões.
- Relatórios financeiros e integração com gateways de pagamento (PIX + cartão recorrente).
- CMS de conteúdo: banners, avisos gerais e biblioteca de vídeos de exercícios.
- Gestão de planos, preços e patrocinadores.
- Aprovação exclusiva de notificações e eventos para os associados.
- Liberação de acesso do atleta ao painel após cadastro.
- Configuração do portal Sub-Admin para professores com consultoria própria.

**Matriz de Permissões**

| Ação / Funcionalidade | Permissão | Tipo |
|---|---|---|
| Dashboard Geral (métricas, retenção, metas) | ✅ Sim | Leitura + escrita |
| Gestão de Alunos (cadastro, contratos, suspensão) | ✅ Sim | Escrita |
| Gestão de Funcionários e permissões | ✅ Sim | Escrita |
| Relatórios Financeiros e integração gateway | ✅ Sim | Escrita |
| CMS: banners, avisos, biblioteca de vídeos | ✅ Sim | Escrita |
| Aprovar envio de notificações/eventos | ✅ Sim | Escrita |
| Gestão de planos e preços | ✅ Sim | Escrita |
| Gestão de patrocinadores e clube de vantagens | ✅ Sim | Escrita |
| Premiações e conquistas | ✅ Sim | Escrita |
| Liberar acesso do atleta ao painel | ✅ Sim | Escrita |
| Acesso ao Prontuário Médico | ✅ Sim | Leitura |
| Portal Sub-Admin para consultores | ✅ Sim | Configuração |

---

### 3.2 Professor / Fisioterapeuta

**Funções Principais**

- Login realizado com número do CREF (ex: 00000-G/MT).
- Prescrição de treinos individuais (por CPF ou nome do atleta) ou coletivos (por modalidade).
- Importação de treinos do banco de dados; publicação de WOD diário.
- Banco de exercícios com vídeo demonstrativo de até 1:30 min (YouTube/Instagram).
- Adicionar fotos de progresso (antes e depois) ao perfil do atleta.
- Registrar resultados de testes físicos e escalar times com base em scores.
- Visualizar ficha de anamnese, prontuário médico, check-in e desempenho do atleta.
- Calculadoras: taxa metabólica basal, VO₂max e zona de frequência cardíaca.
- Adicionar currículo pessoal visível ao atleta.
- Gráfico de correlação entre força e técnica; análise de zonas metabólicas (ATP-CP, Glicolítica, Oxidativa).

**Matriz de Permissões**

| Ação / Funcionalidade | Permissão | Tipo |
|---|---|---|
| Login via número do CREF | ✅ Sim | Autenticação |
| Prescrever treino individual ou coletivo | ✅ Sim | Escrita |
| Importar treino do banco de dados | ✅ Sim | Escrita |
| Banco de exercícios e vídeos | ✅ Sim | Leitura + upload |
| Escalar time (análise de score + convocação) | ✅ Sim | Escrita |
| Adicionar fotos de progresso do atleta | ✅ Sim | Escrita |
| Resultado de testes físicos | ✅ Sim | Escrita |
| Ver ficha de anamnese do atleta | 👁 Somente leitura | Leitura |
| Ver prontuário médico do atleta | 👁 Somente leitura | Leitura |
| Ver check-in / presença por turma | 👁 Somente leitura | Leitura |
| Ver desempenho técnico e físico do atleta | 👁 Somente leitura | Leitura |
| Calculadoras (basal, VO2max, FC) | ✅ Sim | Uso |
| Adicionar currículo (visível ao atleta) | ✅ Sim | Escrita |
| Prescrever dieta (Nutricionista) | ✅ Sim | Escrita (nutri) |
| Cartão de associado do atleta | 👁 Somente leitura | Leitura |

---

### 3.3 Nutricionista

**Funções Principais**

- Login, busca do atleta por nome ou CPF.
- Leitura da ficha de anamnese e prontuário médico (dados biométricos).
- Cálculo da taxa metabólica basal e prescrição de dieta individualizada.
- Monitoramento de adesão alimentar e resposta a dúvidas nutricionais via chat.

**Telas que acessa**

- Módulo de Dieta
- Perfil do Atleta (dados biométricos)
- Ficha de Anamnese (leitura)
- Prontuário Médico (leitura)
- Chat de Suporte

---

### 3.4 Atleta

**Fluxo de Onboarding**

- Atleta acessa o site e realiza cadastro.
- Escolhe um plano e realiza pagamento (à vista ou cartão recorrente).
- Preenche a ficha de anamnese (1 única vez).
- Para trancar matrícula: deve apresentar atestado médico.
- Para cancelamento: solicitação na recepção com 15 dias de antecedência + multa.
- Professor/Admin libera o acesso ao painel do atleta.
- Atraso superior a 3 dias no pagamento: acesso bloqueado automaticamente.

**Check-in**

- Atleta faz login, escolhe horário disponível e marca presença com até 2h de antecedência.
- Para faltar: deve remover o check-in também com 2h de antecedência.
- Capacidade: 6 atletas por turma. O treinador visualiza (não confirma).

**Matriz de Permissões**

| Ação / Funcionalidade | Permissão | Tipo |
|---|---|---|
| Cadastro e ficha de anamnese (1 única vez) | ✅ Sim | Escrita |
| Adicionar exames ao prontuário médico | ✅ Sim | Escrita |
| Adicionar recordes pessoais (PRs) | ✅ Sim | Escrita |
| Realizar check-in (até 2h antes) | ✅ Sim | Escrita |
| Cancelar check-in (até 2h antes) | ✅ Sim | Escrita |
| Configurar cronômetro | ✅ Sim | Escrita |
| Configurar relógio/wearable | ✅ Sim | Escrita |
| Ver treino do dia e vídeos | 👁 Somente leitura | Leitura |
| Ver dieta prescrita | 👁 Somente leitura | Leitura |
| Ver contrato | 👁 Somente leitura | Leitura |
| Ver comparativo de fotos de progresso | 👁 Somente leitura | Leitura |
| Ver desempenho técnico e físico | 👁 Somente leitura | Leitura |
| Ver cartão de associado (QR Code) | 👁 Somente leitura | Leitura |
| Acesso ao painel (liberado pelo professor/admin) | ✅ Sim | Condicionado |

---

### 3.5 Sócio Torcedor

**Funções Principais**

- Cadastro no site, escolha do plano (Ouro, Prata ou Bronze) e cadastro do cartão de crédito.
- Após confirmação do pagamento, acesso liberado automaticamente ao painel.
- Gestão de ingressos: prioridade na compra, check-in antecipado, QR Code dinâmico.
- Acesso ao marketplace de vantagens e parceiros (supermercados, farmácias, etc.).
- Sistema de ranking: frequência aos jogos acumula pontos para troca por experiências.

**Matriz de Permissões**

| Ação / Funcionalidade | Permissão | Tipo |
|---|---|---|
| Cadastro e escolha de plano (Ouro/Prata/Bronze) | ✅ Sim | Escrita |
| Cadastro de cartão de crédito (recorrente) | ✅ Sim | Escrita |
| Ver benefícios do plano contratado | 👁 Somente leitura | Leitura |
| Gestão de ingressos (prioridade e QR Code) | ✅ Sim | Uso |
| Marketplace de vantagens e parceiros | 👁 Somente leitura | Leitura |
| Ranking de engajamento / pontuação | ✅ Sim | Uso |
| Home do clube (notícias e bastidores) | 👁 Somente leitura | Leitura |
| Carteira digital (QR Code + comprovante) | 👁 Somente leitura | Leitura |

---

## 4. Planos e Benefícios do Sócio Torcedor

### 4.1 Tabela de Benefícios por Categoria

| Benefício | 🥇 OURO | 🥈 PRATA | 🥉 BRONZE |
|---|---|---|---|
| Loja Oficial Gorila Rise | 15% desconto | 10% desconto | 5% desconto |
| Clube de Vantagens | 10% desconto | 10% desconto | 10% desconto |
| Camisas oficiais/temporada | 3 camisas | 2 camisas | 1 camisa |
| Caneca 500ml/temporada | 2 canecas | 1 caneca | — |
| Chopp (Gorilla Kitchen) | 5L + desconto bebidas | 4L + desconto bebidas | 2L + desconto bebidas |
| Dependentes | Até 3 | Até 2 | Até 1 |
| Valor mensal | ⚠️ A definir (contadora) | ⚠️ A definir (contadora) | ⚠️ A definir (contadora) |

**Todos os planos incluem:**

- Prioridade e desconto em ingressos (pode chegar a 100% ou 50% em setores específicos).
- Kit de Boas-Vindas com itens exclusivos.
- Sistema de pontuação por frequência (Ranking de Engajamento).
- Acesso garantido (planos premium): lugar fixo em todas as partidas como mandante.

---

## 5. Planos e Preços da Academia

| Modalidade / Plano | Personal (hora) | Mensal | Semestral/mês | Anual/mês |
|---|---|---|---|---|
| Academia – Adultos | R$ 80 | R$ 240 | R$ 200 | R$ 190 |
| Academia – 3×/semana (semestre) | — | — | R$ 180 | — |
| Associação Rise (6–21 anos) | — | R$ 120 | R$ 85 | R$ 60 |
| Modalidades Olímpicas | — | R$ 120 | R$ 85 | R$ 60 |

**Pagamento aceito:**

- Presencialmente via PIX.
- Online: cartão de crédito recorrente.

> ⚠️ Bloqueio de acesso por inadimplência após **3 dias** de atraso.

---

## 6. Grade de Turmas

| Turma | Horário | Dias | Público / Modalidade |
|---|---|---|---|
| T1 | 05:30 | Seg–Sex | Treino geral |
| T2 | 06:30 | Seg–Sex | Treino geral |
| T3 | 07:30 | Seg–Sex | Treino personalizado |
| T4 | 09:00 | Seg, Qua, Sex | Projeto Gorila Rise – Adolescentes 15–18 anos |
| T5 | 15:00 | Seg, Qua, Sex | Projeto Gorila Rise – Adolescentes 15–18 anos |
| T6–T9 | 17h–20h | Seg–Sex | Treino personalizado |
| T10 | 21:00 | Seg, Qua, Sex | Projeto Gorila Rise – Jovens 18–21 anos |
| T11 | 09:00 | Ter, Qui | Projeto Gorila Rise – Crianças/Adolescentes 6–11 anos |
| T12 | 10:00 | Ter, Qui | Projeto Gorila Rise – Adolescentes 12–14 anos |
| T13 | 15:00 | Ter, Qui | Iniciação Esportiva – 6–11 anos |
| T14 | 16:00 | Ter, Qui | Iniciação Esportiva – 12–14 anos |
| — | 16h–18h | Sábado | Treino coletivo |
| — | 08h–10h | Domingo | Treino coletivo |

> Regra de check-in: até **2h de antecedência**. Cancelamento: também até 2h antes. Capacidade: **6 atletas/turma**.

---

## 7. Ficha de Anamnese – Campos

### Seção 1 – Dados Pessoais e Identificação

- Nome completo
- Data de nascimento / Idade
- Sexo
- Telefone / WhatsApp
- Profissão (para entender padrão postural)
- Contato de emergência (nome e telefone)

### Seção 2 – Objetivos com a Atividade Física

- Emagrecimento
- Hipertrofia (ganho de massa muscular)
- Condicionamento físico / Saúde
- Reabilitação de lesão
- Lazer / Redução de estresse

### Seção 3 – Histórico de Saúde e Clínico

- Doenças diagnosticadas (ex: hipertensão, diabetes, cardiopatias)
- Medicamento de uso contínuo
- Cirurgias anteriores
- Problemas articulares ou ósseos
- Histórico familiar cardiovascular
- Tabagismo
- Frequência de idas ao banheiro por dia (dado para nutricionista)

### Seção 4 – Hábitos de Vida e Atividade Física Atual

- Histórico de atividades físicas
- Frequência semanal pretendida de treinos
- Qualidade do sono
- Consumo de álcool

### Seção 5 – Termo de Responsabilidade

- Declaração de veracidade das informações e aptidão para prática de exercícios.
- Assinatura digital do atleta + data.

---

## 8. Itens Pendentes de Validação

Os itens abaixo foram identificados durante o levantamento e necessitam de resposta do cliente para prosseguir com a especificação completa.

| # | Item Pendente | Observação / Contexto |
|---|---|---|
| 1 | ⚠️ Valores dos planos Sócio Torcedor (Ouro/Prata/Bronze) | Cliente mencionou que precisa consultar a contadora. |
| 2 | ⚠️ Dias da semana das turmas T1–T3 e T6–T10 | Horários informados, mas dias não confirmados (apenas Segunda a Sexta para algumas). |
| 3 | ⚠️ Fluxo de vinculação atleta-treinador | Não foi informado se o Admin vincula ou se o atleta escolhe. Um atleta pode ter até 2 treinadores (físico + tático). |
| 4 | ⚠️ Modelo de cobrança do Portal Sub-Admin (consultoria) | Professor João quer terceirizar a plataforma. Forma de cobrança não definida. |
| 5 | ⚠️ Endereço de envio para associados | Pergunta aberta: onde aparece o endereço para envio de kits? |
| 6 | ⚠️ Reconhecimento facial (hardware) | Confirmado para entrada na academia, mas não é prioridade. Hardware (totem/câmera) a definir. |
| 7 | ⚠️ Produção de produtos oficiais (camisas, canecas) | Cliente indicou consultar contador e produção de produtos. |
| 8 | ⚠️ Renomear 'Rise Kids' para 'Gorila Rise' | Solicitação mencionada nos guias; confirmar com cliente. |

---

*EVO – Sistema de Gestão de Academia | Cliente: Gorila Rise*
