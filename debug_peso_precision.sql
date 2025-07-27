-- Script para debugar problema de precisão do peso_inicial

-- 1. Verificar a estrutura da coluna peso_inicial
SELECT 
    column_name,
    data_type,
    numeric_precision,
    numeric_scale,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'peso_inicial';

-- 2. Verificar valores atuais na tabela
SELECT 
    user_id,
    nome,
    peso_inicial,
    peso_inicial::text as peso_como_texto,
    ROUND(peso_inicial, 1) as peso_arredondado_1_casa,
    ROUND(peso_inicial, 2) as peso_arredondado_2_casas
FROM public.profiles 
WHERE peso_inicial IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 3. Testar inserção de valores específicos
-- (Execute apenas se quiser testar - substitua pelo seu user_id)
/*
INSERT INTO public.profiles (user_id, nome, peso_inicial)
VALUES (
    gen_random_uuid(),
    'Teste Precisão',
    75.0
);
*/

-- 4. Verificar se há alguma função ou trigger que modifica o valor
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 5. Testar conversões de tipo
SELECT 
    75 as inteiro,
    75.0 as decimal,
    75.0::NUMERIC(5,2) as numeric_5_2,
    '75'::NUMERIC(5,2) as string_para_numeric,
    75.0::FLOAT as float_value,
    75.0::DOUBLE PRECISION as double_value;

-- 6. Verificar se há algum problema com a função handle_new_user
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';