-- Script simplificado para testar o mapeamento de datas no dashboard
-- Execute este script para verificar se os dados estão sendo associados corretamente

-- 1. Verificar usuários com challenge_start_date
SELECT 
    p.nome,
    p.user_id,
    p.challenge_start_date,
    CASE 
        WHEN p.challenge_start_date IS NOT NULL THEN
            CURRENT_DATE - p.challenge_start_date::date + 1
        ELSE 
            NULL
    END as dias_desde_inicio
FROM public.profiles p
WHERE p.challenge_start_date IS NOT NULL
ORDER BY p.challenge_start_date DESC
LIMIT 10;

-- 2. Mapeamento de dados por usuário (versão simplificada)
SELECT 
    p.nome,
    p.user_id,
    p.challenge_start_date,
    dd.data as data_registro,
    dd.pontuacao_total,
    CASE 
        WHEN p.challenge_start_date IS NOT NULL AND dd.data IS NOT NULL THEN
            dd.data::date - p.challenge_start_date::date + 1
        ELSE 
            NULL
    END as dia_calculado_desafio
FROM public.profiles p
JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
WHERE p.challenge_start_date IS NOT NULL
ORDER BY p.user_id, dd.data
LIMIT 20;

-- 3. Verificar se há dados inconsistentes
SELECT 
    p.nome,
    p.user_id,
    COUNT(dd.data) as total_registros,
    MIN(dd.data) as primeiro_registro,
    MAX(dd.data) as ultimo_registro,
    p.challenge_start_date,
    CASE 
        WHEN p.challenge_start_date IS NOT NULL THEN
            MIN(dd.data::date - p.challenge_start_date::date + 1)
        ELSE NULL
    END as primeiro_dia_calculado,
    CASE 
        WHEN p.challenge_start_date IS NOT NULL THEN
            MAX(dd.data::date - p.challenge_start_date::date + 1)
        ELSE NULL
    END as ultimo_dia_calculado
FROM public.profiles p
LEFT JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
WHERE p.challenge_start_date IS NOT NULL
AND dd.data IS NOT NULL
GROUP BY p.user_id, p.nome, p.challenge_start_date
ORDER BY total_registros DESC;

-- 4. Usuários sem challenge_start_date que têm dados
SELECT 
    p.nome,
    p.user_id,
    p.created_at,
    COUNT(dd.data) as registros_desafio,
    COALESCE(pt.pontuacao_total, 0) as pontos_totais,
    'Precisa de migração' as status
FROM public.profiles p
LEFT JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
LEFT JOIN public.pontuacoes pt ON p.user_id = pt.user_id
WHERE p.challenge_start_date IS NULL
AND (dd.data IS NOT NULL OR pt.pontuacao_total > 0)
GROUP BY p.user_id, p.nome, p.created_at, pt.pontuacao_total
ORDER BY pontos_totais DESC
LIMIT 10;

-- 5. Exemplo prático: dados de um usuário específico
-- Descomente e substitua o user_id para testar um usuário específico
/*
SELECT 
    'Dados do usuário' as secao,
    p.nome,
    p.challenge_start_date,
    dd.data,
    dd.pontuacao_total,
    dd.data::date - p.challenge_start_date::date + 1 as dia_desafio_calculado,
    CASE 
        WHEN dd.data::date - p.challenge_start_date::date + 1 BETWEEN 1 AND 7 THEN 'OK'
        WHEN dd.data::date - p.challenge_start_date::date + 1 < 1 THEN 'Antes do início'
        WHEN dd.data::date - p.challenge_start_date::date + 1 > 7 THEN 'Após o fim'
        ELSE 'Erro'
    END as status_dia
FROM public.profiles p
JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
WHERE p.user_id = 'SUBSTITUA-PELO-USER-ID'
ORDER BY dd.data;
*/