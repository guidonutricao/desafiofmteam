-- Script para inserir dados de teste do progresso do desafio
-- Este script cria dados de exemplo para demonstrar o dashboard de progresso

-- Primeiro, vamos verificar se existe um usuário de teste
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Tentar encontrar um usuário existente ou usar um ID de teste
    SELECT user_id INTO test_user_id 
    FROM public.profiles 
    WHERE nome ILIKE '%test%' OR nome ILIKE '%exemplo%'
    LIMIT 1;
    
    -- Se não encontrar, usar um ID genérico (substitua pelo seu user_id real)
    IF test_user_id IS NULL THEN
        test_user_id := '11111111-1111-1111-1111-111111111111';
    END IF;
    
    -- Inserir dados de progresso para 7 dias
    INSERT INTO public.daily_progress (
        user_id, 
        challenge_day, 
        date, 
        tasks_completed, 
        points_earned,
        created_at,
        updated_at
    ) VALUES
        -- Dia 1: 700 pontos
        (test_user_id, 1, CURRENT_DATE - INTERVAL '6 days', 
         '{"hidratacao": true, "exercicio": true, "sono": true, "dieta": false, "registro_visual": true}', 
         700, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
        
        -- Dia 2: 1400 pontos (melhor dia)
        (test_user_id, 2, CURRENT_DATE - INTERVAL '5 days', 
         '{"hidratacao": true, "exercicio": true, "sono": true, "dieta": true, "registro_visual": true, "organizar_refeicoes": true}', 
         1400, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
        
        -- Dia 3: 200 pontos (dia difícil)
        (test_user_id, 3, CURRENT_DATE - INTERVAL '4 days', 
         '{"hidratacao": true, "exercicio": false, "sono": false, "dieta": false, "registro_visual": true}', 
         200, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
        
        -- Dia 4: 900 pontos (recuperação)
        (test_user_id, 4, CURRENT_DATE - INTERVAL '3 days', 
         '{"hidratacao": true, "exercicio": true, "sono": true, "dieta": true, "registro_visual": false}', 
         900, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
        
        -- Dia 5: 1100 pontos
        (test_user_id, 5, CURRENT_DATE - INTERVAL '2 days', 
         '{"hidratacao": true, "exercicio": true, "sono": true, "dieta": true, "registro_visual": true}', 
         1100, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
        
        -- Dia 6: 800 pontos
        (test_user_id, 6, CURRENT_DATE - INTERVAL '1 day', 
         '{"hidratacao": true, "exercicio": true, "sono": false, "dieta": true, "registro_visual": true}', 
         800, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
        
        -- Dia 7: 1200 pontos (finalizando forte)
        (test_user_id, 7, CURRENT_DATE, 
         '{"hidratacao": true, "exercicio": true, "sono": true, "dieta": true, "registro_visual": true}', 
         1200, NOW(), NOW())
    
    ON CONFLICT (user_id, challenge_day) 
    DO UPDATE SET
        tasks_completed = EXCLUDED.tasks_completed,
        points_earned = EXCLUDED.points_earned,
        updated_at = NOW();
    
    -- Atualizar o challenge_start_date no perfil se necessário
    UPDATE public.profiles 
    SET challenge_start_date = CURRENT_DATE - INTERVAL '6 days'
    WHERE user_id = test_user_id 
    AND challenge_start_date IS NULL;
    
    RAISE NOTICE 'Dados de teste inseridos para o usuário: %', test_user_id;
END $$;

-- Verificar os dados inseridos
SELECT 
    dp.challenge_day,
    dp.points_earned,
    dp.date,
    dp.tasks_completed,
    p.nome
FROM public.daily_progress dp
JOIN public.profiles p ON dp.user_id = p.user_id
ORDER BY dp.challenge_day;

-- Mostrar estatísticas
SELECT 
    COUNT(*) as total_days,
    SUM(points_earned) as total_points,
    AVG(points_earned)::INTEGER as average_points,
    MIN(points_earned) as min_points,
    MAX(points_earned) as max_points
FROM public.daily_progress dp
JOIN public.profiles p ON dp.user_id = p.user_id
WHERE p.nome ILIKE '%test%' OR p.nome ILIKE '%exemplo%' OR dp.user_id = '11111111-1111-1111-1111-111111111111';