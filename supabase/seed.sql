-- Seed data for Lidera Learning Platform
-- Run this after migrations to populate with example data

-- ============================================
-- ORGANIZATIONS
-- ============================================
INSERT INTO organizations (id, name, slug, domain, logo_url, settings) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Adventure Labs', 'adventurelabs', 'adventurelabs.com.br', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200', '{"theme": "blue"}'),
    ('00000000-0000-0000-0000-000000000002', 'Lidera Consultoria', 'lidera', 'lidera.adventurelabs.com.br', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200', '{"theme": "purple"}'),
    ('00000000-0000-0000-0000-000000000003', 'Acme Corp', 'acme', 'acme.com.br', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200', '{"theme": "green"}'),
    ('00000000-0000-0000-0000-000000000004', 'Tech Institute', 'techinstitute', 'techinstitute.com.br', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200', '{"theme": "orange"}'),
    ('00000000-0000-0000-0000-000000000005', 'Inovacao e Talentos', 'inovacao', 'inovacao.com.br', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200', '{"theme": "indigo"}')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, logo_url = EXCLUDED.logo_url, settings = EXCLUDED.settings;

-- ============================================
-- NOTE: Profiles are created automatically when users sign up via Supabase Auth
-- The profiles below are examples - in production, create users via Supabase dashboard
-- or auth API, then update their profiles
-- ============================================

-- To set up users manually after they sign up:
-- UPDATE profiles SET role = 'admin', org_id = '00000000-0000-0000-0000-000000000001' WHERE email = 'admin@adventurelabs.com.br';
-- UPDATE profiles SET role = 'tenant', org_id = '00000000-0000-0000-0000-000000000002' WHERE email = 'lidera@adventurelabs.com.br';
-- UPDATE profiles SET role = 'tenant', org_id = '00000000-0000-0000-0000-000000000002' WHERE email = 'contato@somoslidera.com.br';

-- ============================================
-- COURSES (for Lidera organization)
-- ============================================
INSERT INTO courses (id, org_id, title, description, thumbnail_url, published) VALUES
    ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000002', 
     'Lideranca Transformadora', 
     'Desenvolva habilidades de lideranca para transformar equipes e resultados. Aprenda tecnicas comprovadas de gestao de pessoas.',
     'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
     true),
    ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002', 
     'Gestao de Tempo e Produtividade', 
     'Tecnicas avancadas para otimizar seu tempo e aumentar sua produtividade pessoal e profissional.',
     'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
     true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MODULES for Lideranca Transformadora
-- ============================================
INSERT INTO modules (id, course_id, title, description, order_index) VALUES
    ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001',
     'Fundamentos da Lideranca', 'Conceitos basicos e essenciais para todo lider', 0),
    ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001',
     'Comunicacao e Influencia', 'Como se comunicar de forma efetiva e influenciar positivamente', 1),
    ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000001',
     'Gestao de Equipes', 'Tecnicas para liderar e desenvolver equipes de alto desempenho', 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- LESSONS for Module 1: Fundamentos da Lideranca
-- ============================================
INSERT INTO lessons (id, module_id, title, description, youtube_url, content, order_index, duration_minutes) VALUES
    ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001',
     'O que e Lideranca?', 'Definicao e conceitos fundamentais de lideranca',
     'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
     '<p>Nesta aula, vamos explorar o conceito de lideranca e suas diversas definicoes ao longo da historia.</p><p>Lideranca nao e apenas um cargo ou posicao - e uma habilidade que pode ser desenvolvida por qualquer pessoa.</p>',
     0, 15),
    ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000001',
     'Estilos de Lideranca', 'Conheca os diferentes estilos e quando usar cada um',
     'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
     '<p>Existem diversos estilos de lideranca, cada um adequado para diferentes situacoes e contextos.</p><ul><li>Lideranca Autocratica</li><li>Lideranca Democratica</li><li>Lideranca Liberal</li><li>Lideranca Situacional</li></ul>',
     1, 20),
    ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000001',
     'Lider vs Chefe', 'Entenda a diferenca entre ser lider e ser chefe',
     'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
     '<p>Muitas pessoas confundem lideranca com chefia. Nesta aula, vamos esclarecer as diferencas fundamentais.</p>',
     2, 12)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- LESSONS for Module 2: Comunicacao e Influencia
