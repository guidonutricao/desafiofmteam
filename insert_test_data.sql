-- Script para inserir dados de teste no ranking
-- Execute este script no Supabase SQL Editor ou via CLI

-- Primeiro, vamos inserir alguns perfis de teste (se não existirem)
INSERT INTO public.profiles (user_id, nome, foto_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Guido', 'https://via.placeholder.com/150/0000FF/FFFFFF?text=G'),
  ('22222222-2222-2222-2222-222222222222', 'Teste', 'https://via.placeholder.com/150/FF0000/FFFFFF?text=T'),
  ('33333333-3333-3333-3333-333333333333', 'Fabricio Moura', 'https://via.placeholder.com/150/00FF00/FFFFFF?text=FM')
ON CONFLICT (user_id) DO UPDATE SET
  nome = EXCLUDED.nome,
  foto_url = EXCLUDED.foto_url;

-- Agora vamos inserir/atualizar as pontuações
INSERT INTO public.pontuacoes (user_id, pontuacao_total, dias_consecutivos, ultima_data_participacao) VALUES
  ('11111111-1111-1111-1111-111111111111', 1400, 8, CURRENT_DATE),
  ('22222222-2222-2222-2222-222222222222', 650, 5, CURRENT_DATE - INTERVAL '1 day'),
  ('33333333-3333-3333-3333-333333333333', 500, 3, CURRENT_DATE - INTERVAL '2 days')
ON CONFLICT (user_id) DO UPDATE SET
  pontuacao_total = EXCLUDED.pontuacao_total,
  dias_consecutivos = EXCLUDED.dias_consecutivos,
  ultima_data_participacao = EXCLUDED.ultima_data_participacao;

-- Verificar se os dados foram inseridos
SELECT 
  p.nome,
  pt.pontuacao_total,
  pt.dias_consecutivos,
  pt.ultima_data_participacao
FROM public.pontuacoes pt
JOIN public.profiles p ON pt.user_id = p.user_id
ORDER BY pt.pontuacao_total DESC;