-- Script para corrigir dados de peso existentes que podem ter problemas de precisão

-- 1. Verificar dados atuais
SELECT 
    user_id,
    nome,
    peso_inicial,
    peso_inicial::TEXT as peso_como_texto,
    CASE 
        WHEN peso_inicial = 74.90 AND peso_inicial::TEXT LIKE '74.9%' THEN 'Possível problema - deveria ser 75.0'
        WHEN peso_inicial::TEXT LIKE '%.9%' AND peso_inicial::TEXT NOT LIKE '%.90%' THEN 'Verificar se deveria ser número inteiro'
        ELSE 'OK'
    END as status_precisao
FROM public.profiles 
WHERE peso_inicial IS NOT NULL
ORDER BY created_at DESC;

-- 2. Identificar possíveis problemas específicos
WITH problematic_weights AS (
    SELECT 
        user_id,
        nome,
        peso_inicial,
        CASE 
            WHEN peso_inicial = 74.9 THEN 75.0  -- Assumindo que 74.9 deveria ser 75.0
            WHEN peso_inicial = 69.9 THEN 70.0  -- Assumindo que 69.9 deveria ser 70.0
            WHEN peso_inicial = 79.9 THEN 80.0  -- Assumindo que 79.9 deveria ser 80.0
            -- Adicione outros casos conforme necessário
            ELSE peso_inicial
        END as peso_corrigido
    FROM public.profiles 
    WHERE peso_inicial IS NOT NULL
    AND (
        peso_inicial = 74.9 OR 
        peso_inicial = 69.9 OR 
        peso_inicial = 79.9
        -- Adicione outros valores problemáticos
    )
)
SELECT * FROM problematic_weights;

-- 3. CUIDADO: Execute apenas se tiver certeza dos valores a corrigir
-- Exemplo de correção para peso 74.9 -> 75.0
/*
UPDATE public.profiles 
SET peso_inicial = 75.0 
WHERE peso_inicial = 74.9 
AND nome = 'Nome específico do usuário';  -- Sempre especifique o usuário
*/

-- 4. Verificar se a função handle_new_user está usando a versão corrigida
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- 5. Aplicar função corrigida se necessário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    peso_inicial_value NUMERIC(6,2);
BEGIN
    -- Processar peso_inicial com precisão adequada
    IF NEW.raw_user_meta_data->>'peso_inicial' IS NOT NULL THEN
        BEGIN
            -- Converter para NUMERIC com precisão específica
            peso_inicial_value := ROUND((NEW.raw_user_meta_data->>'peso_inicial')::NUMERIC, 1);
        EXCEPTION
            WHEN OTHERS THEN
                peso_inicial_value := NULL;
                RAISE WARNING 'Erro ao converter peso_inicial: %', NEW.raw_user_meta_data->>'peso_inicial';
        END;
    ELSE
        peso_inicial_value := NULL;
    END IF;

    -- Inserir perfil
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

-- 6. Testar a função com valores específicos
DO $$
DECLARE
    test_values TEXT[] := ARRAY['75', '75.0', '74.9', '75.1'];
    test_value TEXT;
    converted_value NUMERIC;
BEGIN
    FOREACH test_value IN ARRAY test_values
    LOOP
        converted_value := ROUND(test_value::NUMERIC, 1);
        RAISE NOTICE 'Input: % -> Converted: %', test_value, converted_value;
    END LOOP;
END $$;