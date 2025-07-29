-- Script para testar o dashboard com usuário real existente
-- Substitua o user_id pelo ID de um usuário real do sistema

-- PASSO 1: Encontrar um usuário real para testar
SELECT 
    'USUÁRIOS DISPONÍVEIS PARA TESTE:' as titulo,
    p.user_id,
    p.nome,
    CASE 
        WHEN pt.pontuacao_total > 0 THEN 'Tem pontuação'
        ELSE 'Sem pontuação'
    END as status_pontuacao,
    COALESCE(pt.pontuacao_total, 0) as pontos_atuais
FROM public.profiles p
LEFT JOIN public.pontuacoes pt ON p.user_id = pt.user_id
ORDER BY p.created_at DESC
LIMIT 5;

-- PASSO 2: Copie um user_id da query acima e substitua abaixo
-- Exemplo de como adicionar pontuação para teste:

/*
-- DESCOMENTE E SUBSTITUA O USER_ID ABAIXO:

DO $$
DECLARE
    real_user_id UUID := 'COLE-SEU-USER-ID-AQUI'; -- SUBSTITUA PELO ID REAL
BEGIN
    -- Verificar se o usuário existe
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = real_user_id) THEN
        RAISE EXCEPTION 'Usuário não encontrado. Use um user_id válido da query acima.';
    END IF;
    
    -- Adicionar/atualizar pontuação para teste
    INSERT INTO public.pontuacoes (user_id, pontuacao_total, dias_consecutivos, ultima_data_participacao)
    VALUES (real_user_id, 2800, 5, CURRENT_DATE)
    ON CONFLICT (user_id) 
    DO UPDATE SET
        pontuacao_total = GREATEST(EXCLUDED.pontuacao_total, pontuacoes.pontuacao_total),
        dias_consecutivos = GREATEST(EXCLUDED.dias_consecutivos, pontuacoes.dias_consecutivos),
        ultima_data_participacao = CURRENT_DATE;
    
    RAISE NOTICE 'Pontuação de teste adicionada para o usuário %', real_user_id;
END $$;

-- Verificar o resultado
SELECT 
    'RESULTADO DO TESTE:' as info,
    p.nome,
    pt.pontuacao_total,
    pt.dias_consecutivos
FROM public.profiles p
JOIN public.pontuacoes pt ON p.user_id = pt.user_id
WHERE p.user_id = 'COLE-SEU-USER-ID-AQUI'; -- MESMO ID USADO ACIMA
*/

-- PASSO 3: Instruções para testar o dashboard
SELECT 
    'COMO TESTAR O DASHBOARD:' as titulo,
    '1. Execute a query do PASSO 1 para ver usuários disponíveis' as instrucao_1,
    '2. Copie um user_id e substitua no código comentado acima' as instrucao_2,
    '3. Descomente e execute o bloco DO $$ para adicionar pontuação' as instrucao_3,
    '4. Faça login com esse usuário no sistema' as instrucao_4,
    '5. Navegue para a página de Perfil' as instrucao_5,
    '6. Veja o dashboard com distribuição simulada de 7 dias' as instrucao_6;

-- ALTERNATIVA: Se você souber seu próprio user_id, pode usar diretamente
SELECT 
    'ALTERNATIVA - ENCONTRAR SEU PRÓPRIO USER_ID:' as titulo,
    'Faça login no sistema e execute no console do navegador:' as instrucao,
    'console.log("Meu user_id:", user?.id)' as codigo_javascript;