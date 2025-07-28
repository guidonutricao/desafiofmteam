-- Complete fix for user challenge dates
-- This migration ensures all existing users have correct challenge_start_date

-- Step 1: Ensure challenge columns exist (from previous migration)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS challenge_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS challenge_completed_at TIMESTAMPTZ;

-- Step 2: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_challenge_start ON public.profiles(challenge_start_date);
CREATE INDEX IF NOT EXISTS idx_profiles_challenge_completed ON public.profiles(challenge_completed_at);

-- Step 3: Fix existing users - set challenge_start_date to created_at
UPDATE public.profiles 
SET 
  challenge_start_date = created_at,
  updated_at = NOW()
WHERE 
  challenge_start_date IS NULL 
  OR DATE(challenge_start_date) != DATE(created_at);

-- Step 4: Update handle_new_user function to set challenge_start_date automatically
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

-- Step 5: Create all the challenge functions (from previous migrations)
-- Function to check if user can complete tasks
CREATE OR REPLACE FUNCTION public.can_user_complete_tasks(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_start_date TIMESTAMPTZ;
  current_brasilia_date DATE;
  start_brasilia_date DATE;
BEGIN
  -- Get user's challenge start date
  SELECT challenge_start_date INTO user_start_date
  FROM public.profiles
  WHERE user_id = user_id_param;
  
  -- If user hasn't started challenge yet, they can't complete tasks
  IF user_start_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Convert dates to Brasília timezone and get date part only
  current_brasilia_date := (NOW() AT TIME ZONE 'America/Sao_Paulo')::DATE;
  start_brasilia_date := (user_start_date AT TIME ZONE 'America/Sao_Paulo')::DATE;
  
  -- User can complete tasks only if current date is after start date
  -- (challenge starts the day after registration)
  RETURN current_brasilia_date > start_brasilia_date;
END;
$$;

-- Function to get challenge status for a user
CREATE OR REPLACE FUNCTION public.get_user_challenge_status(user_id_param UUID)
RETURNS TABLE (
  has_started BOOLEAN,
  can_complete_tasks BOOLEAN,
  challenge_start_date TIMESTAMPTZ,
  challenge_completed_at TIMESTAMPTZ,
  days_since_start INTEGER,
  current_challenge_day INTEGER,
  is_completed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_start_date TIMESTAMPTZ;
  user_completed_date TIMESTAMPTZ;
  current_brasilia_date DATE;
  start_brasilia_date DATE;
  days_diff INTEGER;
BEGIN
  -- Get user's challenge dates
  SELECT p.challenge_start_date, p.challenge_completed_at 
  INTO user_start_date, user_completed_date
  FROM public.profiles p
  WHERE p.user_id = user_id_param;
  
  -- If user hasn't started challenge yet (should not happen with new logic)
  IF user_start_date IS NULL THEN
    RETURN QUERY SELECT 
      FALSE as has_started,
      FALSE as can_complete_tasks,
      NULL::TIMESTAMPTZ as challenge_start_date,
      NULL::TIMESTAMPTZ as challenge_completed_at,
      0 as days_since_start,
      0 as current_challenge_day,
      FALSE as is_completed;
    RETURN;
  END IF;
  
  -- Convert to Brasília timezone for date calculations
  current_brasilia_date := (NOW() AT TIME ZONE 'America/Sao_Paulo')::DATE;
  start_brasilia_date := (user_start_date AT TIME ZONE 'America/Sao_Paulo')::DATE;
  
  -- Calculate days since start (0 = same day as registration, 1 = first challenge day, etc.)
  days_diff := current_brasilia_date - start_brasilia_date;
  
  RETURN QUERY SELECT 
    TRUE as has_started,
    days_diff > 0 as can_complete_tasks, -- Can complete tasks only after registration day
    user_start_date as challenge_start_date,
    user_completed_date as challenge_completed_at,
    days_diff as days_since_start,
    CASE 
      WHEN days_diff <= 0 THEN 0 -- Not started yet (same day as registration)
      WHEN days_diff > 7 THEN 8 -- Completed (more than 7 days)
      ELSE days_diff -- Active challenge (days 1-7)
    END as current_challenge_day,
    user_completed_date IS NOT NULL OR days_diff > 7 as is_completed;
END;
$$;

-- Step 6: Create trigger function to prevent premature task completion
CREATE OR REPLACE FUNCTION public.check_challenge_start_before_task_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user can complete tasks
  IF NOT public.can_user_complete_tasks(NEW.user_id) THEN
    RAISE EXCEPTION 'CHALLENGE_NOT_STARTED' USING 
      DETAIL = 'User cannot complete tasks yet. Challenge starts the day after registration.',
      HINT = 'Wait until tomorrow to start completing tasks.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 7: Add triggers to prevent premature task completion
DROP TRIGGER IF EXISTS check_challenge_start_before_insert ON public.desafios_diarios;
CREATE TRIGGER check_challenge_start_before_insert
  BEFORE INSERT ON public.desafios_diarios
  FOR EACH ROW 
  WHEN (
    NEW.hidratacao = TRUE OR 
    NEW.sono_qualidade = TRUE OR 
    NEW.atividade_fisica = TRUE OR 
    NEW.seguiu_dieta = TRUE OR 
    NEW.registro_visual = TRUE OR 
    NEW.evitar_ultraprocessados = TRUE OR 
    NEW.dormir_sem_celular = TRUE OR 
    NEW.organizar_refeicoes = TRUE
  )
  EXECUTE FUNCTION public.check_challenge_start_before_task_completion();

DROP TRIGGER IF EXISTS check_challenge_start_before_update ON public.desafios_diarios;
CREATE TRIGGER check_challenge_start_before_update
  BEFORE UPDATE ON public.desafios_diarios
  FOR EACH ROW 
  WHEN (
    (NEW.hidratacao = TRUE AND OLD.hidratacao = FALSE) OR
    (NEW.sono_qualidade = TRUE AND OLD.sono_qualidade = FALSE) OR
    (NEW.atividade_fisica = TRUE AND OLD.atividade_fisica = FALSE) OR
    (NEW.seguiu_dieta = TRUE AND OLD.seguiu_dieta = FALSE) OR
    (NEW.registro_visual = TRUE AND OLD.registro_visual = FALSE) OR
    (NEW.evitar_ultraprocessados = TRUE AND OLD.evitar_ultraprocessados = FALSE) OR
    (NEW.dormir_sem_celular = TRUE AND OLD.dormir_sem_celular = FALSE) OR
    (NEW.organizar_refeicoes = TRUE AND OLD.organizar_refeicoes = FALSE)
  )
  EXECUTE FUNCTION public.check_challenge_start_before_task_completion();

-- Step 8: Grant permissions
GRANT EXECUTE ON FUNCTION public.can_user_complete_tasks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_challenge_status(UUID) TO authenticated;

-- Step 9: Verification query
SELECT 
  'VERIFICATION' as check_type,
  COUNT(*) as total_users,
  COUNT(CASE WHEN challenge_start_date IS NOT NULL THEN 1 END) as users_with_challenge_date,
  COUNT(CASE WHEN DATE(challenge_start_date) = DATE(created_at) THEN 1 END) as users_with_correct_dates,
  COUNT(CASE WHEN challenge_start_date IS NULL THEN 1 END) as users_without_challenge_date
FROM public.profiles;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Complete fix applied successfully!';
  RAISE NOTICE '✅ All existing users now have challenge_start_date = created_at';
  RAISE NOTICE '✅ New users will automatically get challenge_start_date set';
  RAISE NOTICE '✅ Start Challenge button will only appear for truly new users';
  RAISE NOTICE '✅ Challenge delay logic is active (tasks start day after registration)';
END $$;