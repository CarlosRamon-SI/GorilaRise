# Gorila Rise

Aplicação web de gestão e treinamento para clubes esportivos brasileiros.

**Produção:** https://evo.adtecnologia.com.br

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router v6
- React Query v5
- React Hook Form + Zod

## Requisitos

- Node.js 18+
- npm

## Desenvolvimento

```bash
npm install
npm run dev        # servidor em http://localhost:8080
```

## Outros comandos

```bash
npm run build      # build de produção em dist/
npm run build:dev  # build de desenvolvimento
npm run lint       # ESLint
npm run preview    # preview do build de produção
```

## Estrutura

```
src/
├── pages/          # componentes de rota
│   ├── admin/      # painel administrativo
│   └── projetos/   # páginas de projetos
├── components/     # componentes de feature
│   ├── atleta/     # tabs do painel do atleta
│   └── ui/         # primitivos shadcn/ui (não editar)
├── hooks/          # hooks customizados (timers)
├── data/           # banco de dados estático (exercícios, esportes)
└── lib/            # utilitários e cliente HTTP (api.ts)
```

## Páginas principais

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/login` | Autenticação |
| `/cadastro` | Cadastro de atleta |
| `/planos` | Planos e preços (público) |
| `/painel-atleta` | Painel do atleta |
| `/painel-professor` | Painel do professor |
| `/admin/*` | Painel administrativo |

## API

O frontend consome a API em `https://pressticket.adtecnologia.com.br` (configurável via `VITE_API_URL`). O cliente HTTP está em `src/lib/api.ts`.

## Deploy

O build é servido via nginx a partir de `/opt/gorilaRise/dist`. Para redeploy:

```bash
npm run build
```
