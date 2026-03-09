# 🐰 Livia's Archive

Um app fofo para criação de livros e histórias, feito com carinho para uso pessoal. Funciona na web e no celular (Android), sincronizando tudo entre os dispositivos.

## ✨ Funcionalidades

### 📚 Biblioteca
- Dashboard com todos os livros
- Capa com cor personalizável
- Título, gênero e sinopse
- Status do livro (rascunho, em andamento, concluído)
- Data de criação e última edição

### 📝 Editor
- Editor de texto rico (negrito, itálico, títulos, listas, citações...)
- Salvamento automático (a cada 2 segundos de inatividade)
- Contagem de palavras e caracteres
- Modo foco — tela limpa, sem distrações
- Histórico de versões (salvar snapshots e restaurar)

### 🗂️ Organização de Capítulos
- Criar, renomear e deletar capítulos
- Status por capítulo (rascunho, revisão, finalizado)
- Notas por capítulo

### 📤 Exportação
- Exportar livro completo em HTML (para PDF)
- Exportar capítulo individual

### ⚙️ Configurações
- Tema claro / escuro
- Fonte e tamanho do texto
- Preferências do modo foco

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend Web** | Next.js + TipTap + Tailwind CSS |
| **Mobile** | Expo (React Native) |
| **Backend** | Node.js + Fastify + Prisma |
| **Banco de dados** | PostgreSQL |
| **Autenticação** | Supabase Auth |
| **Hosting** | Vercel (web) + Railway/Render (API) |

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Conta no [Supabase](https://supabase.com) (grátis)

### 1. Clonar e instalar

```bash
git clone <repo>
cd livias-archive
npm install
```

### 2. Configurar variáveis de ambiente

**Backend** (apps/api/.env):
```bash
cp apps/api/.env.example apps/api/.env
# Edite com suas credenciais
```

**Frontend** (apps/web/.env.local):
```bash
cp apps/web/.env.example apps/web/.env.local
# Edite com suas credenciais
```

### 3. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **Settings > API** e copie:
   - Project URL → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (apenas no backend)
3. Em **Authentication > Settings**, ative Email/Password

### 4. Configurar banco de dados

```bash
# Rodar migrations
npm run db:push

# Ou para development com migrations
npm run db:migrate
```

### 5. Rodar

```bash
# Terminal 1 - Backend
npm run dev:api

# Terminal 2 - Frontend Web
npm run dev:web
```

O backend roda em `http://localhost:3333` e o frontend em `http://localhost:3000`.

### Mobile (Expo)

```bash
cd apps/mobile
npx expo start
```

---

## 📁 Estrutura do Projeto

```
livias-archive/
├── apps/
│   ├── api/              # Backend Fastify
│   │   ├── prisma/       # Schema do banco
│   │   └── src/
│   │       ├── routes/   # Rotas da API
│   │       ├── plugins/  # Auth plugin
│   │       └── lib/      # Prisma + Supabase
│   ├── web/              # Frontend Next.js
│   │   └── src/
│   │       ├── app/      # Páginas (App Router)
│   │       ├── components/
│   │       ├── hooks/
│   │       └── lib/
│   └── mobile/           # App Expo
│       └── src/
│           ├── screens/
│           ├── hooks/
│           ├── lib/
│           └── navigation/
└── packages/
    └── shared/           # Tipos e utils compartilhados
```

---

## 🎨 Tema

O app usa uma paleta de cores pastel fofa com bichinhos:
- 🐰 Coelho como mascote principal
- 🌸 Cores: rosa, lavanda, menta, pêssego, mel
- Emojis de animaizinhos espalhados pela interface
- Animações suaves de flutuação
- Bordas arredondadas e sombras suaves

---

## 📝 API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/books` | Listar livros |
| GET | `/api/books/:id` | Detalhes do livro |
| POST | `/api/books` | Criar livro |
| PUT | `/api/books/:id` | Atualizar livro |
| DELETE | `/api/books/:id` | Deletar livro |
| GET | `/api/books/:bookId/chapters` | Listar capítulos |
| GET | `/api/chapters/:id` | Detalhes do capítulo |
| POST | `/api/chapters` | Criar capítulo |
| PUT | `/api/chapters/:id` | Atualizar capítulo |
| DELETE | `/api/chapters/:id` | Deletar capítulo |
| POST | `/api/chapters/:id/versions` | Salvar versão |
| POST | `/api/chapters/:id/versions/:vid/restore` | Restaurar versão |
| PUT | `/api/books/:bookId/chapters/reorder` | Reordenar capítulos |
| GET | `/api/books/:id/export/html` | Exportar livro HTML |
| GET | `/api/me` | Perfil do usuário |
| PUT | `/api/me/settings` | Atualizar configurações |

---

Feito com 💖 por Rodolpho
