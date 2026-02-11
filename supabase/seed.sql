-- Seed data for Lidera Learning Platform
-- Run this after migrations to populate with example data

-- ============================================
-- ORGANIZATIONS
-- ============================================
INSERT INTO organizations (id, name, slug, domain, settings) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Adventure Labs', 'adventurelabs', 'adventurelabs.com.br', '{"theme": "blue"}'),
    ('00000000-0000-0000-0000-000000000002', 'Lidera Consultoria', 'lidera', 'lidera.adventurelabs.com.br', '{"theme": "purple"}');

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
     true);

-- ============================================
-- MODULES for Lideranca Transformadora
-- ============================================
INSERT INTO modules (id, course_id, title, description, order_index) VALUES
    ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001',
     'Fundamentos da Lideranca', 'Conceitos basicos e essenciais para todo lider', 0),
    ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001',
     'Comunicacao e Influencia', 'Como se comunicar de forma efetiva e influenciar positivamente', 1),
    ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000001',
     'Gestao de Equipes', 'Tecnicas para liderar e desenvolver equipes de alto desempenho', 2);

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
     2, 12);

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
     1, 14);

-- ============================================
-- TASKS for Lessons
-- ============================================
INSERT INTO tasks (id, lesson_id, title, description, order_index) VALUES
    -- Lesson 1 tasks
    ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0003-000000000001',
     'Reflita sobre suas experiencias', 'Escreva sobre 3 lideres que te inspiraram e por que', 0),
    ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0003-000000000001',
     'Defina sua visao de lideranca', 'Escreva em uma frase sua definicao pessoal de lideranca', 1),
    -- Lesson 2 tasks
    ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0003-000000000002',
     'Identifique seu estilo', 'Faca o teste de estilos de lideranca no material complementar', 0),
    ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0003-000000000002',
     'Analise situacoes', 'Descreva uma situacao onde cada estilo seria mais adequado', 1),
    -- Lesson 4 tasks
    ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0003-000000000004',
     'Pratique comunicacao assertiva', 'Grave um video de 2 minutos se apresentando de forma assertiva', 0);

-- ============================================
-- RESOURCES for Lessons
-- ============================================
INSERT INTO resources (id, lesson_id, title, type, url, order_index) VALUES
    -- Lesson 1 resources
    ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0003-000000000001',
     'E-book: Introducao a Lideranca', 'document', 'https://example.com/ebook-lideranca.pdf', 0),
    ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0003-000000000001',
     'Artigo: Harvard Business Review', 'link', 'https://hbr.org/topic/leadership', 1),
    -- Lesson 2 resources
    ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0003-000000000002',
     'Template: Analise de Estilos', 'file', 'https://example.com/template-estilos.xlsx', 0),
    ('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0003-000000000002',
     'Teste de Lideranca Online', 'link', 'https://example.com/teste-lideranca', 1),
    -- Lesson 4 resources
    ('00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0003-000000000004',
     'Guia de Comunicacao Assertiva', 'document', 'https://example.com/guia-comunicacao.pdf', 0);

-- ============================================
-- MODULES for Gestao de Tempo (Course 2)
-- ============================================
INSERT INTO modules (id, course_id, title, description, order_index) VALUES
    ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000002',
     'Fundamentos do Tempo', 'Entenda como funciona sua relacao com o tempo', 0),
    ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000002',
     'Tecnicas de Produtividade', 'Ferramentas e metodos para ser mais produtivo', 1);

INSERT INTO lessons (id, module_id, title, description, youtube_url, order_index, duration_minutes) VALUES
    ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000004',
     'Onde vai seu tempo?', 'Analise de como voce gasta seu tempo atualmente',
     'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 10),
    ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0002-000000000005',
     'Metodo Pomodoro', 'Aprenda a tecnica Pomodoro para foco e produtividade',
     'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 15);
