-- Simple Migration: Add peso_inicial field to profiles table
-- This is a simplified version that should work reliably

-- Add peso_inicial column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN peso_inicial NUMERIC(5,2);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.peso_inicial IS 'Initial weight recorded during user registration (in kg)';

-- Create index for queries
CREATE INDEX idx_profiles_peso_inicial ON public.profiles(peso_inicial);

-- Update handle_new_user function to support peso_inicial
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