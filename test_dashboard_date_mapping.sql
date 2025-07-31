-- Script para testar o mapeamento correto de datas no dashboard
-- Este script ajuda a verificar se os dados estão sendo associados aos dias corretos

-- 1. Verificar usuários com challenge_start_date definida
SELECT 
    p.nome,
    p.user_id,
    p.challenge_start_date,
    CASE 
        WHEN p.challenge_start_date IS NOT NULL THEN
            (CURRENT_DATE - p.challenge_start_date::date) + 1
        ELSE 
            NULL
    END as dia_atual_calculado
FROM public.profiles p
WHERE p.challenge_start_date IS NOT NULL
ORDER BY p.challenge_start_date DESC;

-- 2. Para cada usuário, mostrar como os dados deveriam ser mapeados
WITH user_challenge_data AS (
    SELECT 
        p.nome,
        p.user_id,
        p.challenge_start_date,
        dd.data as registro_data,
        dd.pontuacao_total,
        -- Calcular qual dia do desafio esta data representa
        CASE 
            WHEN p.challenge_start_date IS NOT NULL AND dd.data IS NOT NULL THEN
                (dd.data::date - p.challenge_start_date::date) + 1
            ELSE 
                NULL
        END as dia_desafio_correto
    FROM public.profiles p
    LEFT JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
    WHERE p.challenge_start_date IS NOT NULL
    ORDER BY p.user_id, dd.data
)
SELECT 
    nome,
    user_id,
    challenge_start_date,
    registro_data,
    dia_desafio_correto,
    pontuacao_total,
    CASE 
        WHEN dia_desafio_correto BETWEEN 1 AND 7 THEN 'Dia válido do desafio'
        WHEN dia_desafio_correto < 1 THEN 'Registro antes do início do desafio'
        WHEN dia_desafio_correto > 7 THEN 'Registro após o fim do desafio'
        ELSE 'Dados incompletos'
    END as status_mapeamento
FROM user_challenge_data
WHERE registro_data IS NOT NULL;

-- 3. Verificar se há registros fora do período de 7 dias
SELECT 
    p.nome,
    p.user_id,
    p.challenge_start_date,
    COUNT(dd.data) as total_registros,
    COUNT(CASE 
        WHEN (dd.data::date - p.challenge_start_date::date) + 1 BETWEEN 1 AND 7 
        THEN 1 
    END) as registros_validos,
    COUNT(CASE 
        WHEN (dd.data::date - p.challenge_start_date::date) + 1 < 1 
        THEN 1 
    END) as registros_antes_inicio,
    COUNT(CASE 
        WHEN (dd.data::date - p.challenge_start_date::date) + 1 > 7 
        THEN 1 
    END) as registros_apos_fim
FROM public.profiles p
LEFT JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
WHERE p.challenge_start_date IS NOT NULL
GROUP BY p.user_id, p.nome, p.challenge_start_date
HAVING COUNT(dd.data) > 0
ORDER BY total_registros DESC;

-- 4. Exemplo de como o dashboard deveria mapear os dados para um usuário específico
-- (Substitua o user_id pelo ID do usuário que você quer testar)
/*
WITH dashboard_mapping AS (
    SELECT 
        p.challenge_start_date,
        dd.data,
        dd.pontuacao_total,
        (dd.data::date - p.challenge_start_date::date) + 1 as dia_desafio,
        dd.hidratacao,
        dd.sono_qualidade,
        dd.atividade_fisica,
        dd.seguiu_dieta,
        dd.registro_visual
    FROM public.profiles p
    JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
    WHERE p.user_id = 'SEU-USER-ID-AQUI'
    AND p.challenge_start_date IS NOT NULL
    ORDER BY dd.data
)
SELECT 
    dia_desafio,
    data,
    pontuacao_total,
    hidratacao,
    sono_qualidade,
    atividade_fisica,
    seguiu_dieta,
    registro_visual,
    CASE 
        WHEN dia_desafio BETWEEN 1 AND 7 THEN 'Mapeamento correto'
        ELSE 'Fora do período do desafio'
    END as status
FROM dashboard_mapping;
*/

-- 5. Verificar usuários sem challenge_start_date (precisam de migração)
SELECT 
    p.nome,
    p.user_id,
    p.created_at,
    COUNT(dd.data) as registros_desafio,
    COALESCE(pt.pontuacao_total, 0) as pontos_totais
FROM public.profiles p
LEFT JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
LEFT JOIN public.pontuacoes pt ON p.user_id = pt.user_id
WHERE p.challenge_start_date IS NULL
AND (dd.data IS NOT NULL OR pt.pontuacao_total > 0)
GROUP BY p.user_id, p.nome, p.created_at, pt.pontuacao_total
ORDER BY pontos_totais DESC;