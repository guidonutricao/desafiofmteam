-- Script simples para debugar o dashboard de progresso
-- Execute este script para ver rapidamente onde estão os dados

-- 1. Verificar dados na tabela desafios_diarios
SELECT 
    'DESAFIOS_DIARIOS' as fonte,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    SUM(pontuacao_total) as pontos_totais
FROM public.desafios_diarios
WHERE pontuacao_total > 0;

-- 2. Verificar dados na tabela pontuacoes
SELECT 
    'PONTUACOES' as fonte,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    SUM(pontuacao_total) as pontos_totais
FROM public.pontuacoes
WHERE pontuacao_total > 0;

-- 3. Usuários com dados em desafios_diarios
SELECT 
    'Usuários com dados detalhados' as tipo,
    p.nome,
    p.user_id,
    COUNT(dd.data) as dias_registrados,
    SUM(dd.pontuacao_total) as total_pontos
FROM public.profiles p
JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
WHERE dd.pontuacao_total > 0
GROUP BY p.user_id, p.nome
ORDER BY total_pontos DESC;

-- 4. Usuários com dados apenas em pontuacoes
SELECT 
    'Usuários só com pontuação total' as tipo,
    p.nome,
    p.user_id,
    pt.pontuacao_total as total_pontos
FROM public.profiles p
JOIN public.pontuacoes pt ON p.user_id = pt.user_id
LEFT JOIN public.desafios_diarios dd ON p.user_id = dd.user_id AND dd.pontuacao_total > 0
WHERE pt.pontuacao_total > 0 
AND dd.user_id IS NULL
ORDER BY pt.pontuacao_total DESC;

-- 5. Últimos registros de desafios diários
SELECT 
    p.nome,
    dd.data,
    dd.pontuacao_total,
    dd.hidratacao,
    dd.sono_qualidade,
    dd.atividade_fisica,
    dd.seguiu_dieta,
    dd.registro_visual
FROM public.desafios_diarios dd
JOIN public.profiles p ON dd.user_id = p.user_id
WHERE dd.pontuacao_total > 0
ORDER BY dd.created_at DESC
LIMIT 10;

-- 6. Para testar com um usuário específico, descomente e substitua o UUID:
/*
SELECT 
    'TESTE USUÁRIO ESPECÍFICO' as info,
    p.nome,
    p.user_id
FROM public.profiles p
WHERE p.user_id = 'SEU-USER-ID-AQUI';

SELECT 
    'Dados desafios_diarios' as fonte,
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

SELECT 
    'Dados pontuacoes' as fonte,
    pontuacao_total,
    dias_consecutivos,
    ultima_data_participacao
FROM public.pontuacoes 
WHERE user_id = 'SEU-USER-ID-AQUI';
*/