-- ============================================
INSERT INTO lessons (id, module_id, title, description, youtube_url, content, order_index, duration_minutes) VALUES
    ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000002',
     'Comunicacao Assertiva', 'Aprenda a se comunicar de forma clara e assertiva',
     'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
     '<p>A comunicacao assertiva e uma das habilidades mais importantes para um lider.</p>',
     0, 18),
    ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000002',
     'Escuta Ativa', 'A importancia de ouvir para liderar melhor',
     'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
     '<p>Lideres eficazes sao, antes de tudo, otimos ouvintes.</p>',
     1, 14)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TASKS for Lessons
-- ============================================
INSERT INTO tasks (id, lesson_id, title, description, order_index) VALUES
    ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0003-000000000001',
     'Reflita sobre suas experiencias', 'Escreva sobre 3 lideres que te inspiraram e por que', 0),
    ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0003-000000000001',
     'Defina sua visao de lideranca', 'Escreva em uma frase sua definicao pessoal de lideranca', 1),
    ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0003-000000000002',
     'Identifique seu estilo', 'Faca o teste de estilos de lideranca no material complementar', 0),
    ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0003-000000000002',
     'Analise situacoes', 'Descreva uma situacao onde cada estilo seria mais adequado', 1),
    ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0003-000000000004',
     'Pratique comunicacao assertiva', 'Grave um video de 2 minutos se apresentando de forma assertiva', 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RESOURCES for Lessons
-- ============================================
INSERT INTO resources (id, lesson_id, title, type, url, order_index) VALUES
    ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0003-000000000001',
     'E-book: Introducao a Lideranca', 'document', 'https://example.com/ebook-lideranca.pdf', 0),
    ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0003-000000000001',
     'Artigo: Harvard Business Review', 'link', 'https://hbr.org/topic/leadership', 1),
    ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0003-000000000002',
     'Template: Analise de Estilos', 'file', 'https://example.com/template-estilos.xlsx', 0),
    ('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0003-000000000002',
     'Teste de Lideranca Online', 'link', 'https://example.com/teste-lideranca', 1),
    ('00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0003-000000000004',
     'Guia de Comunicacao Assertiva', 'document', 'https://example.com/guia-comunicacao.pdf', 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MODULES for Gestao de Tempo (Course 2)
-- ============================================
INSERT INTO modules (id, course_id, title, description, order_index) VALUES
    ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000002',
     'Fundamentos do Tempo', 'Entenda como funciona sua relacao com o tempo', 0),
    ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000002',
     'Tecnicas de Produtividade', 'Ferramentas e metodos para ser mais produtivo', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, module_id, title, description, youtube_url, order_index, duration_minutes) VALUES
    ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000004',
     'Onde vai seu tempo?', 'Analise de como voce gasta seu tempo atualmente',
     'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 10),
    ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0002-000000000005',
     'Metodo Pomodoro', 'Aprenda a tecnica Pomodoro para foco e produtividade',
     'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 15)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MAIS CURSOS (Lidera): Comunicacao Efetiva, Inteligencia Emocional
