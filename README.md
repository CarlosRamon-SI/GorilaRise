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
- A API do backend rodando à parte — repositório `GorilaRise-API` (Fastify + Prisma + MySQL), ver seção [Backend](#backend) abaixo

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API backend. Em dev: `http://localhost:3333`. Em produção: `https://evo.adtecnologia.com.br/api` (nginx faz proxy para a API na porta 3333) |
| `VITE_SITE_URL` | URL pública do site, usada para gerar links (ex.: projetos sociais) |
| `VITE_HCAPTCHA_SITE_KEY` | Site key do hCaptcha (par da `HCAPTCHA_SECRET` do backend), usada nos formulários de login/cadastro |

## Desenvolvimento

```bash
npm install
cp .env.example .env   # preencher as variáveis acima
npm run dev             # servidor em http://localhost:8080
```

> Sem a API rodando (ver [Backend](#backend)) e `VITE_API_URL` apontando para ela, telas que dependem de dados (login, painéis, admin) não funcionam.

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

## Backend

O frontend não tem lógica de servidor própria — toda a persistência (usuários, matrículas, planos, check-ins, uploads etc.) vem de uma API separada, em outro repositório:

- **Repo:** `GorilaRise-API` (Node.js + Fastify 5 + Prisma 6 + MySQL)
- **Local (neste servidor):** `/opt/gorilaRise-api`
- **Porta:** `3333`, exposta apenas em `127.0.0.1` (nunca diretamente para fora)

Configure `VITE_API_URL` (ver acima) para apontar para essa API. Instruções completas de instalação, variáveis de ambiente e deploy da API estão no README do próprio repositório dela.

## API

O cliente HTTP está em `src/lib/api.ts` e consome a URL definida em `VITE_API_URL`:

- **Dev:** `http://localhost:3333`
- **Produção:** `https://evo.adtecnologia.com.br/api` (nginx faz proxy reverso para a API local — ver seção Deploy)

## Deploy

O build é servido via nginx a partir de `/opt/gorilaRise/dist`. Para redeploy:

```bash
npm run build
```

Nginx não serve só arquivos estáticos — ele também faz proxy para o backend e trata cache do PWA. Config de referência (`/etc/nginx/sites-enabled/gorila-rise`):

```nginx
server {
    server_name evo.adtecnologia.com.br;
    root /opt/gorilaRise/dist;
    index index.html;
    client_max_body_size 10m;

    # Uploads e API são servidos pelo backend (porta 3333, ver seção Backend)
    location ^~ /uploads/ {
        proxy_pass http://127.0.0.1:3333/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:3333/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri /index.html;
    }

    # Service worker nunca pode ser cacheado (PWA precisa checar updates a cada load)
    location ~* (sw\.js|registerSW\.js|workbox-.*\.js)$ {
        expires off;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # Manifest do PWA precisa do MIME type correto
    location ~* \.webmanifest$ {
        default_type application/manifest+json;
        add_header Cache-Control "no-cache";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/evo.adtecnologia.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/evo.adtecnologia.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    listen 80;
    server_name evo.adtecnologia.com.br;
    return 301 https://$host$request_uri;
}
```

SSL via Certbot (Let's Encrypt). O app é uma PWA (`vite-plugin-pwa`) — o service worker faz cache de assets estáticos e das respostas de `/api/*`, por isso as regras de no-cache acima para os arquivos do próprio service worker são obrigatórias (senão o navegador nunca baixa a versão nova dele).
