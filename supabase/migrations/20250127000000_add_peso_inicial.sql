-- Migration: Add peso_inicial field to profiles table
-- This migration adds the peso_inicial column to track user's initial weight

-- Step 1: Add peso_inicial column to profiles table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'peso_inicial'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN peso_inicial NUMERIC(5,2);
    END IF;
END $$;

-- Step 2: Add comment for documentation
COMMENT ON COLUMN public.profiles.peso_inicial IS 'Initial weight recorded during user registration (in kg)';

-- Step 3: Create index for potential queries filtering by initial weight
CREATE INDEX IF NOT EXISTS idx_profiles_peso_inicial ON public.profiles(peso_inicial);

-- Step 4: Update the handle_new_user function to include peso_inicial
-- This function is called automatically when a new user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, peso_inicial, peso_atual)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'peso_inicial' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'peso_inicial')::NUMERIC(5,2)
      ELSE NULL
    END,
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