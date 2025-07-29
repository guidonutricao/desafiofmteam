-- Script para contornar os triggers e testar o dashboard
-- Este script desabilita temporariamente os triggers para inserir dados de teste

-- IMPORTANTE: Execute este script como administrador/superuser

DO $$
DECLARE
    test_user_id UUID := '11111111-1111-1111-1111-111111111111';
    trigger_exists BOOLEAN;
BEGIN
    -- Verificar se o trigger existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'check_challenge_start_before_insert'
    ) INTO trigger_exists;
    
    -- Criar usuário de teste com data de início do desafio no passado
    INSERT INTO public.profiles (
        user_id, 
        nome, 
        challenge_start_date,
        created_at, 
        updated_at
    )
    VALUES (
        test_user_id, 
        'Usuário Teste Dashboard', 
        CURRENT_DATE - INTERVAL '8 days', -- Iniciou há 8 dias
        NOW() - INTERVAL '8 days', 
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        challenge_start_date = CURRENT_DATE - INTERVAL '8 days',
        nome = 'Usuário Teste Dashboard',
        updated_at = NOW();
    
    -- Desabilitar triggers temporariamente se existirem
    IF trigger_exists THEN
        EXECUTE 'ALTER TABLE public.desafios_diarios DISABLE TRIGGER check_challenge_start_before_insert';
        EXECUTE 'ALTER TABLE public.desafios_diarios DISABLE TRIGGER check_challenge_start_before_update';
        RAISE NOTICE 'Triggers desabilitados temporariamente';
    END IF;
    
    -- Inserir dados de teste (dias 1, 3, 5, 7 com dados, dias 2, 4, 6 vazios)
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
         true, true, false, true, true, 500, 
         NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
        
        -- Dia 3: 800 pontos (dia 2 ficará vazio)
        (test_user_id, CURRENT_DATE - INTERVAL '4 days', 
         true, true, true, true, false, 800, 
         NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
        
        -- Dia 5: 1200 pontos (dia 4 ficará vazio)
        (test_user_id, CURRENT_DATE - INTERVAL '2 days', 
         true, true, true, true, true, 1200, 
         NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
        
        -- Dia 7: 900 pontos (dia 6 ficará vazio)
        (test_user_id, CURRENT_DATE, 
         true, false, true, true, true, 900, 
         NOW(), NOW())
    
    ON CONFLICT (user_id, data) 
    DO UPDATE SET
        hidratacao = EXCLUDED.hidratacao,
        sono_qualidade = EXCLUDED.sono_qualidade,
        atividade_fisica = EXCLUDED.atividade_fisica,
        seguiu_dieta = EXCLUDED.seguiu_dieta,
        registro_visual = EXCLUDED.registro_visual,
        pontuacao_total = EXCLUDED.pontuacao_total,
        updated_at = NOW();
    
    -- Reabilitar triggers
    IF trigger_exists THEN
        EXECUTE 'ALTER TABLE public.desafios_diarios ENABLE TRIGGER check_challenge_start_before_insert';
        EXECUTE 'ALTER TABLE public.desafios_diarios ENABLE TRIGGER check_challenge_start_before_update';
        RAISE NOTICE 'Triggers reabilitados';
    END IF;
    
    -- Atualizar tabela de pontuações
    INSERT INTO public.pontuacoes (user_id, pontuacao_total, dias_consecutivos, ultima_data_participacao)
    VALUES (test_user_id, 3400, 4, CURRENT_DATE)
    ON CONFLICT (user_id) 
    DO UPDATE SET
        pontuacao_total = 3400,
        dias_consecutivos = 4,
        ultima_data_participacao = CURRENT_DATE;
    
    RAISE NOTICE 'Dados de teste inseridos com sucesso!';
    RAISE NOTICE 'User ID de teste: %', test_user_id;
    RAISE NOTICE 'Total de pontos: 3400 (distribuídos em 4 dias)';
    
EXCEPTION
    WHEN OTHERS THEN
        -- Garantir que os triggers sejam reabilitados mesmo em caso de erro
        IF trigger_exists THEN
            EXECUTE 'ALTER TABLE public.desafios_diarios ENABLE TRIGGER check_challenge_start_before_insert';
            EXECUTE 'ALTER TABLE public.desafios_diarios ENABLE TRIGGER check_challenge_start_before_update';
        END IF;
        RAISE;
END $$;

-- Verificar os dados inseridos
SELECT 
    'DADOS INSERIDOS:' as titulo,
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

-- Mostrar como o dashboard interpretará
SELECT 
    'DASHBOARD MOSTRARÁ:' as titulo,
    'Dia 1: 500 pontos' as dia_1,
    'Dia 2: 0 pontos (vazio)' as dia_2,
    'Dia 3: 800 pontos' as dia_3,
    'Dia 4: 0 pontos (vazio)' as dia_4,
    'Dia 5: 1200 pontos' as dia_5,
    'Dia 6: 0 pontos (vazio)' as dia_6,
    'Dia 7: 900 pontos' as dia_7;

-- Estatísticas
SELECT 
    'ESTATÍSTICAS:' as titulo,
    SUM(pontuacao_total) as total_pontos,
    COUNT(*) as dias_com_dados,
    '4/7 dias completados' as progresso,
    ROUND(AVG(pontuacao_total)) as media_dos_dias_ativos
FROM public.desafios_diarios 
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Instruções finais
SELECT 
    'COMO TESTAR:' as titulo,
    '1. Faça login com qualquer usuário' as passo_1,
    '2. Navegue para a página de Perfil' as passo_2,
    '3. Veja o dashboard com 7 dias (4 com dados, 3 vazios)' as passo_3,
    '4. Passe o mouse sobre os dias para ver detalhes' as passo_4,
    '5. Observe as estatísticas: 3400 pontos, 4/7 dias' as passo_5;