-- Script simples para testar o dashboard usando a tabela pontuacoes
-- Este script evita os triggers de validação

DO $$
DECLARE
    test_user_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Garantir que o usuário existe na tabela profiles
    INSERT INTO public.profiles (user_id, nome, created_at, updated_at)
    VALUES (test_user_id, 'Usuário Teste Dashboard', NOW(), NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        nome = 'Usuário Teste Dashboard',
        updated_at = NOW();
    
    -- Inserir pontuação total (o dashboard criará distribuição simulada de 7 dias)
    INSERT INTO public.pontuacoes (user_id, pontuacao_total, dias_consecutivos, ultima_data_participacao)
    VALUES (test_user_id, 3400, 4, CURRENT_DATE)
    ON CONFLICT (user_id) 
    DO UPDATE SET
        pontuacao_total = 3400,
        dias_consecutivos = 4,
        ultima_data_participacao = CURRENT_DATE;
    
    RAISE NOTICE 'Dados de teste inseridos na tabela pontuacoes';
    RAISE NOTICE 'O dashboard criará uma distribuição simulada de 7 dias com 3400 pontos totais';
END $$;

-- Verificar os dados inseridos
SELECT 
    'Dados na tabela pontuacoes:' as info,
    p.nome,
    pt.pontuacao_total,
    pt.dias_consecutivos,
    pt.ultima_data_participacao
FROM public.pontuacoes pt
JOIN public.profiles p ON pt.user_id = p.user_id
WHERE pt.user_id = '11111111-1111-1111-1111-111111111111';

-- Mostrar como o dashboard distribuirá os pontos
SELECT 
    'Dashboard distribuirá aproximadamente:' as info,
    generate_series(1, 7) as dia,
    CASE 
        WHEN generate_series(1, 7) = 1 THEN '~485 pontos'
        WHEN generate_series(1, 7) = 2 THEN '~485 pontos'
        WHEN generate_series(1, 7) = 3 THEN '~485 pontos'
        WHEN generate_series(1, 7) = 4 THEN '~485 pontos'
        WHEN generate_series(1, 7) = 5 THEN '~485 pontos'
        WHEN generate_series(1, 7) = 6 THEN '~485 pontos'
        WHEN generate_series(1, 7) = 7 THEN '~490 pontos (resto)'
    END as pontuacao_simulada;

-- Instruções para testar
SELECT 
    'INSTRUÇÕES PARA TESTAR:' as titulo,
    '1. Execute este script' as passo_1,
    '2. Navegue para a página de Perfil' as passo_2,
    '3. Veja o dashboard com 7 dias e distribuição simulada' as passo_3,
    '4. Abra DevTools (F12) para ver os logs de debug' as passo_4;