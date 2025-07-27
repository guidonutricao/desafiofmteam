-- EXECUTE ESTE SQL NO DASHBOARD DO SUPABASE PARA CORRIGIR O PROBLEMA IMEDIATAMENTE

-- 1. Verificar se a coluna peso_inicial existe (deve retornar 1 linha)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public' 
AND column_name = 'peso_inicial';

-- 2. Se a coluna não existir, adicione-a:
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS peso_inicial NUMERIC(5,2);

-- 3. Adicionar comentário
COMMENT ON COLUMN public.profiles.peso_inicial IS 'Initial weight recorded during user registration (in kg)';

-- 4. Criar índice
CREATE INDEX IF NOT EXISTS idx_profiles_peso_inicial ON public.profiles(peso_inicial);

-- 5. Corrigir a função handle_new_user para NÃO usar peso_atual
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, peso_inicial)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'peso_inicial' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'peso_inicial')::NUMERIC(5,2)
      ELSE NULL
    END
  );
  
  INSERT INTO public.pontuacoes (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- 6. Verificar se a função foi atualizada corretamente
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- 7. Testar a estrutura da tabela profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;