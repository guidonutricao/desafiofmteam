-- Fix Migration: Correct peso_inicial implementation without peso_atual
-- This migration fixes the handle_new_user function to work only with peso_inicial

-- Update handle_new_user function to only use peso_inicial (without peso_atual)
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