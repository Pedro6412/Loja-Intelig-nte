# Loja Inteligente

Sistema completo de gestao de vendas para lojas com controle de produtos, categorias, usuarios, estoque, vendas e modulo de IA para sugestoes de produtos.

## Participantes

- Pedro Henrique
- Lauro Marques
- Guilherme Araujo
- Marcos Eduardo

## Funcionalidades

- Autenticacao com JWT e perfis (admin, gerente, vendedor)
- Gestao de usuarios, categorias, fornecedores e produtos
- Controle de estoque (entrada, saida, ajuste e historico)
- Sistema de vendas com itens, descontos e formas de pagamento
- Dashboard com indicadores de vendas e estoque
- Sugestoes IA com integracao real (OpenAI) e fallback simulado

## Stack

### Backend
- Node.js + Express
- Prisma ORM
- MySQL
- JWT
- bcryptjs

### Frontend
- React + Vite
- TailwindCSS
- React Router
- Axios

## Estrutura

```text
backend/
  src/
    config/
    controllers/
    middleware/
    repositories/
    routes/
    services/
    utils/
  prisma/
frontend/
  src/
    components/
    contexts/
    pages/
    services/
```

## Instalacao

### 1) Banco de dados

Crie o banco:

```sql
CREATE DATABASE loja_inteligente;
```

### 2) Backend

```bash
cd backend
npm install
```

Configure `backend/.env`:

```env
DATABASE_URL="mysql://root:senha@127.0.0.1:3306/loja_inteligente"
JWT_SECRET="sua_chave_secreta"
JWT_EXPIRES_IN="7d"
PORT=3001
CORS_ORIGIN="http://localhost:5173"

AI_SUGGESTIONS_ENABLED=true
OPENAI_API_KEY="sua_chave_openai"
OPENAI_MODEL="gpt-4o-mini"
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_TIMEOUT_MS=20000
```

Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Seed opcional:

```bash
npm run seed
```

Executar backend:

```bash
npm run dev
```

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

## Credenciais padrao (seed)

- Admin: `admin@loja.com` / `123456`
- Gerente: `gerente@loja.com` / `123456`
- Vendedor: `vendedor@loja.com` / `123456`

## Endpoints principais

### Sugestoes IA
- `GET /api/sugestoes-ia`
- `GET /api/sugestoes-ia/status/:status`
- `GET /api/sugestoes-ia/:id`
- `POST /api/sugestoes-ia`
- `POST /api/sugestoes-ia/gerar` (IA real com fallback simulado)
- `PUT /api/sugestoes-ia/:id/aprovar`
- `PUT /api/sugestoes-ia/:id/rejeitar`

## Modulo IA

O endpoint `POST /api/sugestoes-ia/gerar` tenta gerar sugestoes com OpenAI.

Comportamento:
1. Se `AI_SUGGESTIONS_ENABLED=true` e `OPENAI_API_KEY` estiver configurada, usa IA real.
2. Se houver falha na API externa, aplica fallback automatico para sugestoes simuladas.
3. Todas as sugestoes sao salvas na mesma tabela `sugestoes_ia` (sem mudanca de schema).

## Notas

- O sistema usa soft delete em parte dos cadastros.
- Todas as rotas protegidas exigem JWT.
- O estoque e atualizado automaticamente ao concluir venda.
