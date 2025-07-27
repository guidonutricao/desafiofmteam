-- Fix para problema de precisão do peso_inicial

-- 1. Verificar estrutura atual da coluna
SELECT 
    column_name,
    data_type,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'peso_inicial';

-- 2. Se necessário, alterar a coluna para garantir precisão adequada
-- (Execute apenas se a precisão estiver incorreta)
-- ALTER TABLE public.profiles 
-- ALTER COLUMN peso_inicial TYPE NUMERIC(6,2);

-- 3. Função melhorada para handle_new_user com melhor tratamento de precisão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    peso_inicial_value NUMERIC(6,2);
BEGIN
    -- Processar peso_inicial com cuidado extra para precisão
    IF NEW.raw_user_meta_data->>'peso_inicial' IS NOT NULL THEN
        BEGIN
            -- Converter para NUMERIC com precisão específica
            peso_inicial_value := (NEW.raw_user_meta_data->>'peso_inicial')::NUMERIC(6,2);
        EXCEPTION
            WHEN OTHERS THEN
                -- Se houver erro na conversão, definir como NULL
                peso_inicial_value := NULL;
                RAISE WARNING 'Erro ao converter peso_inicial: %', NEW.raw_user_meta_data->>'peso_inicial';
        END;
    ELSE
        peso_inicial_value := NULL;
    END IF;

    -- Inserir perfil com peso_inicial tratado
    INSERT INTO public.profiles (user_id, nome, peso_inicial)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
        peso_inicial_value
    );
    
    -- Inserir pontuações
    INSERT INTO public.pontuacoes (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro em handle_new_user: %', SQLERRM;
END;
$$;

-- 4. Testar a função com valores específicos
-- (Descomente para testar)
/*
DO $$
DECLARE
    test_metadata JSONB;
BEGIN
    -- Simular metadata com peso 75
    test_metadata := '{"nome": "Teste", "peso_inicial": "75"}'::JSONB;
    
    RAISE NOTICE 'Testando conversão: % -> %', 
        test_metadata->>'peso_inicial',
        (test_metadata->>'peso_inicial')::NUMERIC(6,2);
END $$;
*/

-- 5. Verificar valores existentes e corrigir se necessário
SELECT 
    user_id,
    nome,
    peso_inicial,
    peso_inicial::TEXT as peso_como_texto,
    CASE 
        WHEN peso_inicial = 74.90 THEN 'Possível problema de arredondamento'
        WHEN peso_inicial = 75.00 THEN 'Valor correto'
        ELSE 'Outro valor'
    END as status
FROM public.profiles 
WHERE peso_inicial IS NOT NULL;

-- 6. Corrigir valores específicos se necessário
-- (Execute apenas se identificar valores incorretos)
/*
UPDATE public.profiles 
SET peso_inicial = 75.00 
WHERE peso_inicial = 74.90 
AND nome = 'Nome do usuário afetado';
*/