-- ============================================
INSERT INTO courses (id, org_id, title, description, thumbnail_url, published) VALUES
    ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000002',
     'Comunicacao Efetiva',
     'Domine a arte da comunicacao interpersonal. Tecnicas de oratoria, negociacao e persuasao para o dia a dia profissional.',
     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
     true),
    ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000002',
     'Inteligencia Emocional',
     'Desenvolva sua IE para liderar melhor, resolver conflitos e construir relacoes mais saudaveis no trabalho.',
     'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
     true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO modules (id, course_id, title, description, order_index) VALUES
    ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000003',
     'Fundamentos da Comunicacao', 'A base de toda comunicacao eficaz', 0),
    ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000003',
     'Oratoria e Apresentacoes', 'Fale em publico com confianca', 1),
    ('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000004',
     'Autoconhecimento', 'Conheca suas emocoes e gatilhos', 0),
    ('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0001-000000000004',
     'Gestao Emocional', 'Regule suas emocoes em situacoes de pressao', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, module_id, title, description, youtube_url, content, order_index, duration_minutes) VALUES
    ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000006',
     'Os 4 Pilares da Comunicacao', 'Entenda os elementos essenciais',
     'https://www.youtube.com/watch?v=2zqlFsBirhM',
     '<p>A comunicacao eficaz repousa sobre quatro pilares: emissor, receptor, mensagem e canal.</p>', 0, 12),
    ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0002-000000000006',
     'Barreiras da Comunicacao', 'O que impede a mensagem de chegar',
     'https://www.youtube.com/watch?v=2zqlFsBirhM',
     '<p>Conheca as principais barreiras e como supera-las no ambiente corporativo.</p>', 1, 15),
    ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0002-000000000007',
     'Estrutura de uma Apresentacao', 'Abertura, desenvolvimento e fechamento',
     'https://www.youtube.com/watch?v=2zqlFsBirhM',
     '<p>Aprenda a estruturar suas apresentacoes para prender a atencao do publico.</p>', 0, 18),
    ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0002-000000000008',
     'O que e Inteligencia Emocional?', 'Conceitos e importancia',
     'https://www.youtube.com/watch?v=2zqlFsBirhM',
     '<p>Daniel Goleman popularizou o termo. Entenda o que realmente significa.</p>', 0, 14),
    ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0002-000000000008',
     'Autoavaliacao: Seus Pontos Fortes', 'Identifique suas competencias emocionais',
     'https://www.youtube.com/watch?v=2zqlFsBirhM',
     '<p>Faca uma autoavaliacao honesta e descubra onde voce pode melhorar.</p>', 1, 10),
    ('00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0002-000000000009',
     'Tecnicas de Respiração e Grounding', 'Acione o sistema parasimpatico',
     'https://www.youtube.com/watch?v=2zqlFsBirhM',
     '<p>Quando a emocao dispara, use tecnicas simples para se acalmar.</p>', 0, 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, lesson_id, title, description, order_index) VALUES
    ('00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0003-000000000008',
     'Analise uma conversa recente', 'Descreva os 4 pilares em uma conversa que teve esta semana', 0),
    ('00000000-0000-0000-0004-000000000007', '00000000-0000-0000-0003-000000000010',
     'Roteiro de apresentacao', 'Crie um roteiro de 5 min para uma apresentacao sobre voce', 0),
    ('00000000-0000-0000-0004-000000000008', '00000000-0000-0000-0003-000000000011',
     'Diario emocional', 'Anote por 3 dias quais emocoes mais apareceram e quando', 0),
    ('00000000-0000-0000-0004-000000000009', '00000000-0000-0000-0003-000000000013',
     'Pratica de respiracao', 'Faça 5 min de respiracao diafragmatica por 3 dias consecutivos', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO resources (id, lesson_id, title, type, url, order_index) VALUES
    ('00000000-0000-0000-0005-000000000006', '00000000-0000-0000-0003-000000000008',
     'Checklist de Comunicacao', 'document', 'https://example.com/checklist-comunicacao.pdf', 0),
    ('00000000-0000-0000-0005-000000000007', '00000000-0000-0000-0003-000000000010',
     'Template de Slides', 'file', 'https://example.com/template-apresentacao.pptx', 0),
    ('00000000-0000-0000-0005-000000000008', '00000000-0000-0000-0003-000000000011',
     'Artigo: IE no Trabalho', 'link', 'https://hbr.org/topic/emotional-intelligence', 0),
    ('00000000-0000-0000-0005-000000000009', '00000000-0000-0000-0003-000000000013',
     'Audio: Meditacao Guiada 5min', 'link', 'https://example.com/meditacao-5min', 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- USUARIOS, PROFILES E MATRICULAS (apenas projeto único / local)
-- No setup DUAL (Auth no Adventure + DB no Lidera), usuários vivem no Adventure
-- e os profiles são criados no Lidera no primeiro login (ensureLideraProfile).
-- NÃO inserir auth.users, profiles nem enrollments no projeto Lidera.
-- Para teste: crie usuários no dashboard do Adventure; após o primeiro login
-- o profile será criado no Lidera; use o painel do tenant para matricular.
-- Para local com supabase start (um projeto), use seed-extended.sql após este.
-- ============================================
