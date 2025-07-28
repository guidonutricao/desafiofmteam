-- Update handle_new_user function to automatically set challenge_start_date
-- This ensures new users have challenge_start_date set to their creation time

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Insert profile with challenge_start_date set to current time
  INSERT INTO public.profiles (
    user_id, 
    nome, 
    peso_inicial,
    challenge_start_date,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'peso_inicial' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'peso_inicial')::NUMERIC(5,2)
      ELSE NULL
    END,
    NOW(), -- Set challenge_start_date to current time
    NOW(),
    NOW()
  );
  
  -- Insert pontuacoes record
  INSERT INTO public.pontuacoes (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  
  RETURN NEW;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates profile and pontuacoes records for new users, with challenge_start_date set to creation time';

-- Test the function (optional - uncomment to test)
-- SELECT public.handle_new_user();

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'handle_new_user function updated successfully!';
  RAISE NOTICE 'New users will now have challenge_start_date set automatically.';
END $$;