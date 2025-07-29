-- Script para verificar dados na tabela desafios_diarios
-- Use este script para debugar problemas no dashboard

-- 1. Verificar se existem dados na tabela desafios_diarios
SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    MIN(data) as primeira_data,
    MAX(data) as ultima_data,
    AVG(pontuacao_total) as pontuacao_media
FROM public.desafios_diarios;

-- 2. Ver dados por usuário
SELECT 
    p.nome,
    dd.user_id,
    COUNT(dd.data) as dias_registrados,
    SUM(dd.pontuacao_total) as pontos_totais,
    AVG(dd.pontuacao_total) as media_pontos,
    MIN(dd.data) as primeiro_dia,
    MAX(dd.data) as ultimo_dia
FROM public.desafios_diarios dd
JOIN public.profiles p ON dd.user_id = p.user_id
GROUP BY dd.user_id, p.nome
ORDER BY pontos_totais DESC;

-- 3. Ver dados detalhados dos últimos 10 registros
SELECT 
    p.nome,
    dd.data,
    dd.pontuacao_total,
    dd.hidratacao,
    dd.sono_qualidade,
    dd.atividade_fisica,
    dd.seguiu_dieta,
    dd.registro_visual,
    dd.created_at
FROM public.desafios_diarios dd
JOIN public.profiles p ON dd.user_id = p.user_id
ORDER BY dd.created_at DESC
LIMIT 10;

-- 4. Verificar dados para um usuário específico (substitua o UUID)
-- SELECT 
--     data,
--     pontuacao_total,
--     hidratacao,
--     sono_qualidade,
--     atividade_fisica,
--     seguiu_dieta,
--     registro_visual
-- FROM public.desafios_diarios 
-- WHERE user_id = 'SEU-USER-ID-AQUI'
-- ORDER BY data ASC;

-- 5. Verificar se há dados na tabela pontuacoes também
SELECT 
    p.nome,
    pt.pontuacao_total,
    pt.dias_consecutivos,
    pt.ultima_data_participacao
FROM public.pontuacoes pt
JOIN public.profiles p ON pt.user_id = p.user_id
WHERE pt.pontuacao_total > 0
ORDER BY pt.pontuacao_total DESC;

-- 6. Comparar dados entre as duas tabelas
SELECT 
    p.nome,
    COALESCE(pt.pontuacao_total, 0) as pontos_tabela_pontuacoes,
    COALESCE(SUM(dd.pontuacao_total), 0) as pontos_desafios_diarios,
    COUNT(dd.data) as dias_com_desafios
FROM public.profiles p
LEFT JOIN public.pontuacoes pt ON p.user_id = pt.user_id
LEFT JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
WHERE pt.pontuacao_total > 0 OR dd.pontuacao_total > 0
GROUP BY p.user_id, p.nome, pt.pontuacao_total
ORDER BY pontos_tabela_pontuacoes DESC;