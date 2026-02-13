# Lidera Learning Platform

Plataforma de area de membros (Learning SaaS) multi-tenant desenvolvida para a Lidera Consultoria.

## Tecnologias

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Deploy**: Vercel

## Arquitetura Multi-tenant

```
Adventure Labs (Admin)
├── Lidera Consultoria (Tenant)
│   ├── Conteúdos
│   │   ├── Modulos
│   │   │   └── Aulas (videos, tarefas, recursos)
│   └── Alunos (Students)
```

### Cadastro e convites

- Usuarios podem criar conta em `/auth/signup` (email ou Google)
- Tenant/Admin adiciona aluno por email: se já tem conta, matricula; se não, cria convite
- Ao se cadastrar, convites pendentes são processados automaticamente
- Usuário vê apenas os conteúdos para os quais foi matriculado

### Roles

- **Admin**: Acesso total a todas organizações (admin@adventurelabs.com.br)
- **Tenant**: Gerencia conteúdos e alunos da sua organizacao (lidera@adventurelabs.com.br, contato@somoslidera.com.br)
- **Student**: Acessa conteúdos matriculados, faz anotacoes, completa tarefas

## Rotas

### Area do Aluno
- `/learn` - Dashboard de boas-vindas
- `/learn/courses` - Lista de conteúdos matriculados
- `/learn/courses/[id]` - Modulos do conteúdo
- `/learn/lessons/[id]` - Aula com video, tarefas e anotacoes
- `/learn/settings` - Preferencias do usuario

### Painel do Tenant
- `/manage` - Dashboard de gestao
- `/manage/courses` - Gerenciar conteúdos
- `/manage/courses/new` - Criar novo conteúdo
- `/manage/courses/[id]` - Editar conteúdo e modulos
- `/manage/students` - Gerenciar alunos e matriculas

### Painel Admin
- `/admin` - Dashboard administrativo
- `/admin/orgs` - Gerenciar organizacoes
- `/admin/users` - Gerenciar usuarios

## Setup

### Pre-requisitos

- Node.js 18+
- Conta no Supabase
- Conta na Vercel

### Instalacao

```bash
# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Rodar em desenvolvimento
npm run dev
```

### Configurar Supabase

**Opção A – Local com Supabase CLI (recomendado para dev)**

```bash
supabase start
supabase db reset   # aplica migrations + seed em um comando
```

O seed já inclui organizações, 4 conteúdos com módulos/aulas, e **usuários de teste** (senha de todos: `password123`):

| Email | Senha | Papel |
|-------|--------|--------|
| admin@adventurelabs.com.br | password123 | Admin (criar orgs, ver tudo) |
| lidera@adventurelabs.com.br | password123 | Tenant (criar conteúdos da Lidera) |
| aluno@adventurelabs.com.br | password123 | Aluno (conteúdos matriculados) |

**Opção B – Supabase remoto (Dashboard)**

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em SQL Editor e execute as migrations em ordem:
   - `supabase/migrations/20260211000001_initial_schema.sql`
   - `supabase/migrations/20260211000002_rls_policies.sql`
   - `supabase/migrations/20260212000001_pending_invites.sql`
3. Execute o seed: `supabase/seed.sql`
4. Usuários de teste são criados pelo seed; use os logins acima (em projeto remoto você pode precisar ajustar Auth ou criar usuários manualmente e depois atualizar `profiles`).

### Configurar Autenticacao

1. No Supabase Dashboard, va em Authentication > Providers
2. Habilite Google OAuth:
   - Adicione Client ID e Secret do Google Cloud Console
   - Configure a URL de callback: `https://ftctmseyrqhckutpfdeq.supabase.co/auth/v1/callback`

### View Switcher (Admin)

Usuarios com role `admin` veem um dropdown "Ver como..." no sidebar para alternar a visualizacao:
- **Ver como Admin**: Navegacao completa (Learn + Manage + Admin)
- **Ver como Tenant**: Learn + Manage
- **Ver como Estudante**: Apenas Learn

A preferencia e salva em localStorage.

### Configurar Usuarios Iniciais

Se você **não** usou o seed (que já cria admin/tenant/aluno), faça o primeiro cadastro em `/auth/signup` e depois no SQL Editor ou use `supabase/setup-admin.sql` (edite o email). **Ordem no app:** só admin cria organizações; para criar conteúdo é preciso ter uma organização (tenant/admin com org_id, ou admin escolhendo a org na tela Novo conteúdo); alunos são adicionados depois por e-mail. Não é necessário cadastrar aluno para cadastrar conteúdo.

```sql
-- Configurar admin
UPDATE profiles 
SET role = 'admin', org_id = '00000000-0000-0000-0000-000000000001' 
WHERE email = 'admin@adventurelabs.com.br';

-- Configurar tenant Lidera
UPDATE profiles 
SET role = 'tenant', org_id = '00000000-0000-0000-0000-000000000002' 
WHERE email IN ('lidera@adventurelabs.com.br', 'contato@somoslidera.com.br');
```

Para **criar conteúdo**: não é preciso cadastrar aluno antes; é preciso ter organização e ser tenant ou admin (admin sem org pode escolher a org na tela "Novo conteúdo").

### Deploy na Vercel

```bash
# Conectar ao Vercel
npx vercel login
npx vercel link

# Deploy
npx vercel --prod
```

Configure as variaveis de ambiente na Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Comandos

```bash
npm run dev        # Desenvolvimento
npm run build      # Build de producao
npm run lint       # Verificar lint
npm run typecheck  # Verificar tipos
npm run validate   # Lint + Types + Build
```

## Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/           # Rotas de autenticacao
│   ├── (dashboard)/      # Area logada
│   │   ├── admin/        # Painel admin
│   │   ├── manage/       # Painel tenant
│   │   └── learn/        # Area do aluno
│   └── api/              # API routes
├── components/
│   ├── ui/               # Componentes base
│   └── layouts/          # Layouts
├── lib/
│   ├── supabase/         # Cliente Supabase
│   ├── hooks/            # Custom hooks
│   └── utils.ts          # Utilitarios
└── types/                # TypeScript types
```

## Licenca

Propriedade de Adventure Labs.
