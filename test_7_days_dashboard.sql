-- Script para testar o dashboard com dados parciais (alguns dias sem dados)
-- Este script demonstra como o dashboard mostra todos os 7 dias

-- Limpar dados de teste anteriores (opcional)
-- DELETE FROM public.desafios_diarios WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Inserir dados apenas para alguns dias (simulando progresso parcial)
DO $$
DECLARE
    test_user_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Primeiro, garantir que o usuário existe na tabela profiles com challenge_start_date
    INSERT INTO public.profiles (user_id, nome, challenge_start_date, created_at, updated_at)
    VALUES (test_user_id, 'Usuário Teste Dashboard', CURRENT_DATE - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        challenge_start_date = CURRENT_DATE - INTERVAL '7 days',
        updated_at = NOW();
    
    -- Desabilitar temporariamente os triggers de validação
    ALTER TABLE public.desafios_diarios DISABLE TRIGGER ALL;
    
    -- Inserir dados apenas para os dias 1, 3, 5 e 7 (deixando 2, 4, 6 vazios)
    INSERT INTO public.desafios_diarios (
        user_id, 
        data, 
        hidratacao,
        sono_qualidade,
        atividade_fisica,
        seguiu_dieta,
        registro_visual,
        pontuacao_total,
        created_at,
        updated_at
    ) VALUES
        -- Dia 1: 500 pontos
        (test_user_id, CURRENT_DATE - INTERVAL '6 days', 
         true, true, false, true, true, 500, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
        
        -- Dia 3: 800 pontos (pular dia 2)
        (test_user_id, CURRENT_DATE - INTERVAL '4 days', 
         true, true, true, true, false, 800, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
        
        -- Dia 5: 1200 pontos (pular dia 4)
        (test_user_id, CURRENT_DATE - INTERVAL '2 days', 
         true, true, true, true, true, 1200, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
        
        -- Dia 7: 900 pontos (pular dia 6)
        (test_user_id, CURRENT_DATE, 
         true, false, true, true, true, 900, NOW(), NOW())
    
    ON CONFLICT (user_id, data) 
    DO UPDATE SET
        hidratacao = EXCLUDED.hidratacao,
        sono_qualidade = EXCLUDED.sono_qualidade,
        atividade_fisica = EXCLUDED.atividade_fisica,
        seguiu_dieta = EXCLUDED.seguiu_dieta,
        registro_visual = EXCLUDED.registro_visual,
        pontuacao_total = EXCLUDED.pontuacao_total,
        updated_at = NOW();
    
    -- Reabilitar os triggers
    ALTER TABLE public.desafios_diarios ENABLE TRIGGER ALL;
    
    RAISE NOTICE 'Dados de teste inseridos para demonstrar dashboard de 7 dias';
END $$;

-- Verificar os dados inseridos
SELECT 
    'Dados inseridos:' as info,
    data,
    pontuacao_total,
    hidratacao,
    sono_qualidade,
    atividade_fisica,
    seguiu_dieta,
    registro_visual
FROM public.desafios_diarios 
WHERE user_id = '11111111-1111-1111-1111-111111111111'
ORDER BY data ASC;

-- Mostrar como o dashboard interpretará os dados
SELECT 
    'Dashboard mostrará:' as info,
    generate_series(1, 7) as dia,
    CASE 
        WHEN generate_series(1, 7) = 1 THEN '500 pontos'
        WHEN generate_series(1, 7) = 2 THEN '0 pontos (dia vazio)'
        WHEN generate_series(1, 7) = 3 THEN '800 pontos'
        WHEN generate_series(1, 7) = 4 THEN '0 pontos (dia vazio)'
        WHEN generate_series(1, 7) = 5 THEN '1200 pontos'
        WHEN generate_series(1, 7) = 6 THEN '0 pontos (dia vazio)'
        WHEN generate_series(1, 7) = 7 THEN '900 pontos'
    END as pontuacao_esperada;

-- Estatísticas que o dashboard calculará
SELECT 
    'Estatísticas do dashboard:' as info,
    SUM(pontuacao_total) as total_pontos,
    COUNT(*) as dias_com_dados,
    ROUND(AVG(pontuacao_total)) as media_dos_dias_ativos
FROM public.desafios_diarios 
WHERE user_id = '11111111-1111-1111-1111-111111111111'
AND pontuacao_total > 0;