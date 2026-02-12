-- Seed Extended: Additional ficticious data for Lidera Learning Platform
-- Run AFTER seed.sql. Organizations and initial courses must exist.
--
-- IMPORTANT: Replace 'a87b7dc8-63dd-4d3a-8679-4743f13f585d' with your profile ID
-- if you want enrollments for a different user. Get it from: SELECT id FROM profiles;

-- ============================================
-- ADDITIONAL COURSES (Lidera org)
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

-- ============================================
-- MODULES for Comunicacao Efetiva
-- ============================================
INSERT INTO modules (id, course_id, title, description, order_index) VALUES
    ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000003',
     'Fundamentos da Comunicacao', 'A base de toda comunicacao eficaz', 0),
    ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000003',
     'Oratoria e Apresentacoes', 'Fale em publico com confianca', 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- LESSONS for Comunicacao Efetiva
-- ============================================
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
     '<p>Aprenda a estruturar suas apresentacoes para prender a atencao do publico.</p>', 0, 18)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MODULES for Inteligencia Emocional
-- ============================================
INSERT INTO modules (id, course_id, title, description, order_index) VALUES
    ('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000004',
     'Autoconhecimento', 'Conheca suas emocoes e gatilhos', 0),
    ('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0001-000000000004',
     'Gestao Emocional', 'Regule suas emocoes em situacoes de pressao', 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- LESSONS for Inteligencia Emocional
-- ============================================
INSERT INTO lessons (id, module_id, title, description, youtube_url, content, order_index, duration_minutes) VALUES
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

-- ============================================
-- TASKS for new lessons
-- ============================================
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

-- ============================================
-- RESOURCES for new lessons
-- ============================================
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
-- ENROLLMENTS
-- Add your admin user to all courses so you can see them when "Ver como Estudante"
-- Replace the user_id with your profile id from: SELECT id FROM profiles WHERE email = 'admin@adventurelabs.com.br';
-- ============================================
INSERT INTO enrollments (user_id, course_id, status) VALUES
    ('a87b7dc8-63dd-4d3a-8679-4743f13f585d', '00000000-0000-0000-0001-000000000001', 'active'),
    ('a87b7dc8-63dd-4d3a-8679-4743f13f585d', '00000000-0000-0000-0001-000000000002', 'active'),
    ('a87b7dc8-63dd-4d3a-8679-4743f13f585d', '00000000-0000-0000-0001-000000000003', 'active'),
    ('a87b7dc8-63dd-4d3a-8679-4743f13f585d', '00000000-0000-0000-0001-000000000004', 'active')
ON CONFLICT (user_id, course_id) DO NOTHING;
