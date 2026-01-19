# 🌟 Goal Board - Constelação de Metas

Sistema visual de metas pessoais estilo quadro/canvas com estrelas conectáveis.

## Stack

- **Next.js 15** + React 19
- **Tailwind CSS** 
- **Prisma ORM** + NeonDB (PostgreSQL)

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados

1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string
4. Crie o arquivo `.env`:

```bash
cp .env.example .env
```

5. Cole a connection string no `DATABASE_URL`

### 3. Rodar migrations

```bash
npx prisma db push
npx prisma generate
```

### 4. Rodar o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## Funcionalidades

- ✅ Criar metas (estrelas) com título, descrição e data
- ✅ Arrastar metas pelo quadro
- ✅ Conectar metas com linhas
- ✅ Marcar metas como concluídas
- ✅ Excluir metas e conexões
- ✅ Visual estilo constelação/Obsidian

## Estrutura

```
src/
├── app/
│   ├── api/
│   │   ├── goals/route.ts      # CRUD de metas
│   │   └── connections/route.ts # CRUD de conexões
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── GoalBoard.tsx           # Componente principal
│   ├── StarNode.tsx            # Estrela/meta draggable
│   └── ConnectionLine.tsx      # Linha de conexão
├── lib/
│   └── prisma.ts               # Cliente Prisma
└── types/
    └── index.ts                # Tipos TypeScript
```
