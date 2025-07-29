-- Script específico para debugar o dashboard de progresso
-- Execute este script para identificar onde estão os dados de pontuação

-- 1. Verificar se existem dados na tabela desafios_diarios
SELECT 
    'desafios_diarios' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos
FROM public.desafios_diarios
WHERE pontuacao_total > 0;

-- 2. Verificar se existem dados na tabela pontuacoes
SELECT 
    'pontuacoes' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos
FROM public.pontuacoes
WHERE pontuacao_total > 0;

-- 3. Listar usuários com pontuação em ambas as tabelas
SELECT 
    p.nome,
    p.user_id,
    CASE 
        WHEN COUNT(dd.user_id) > 0 THEN 'Tem dados em desafios_diarios'
        ELSE 'Não tem dados em desafios_diarios'
    END as status_desafios,
    CASE 
        WHEN pt.user_id IS NOT NULL THEN 'Tem dados em pontuacoes'
        ELSE 'Não tem dados em pontuacoes'
    END as status_pontuacoes,
    COALESCE(pt.pontuacao_total, 0) as pontos_tabela_pontuacoes,
    COALESCE(SUM(dd.pontuacao_total), 0) as pontos_desafios_diarios,
    COUNT(dd.data) as dias_com_registros
FROM public.profiles p
LEFT JOIN public.pontuacoes pt ON p.user_id = pt.user_id AND pt.pontuacao_total > 0
LEFT JOIN public.desafios_diarios dd ON p.user_id = dd.user_id AND dd.pontuacao_total > 0
WHERE pt.pontuacao_total > 0 OR dd.pontuacao_total > 0
GROUP BY p.user_id, p.nome, pt.user_id, pt.pontuacao_total
ORDER BY COALESCE(pt.pontuacao_total, 0) DESC;

-- 4. Dados detalhados dos desafios diários (últimos 20 registros)
SELECT 
    p.nome,
    dd.user_id,
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
WHERE dd.pontuacao_total > 0
ORDER BY dd.created_at DESC
LIMIT 20;

-- 5. Verificar se há usuários logados recentemente
SELECT 
    p.nome,
    p.user_id,
    p.created_at as cadastro,
    p.challenge_start_date,
    CASE 
        WHEN pt.pontuacao_total > 0 THEN pt.pontuacao_total
        ELSE 0
    END as pontos_totais
FROM public.profiles p
LEFT JOIN public.pontuacoes pt ON p.user_id = pt.user_id
ORDER BY p.created_at DESC
LIMIT 10;

-- 6. Query específica para testar o dashboard (substitua o user_id)
-- Esta é a mesma query que o dashboard usa
/*
SELECT 
    data,
    pontuacao_total,
    hidratacao,
    sono_qualidade,
    atividade_fisica,
    seguiu_dieta,
    registro_visual
FROM public.desafios_diarios 
WHERE user_id = 'SEU-USER-ID-AQUI'
ORDER BY data ASC;
*/