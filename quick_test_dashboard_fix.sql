-- Script rápido para testar a correção do dashboard
-- Execute este para verificar se a correção está funcionando

-- 1. Listar usuários com dados e suas datas de início
SELECT 
    p.nome,
    p.user_id,
    p.challenge_start_date,
    COUNT(dd.data) as dias_registrados,
    SUM(dd.pontuacao_total) as pontos_totais
FROM public.profiles p
LEFT JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
WHERE (p.challenge_start_date IS NOT NULL OR dd.data IS NOT NULL)
GROUP BY p.user_id, p.nome, p.challenge_start_date
ORDER BY pontos_totais DESC NULLS LAST
LIMIT 10;

-- 2. Exemplo de mapeamento correto para o primeiro usuário com dados
WITH primeiro_usuario AS (
    SELECT p.user_id, p.challenge_start_date
    FROM public.profiles p
    JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
    WHERE p.challenge_start_date IS NOT NULL
    LIMIT 1
)
SELECT 
    dd.data as data_registro,
    dd.pontuacao_total,
    CASE 
        WHEN pu.challenge_start_date IS NOT NULL THEN
            dd.data::date - pu.challenge_start_date::date + 1
        ELSE 
            NULL
    END as dia_desafio_correto,
    CASE 
        WHEN dd.data::date - pu.challenge_start_date::date + 1 BETWEEN 1 AND 7 THEN '✅ Correto'
        WHEN dd.data::date - pu.challenge_start_date::date + 1 < 1 THEN '❌ Antes do início'
        WHEN dd.data::date - pu.challenge_start_date::date + 1 > 7 THEN '❌ Após o fim'
        ELSE '❓ Indefinido'
    END as status
FROM primeiro_usuario pu
JOIN public.desafios_diarios dd ON pu.user_id = dd.user_id
ORDER BY dd.data;

-- 3. Verificar se há usuários que precisam de migração
SELECT 
    COUNT(*) as usuarios_sem_challenge_start_date,
    COUNT(CASE WHEN dd.data IS NOT NULL THEN 1 END) as com_dados_desafio,
    COUNT(CASE WHEN pt.pontuacao_total > 0 THEN 1 END) as com_pontuacao
FROM public.profiles p
LEFT JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
LEFT JOIN public.pontuacoes pt ON p.user_id = pt.user_id
WHERE p.challenge_start_date IS NULL;