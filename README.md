# Loja Inteligente

Sistema completo de gestao de vendas para lojas com controle de produtos, categorias, clientes, usuarios, estoque, vendas e modulo de IA para sugestoes de produtos.

## Funcionalidades

- Autenticacao com JWT e perfis (admin, gerente, vendedor)
- Gestao de usuarios, categorias, fornecedores, clientes e produtos
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
DATABASE_URL="mysql://root:sua_senha@127.0.0.1:3306/loja_inteligente"
JWT_SECRET="troque_esta_chave_antes_de_usar"
JWT_EXPIRES_IN="7d"
PORT=3001
CORS_ORIGIN="http://localhost:5173"

AI_SUGGESTIONS_ENABLED=false
OPENAI_API_KEY=""
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

- Admin: `admin@example.com` / senha definida em `SEED_USER_PASSWORD`
- Gerente: `gerente@example.com` / senha definida em `SEED_USER_PASSWORD`
- Vendedor: `vendedor@example.com` / senha definida em `SEED_USER_PASSWORD`

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

O endpoint `POST /api/sugestoes-ia/gerar` tenta gerar sugestoes com OpenAI quando uma chave for configurada localmente.

Comportamento:
1. Para usar IA real, configure `AI_SUGGESTIONS_ENABLED=true` e defina `OPENAI_API_KEY` apenas no ambiente local/servidor.
2. Se houver falha na API externa, aplica fallback automatico para sugestoes simuladas.
3. Todas as sugestoes sao salvas na mesma tabela `sugestoes_ia` (sem mudanca de schema).

## Notas

- O sistema usa soft delete em parte dos cadastros.
- Todas as rotas protegidas exigem JWT.
- O estoque e atualizado automaticamente ao concluir venda.

## Seguranca antes de publicar

- Nao envie arquivos .env para o GitHub.
- Use .env.example como modelo e configure seus segredos apenas no ambiente local/servidor.
- Revogue e gere novamente qualquer chave de API que ja tenha aparecido em arquivo local ou commit.
- Os dados de seed sao ficticios e devem ser trocados antes de uso real.


