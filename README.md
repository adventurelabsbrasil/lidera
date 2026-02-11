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
│   ├── Cursos
│   │   ├── Modulos
│   │   │   └── Aulas (videos, tarefas, recursos)
│   └── Alunos (Students)
```

### Roles

- **Admin**: Acesso total a todas organizacoes (admin@adventurelabs.com.br)
- **Tenant**: Gerencia cursos e alunos da sua organizacao (lidera@adventurelabs.com.br, contato@somoslidera.com.br)
- **Student**: Acessa cursos matriculados, faz anotacoes, completa tarefas

## Rotas

### Area do Aluno
- `/learn` - Dashboard de boas-vindas
- `/learn/courses` - Lista de cursos matriculados
- `/learn/courses/[id]` - Modulos do curso
- `/learn/lessons/[id]` - Aula com video, tarefas e anotacoes
- `/learn/settings` - Preferencias do usuario

### Painel do Tenant
- `/manage` - Dashboard de gestao
- `/manage/courses` - Gerenciar cursos
- `/manage/courses/new` - Criar novo curso
- `/manage/courses/[id]` - Editar curso e modulos
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

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Va em SQL Editor
3. Execute os arquivos de migration em ordem:
   - `supabase/migrations/20260211000001_initial_schema.sql`
   - `supabase/migrations/20260211000002_rls_policies.sql`
4. Execute o arquivo de seed:
   - `supabase/seed.sql`

### Configurar Autenticacao

1. No Supabase Dashboard, va em Authentication > Providers
2. Habilite Google OAuth:
   - Adicione Client ID e Secret do Google Cloud Console
   - Configure a URL de callback: `https://ftctmseyrqhckutpfdeq.supabase.co/auth/v1/callback`

### Configurar Usuarios Iniciais

Apos os usuarios se cadastrarem via Google ou Email, execute no SQL Editor:

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
