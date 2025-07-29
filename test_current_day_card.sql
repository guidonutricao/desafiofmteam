-- Script para testar o card "Dia Atual" do dashboard
-- Este script cria cenários diferentes para demonstrar como o card funciona

-- Cenário 1: Usuário no dia 3 do desafio
DO $$
DECLARE
    test_user_id_1 UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Usuário que iniciou há 2 dias (está no dia 3)
    INSERT INTO public.profiles (
        user_id, 
        nome, 
        challenge_start_date,
        created_at, 
        updated_at
    )
    VALUES (
        test_user_id_1, 
        'Usuário Dia 3', 
        CURRENT_DATE - INTERVAL '2 days', -- Iniciou há 2 dias = dia 3
        NOW() - INTERVAL '2 days', 
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        challenge_start_date = CURRENT_DATE - INTERVAL '2 days',
        nome = 'Usuário Dia 3',
        updated_at = NOW();
    
    -- Adicionar pontuação para teste
    INSERT INTO public.pontuacoes (user_id, pontuacao_total, dias_consecutivos, ultima_data_participacao)
    VALUES (test_user_id_1, 1500, 2, CURRENT_DATE - INTERVAL '1 day')
    ON CONFLICT (user_id) 
    DO UPDATE SET
        pontuacao_total = 1500,
        dias_consecutivos = 2,
        ultima_data_participacao = CURRENT_DATE - INTERVAL '1 day';
    
    RAISE NOTICE 'Usuário 1 criado: Dia 3 do desafio';
END $$;

-- Cenário 2: Usuário no dia 7 (último dia)
DO $$
DECLARE
    test_user_id_2 UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
    -- Usuário que iniciou há 6 dias (está no dia 7)
    INSERT INTO public.profiles (
        user_id, 
        nome, 
        challenge_start_date,
        created_at, 
        updated_at
    )
    VALUES (
        test_user_id_2, 
        'Usuário Dia 7', 
        CURRENT_DATE - INTERVAL '6 days', -- Iniciou há 6 dias = dia 7
        NOW() - INTERVAL '6 days', 
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        challenge_start_date = CURRENT_DATE - INTERVAL '6 days',
        nome = 'Usuário Dia 7',
        updated_at = NOW();
    
    -- Adicionar pontuação para teste
    INSERT INTO public.pontuacoes (user_id, pontuacao_total, dias_consecutivos, ultima_data_participacao)
    VALUES (test_user_id_2, 4200, 6, CURRENT_DATE - INTERVAL '1 day')
    ON CONFLICT (user_id) 
    DO UPDATE SET
        pontuacao_total = 4200,
        dias_consecutivos = 6,
        ultima_data_participacao = CURRENT_DATE - INTERVAL '1 day';
    
    RAISE NOTICE 'Usuário 2 criado: Dia 7 do desafio';
END $$;

-- Cenário 3: Usuário que completou o desafio
DO $$
DECLARE
    test_user_id_3 UUID := '33333333-3333-3333-3333-333333333333';
BEGIN
    -- Usuário que iniciou há 8 dias (desafio completo)
    INSERT INTO public.profiles (
        user_id, 
        nome, 
        challenge_start_date,
        challenge_completed_at,
        created_at, 
        updated_at
    )
    VALUES (
        test_user_id_3, 
        'Usuário Completo', 
        CURRENT_DATE - INTERVAL '8 days', -- Iniciou há 8 dias = completou
        CURRENT_DATE - INTERVAL '1 day', -- Completou ontem
        NOW() - INTERVAL '8 days', 
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        challenge_start_date = CURRENT_DATE - INTERVAL '8 days',
        challenge_completed_at = CURRENT_DATE - INTERVAL '1 day',
        nome = 'Usuário Completo',
        updated_at = NOW();
    
    -- Adicionar pontuação para teste
    INSERT INTO public.pontuacoes (user_id, pontuacao_total, dias_consecutivos, ultima_data_participacao)
    VALUES (test_user_id_3, 4900, 7, CURRENT_DATE - INTERVAL '1 day')
    ON CONFLICT (user_id) 
    DO UPDATE SET
        pontuacao_total = 4900,
        dias_consecutivos = 7,
        ultima_data_participacao = CURRENT_DATE - INTERVAL '1 day';
    
    RAISE NOTICE 'Usuário 3 criado: Desafio completo';
END $$;

-- Verificar os cenários criados
SELECT 
    'CENÁRIOS DE TESTE CRIADOS:' as titulo,
    p.nome,
    p.challenge_start_date,
    p.challenge_completed_at,
    CASE 
        WHEN p.challenge_completed_at IS NOT NULL THEN 'Desafio Completo (Dia 8+)'
        ELSE CONCAT('Dia ', (CURRENT_DATE - p.challenge_start_date::date + 1))
    END as dia_atual_calculado,
    COALESCE(pt.pontuacao_total, 0) as pontos_totais
FROM public.profiles p
LEFT JOIN public.pontuacoes pt ON p.user_id = pt.user_id
WHERE p.user_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
)
ORDER BY p.challenge_start_date;

-- Mostrar como cada card aparecerá
SELECT 
    'COMO OS CARDS APARECERÃO:' as titulo,
    'Usuário Dia 3: Card azul com ícone calendário e "Dia 3"' as cenario_1,
    'Usuário Dia 7: Card azul com ícone calendário e "Dia 7"' as cenario_2,
    'Usuário Completo: Card verde com ícone troféu e "7/7"' as cenario_3;

-- Instruções para testar
SELECT 
    'COMO TESTAR:' as titulo,
    '1. Execute este script para criar os cenários' as passo_1,
    '2. Faça login com qualquer usuário' as passo_2,
    '3. Navegue para a página de Perfil' as passo_3,
    '4. Veja o card do meio mostrando o dia atual' as passo_4,
    '5. O card muda de cor e ícone quando completo' as passo_5;

-- Fórmula de cálculo do dia atual
SELECT 
    'FÓRMULA DE CÁLCULO:' as titulo,
    'Dia Atual = (Data Hoje - Data Início) + 1' as formula,
    'Se > 7 dias: Mostra "Desafio Completo"' as regra_1,
    'Se <= 7 dias: Mostra "Dia X"' as regra_2;