-- Complete Challenge Migration - Includes all necessary columns and functions
-- Copy and paste this entire content into Supabase SQL Editor

-- Step 1: Add challenge tracking columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS challenge_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS challenge_completed_at TIMESTAMPTZ;

-- Create indexes for performance on new profile columns
CREATE INDEX IF NOT EXISTS idx_profiles_challenge_start ON public.profiles(challenge_start_date);
CREATE INDEX IF NOT EXISTS idx_profiles_challenge_completed ON public.profiles(challenge_completed_at);

-- Create index for active challenges (users who started but haven't completed)
CREATE INDEX IF NOT EXISTS idx_profiles_challenge_active 
ON public.profiles(challenge_start_date) 
WHERE challenge_start_date IS NOT NULL 
AND challenge_completed_at IS NULL;

-- Step 2: Create daily_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  challenge_day INTEGER NOT NULL CHECK (challenge_day >= 1 AND challenge_day <= 7),
  date DATE NOT NULL,
  tasks_completed JSONB DEFAULT '{}',
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure each user can only have one record per challenge day
  UNIQUE(user_id, challenge_day)
);

-- Create indexes for daily_progress table
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_day ON public.daily_progress(user_id, challenge_day);
CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON public.daily_progress(date);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON public.daily_progress(user_id, date);

-- Enable RLS on daily_progress table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_progress' AND table_schema = 'public') THEN
    ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- RLS policies for daily_progress table
DROP POLICY IF EXISTS "Users can view their own daily progress" ON public.daily_progress;
CREATE POLICY "Users can view their own daily progress" ON public.daily_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own daily progress" ON public.daily_progress;
CREATE POLICY "Users can insert their own daily progress" ON public.daily_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own daily progress" ON public.daily_progress;
CREATE POLICY "Users can update their own daily progress" ON public.daily_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own daily progress" ON public.daily_progress;
CREATE POLICY "Users can delete their own daily progress" ON public.daily_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger to update updated_at column for daily_progress
DROP TRIGGER IF EXISTS update_daily_progress_updated_at ON public.daily_progress;
CREATE TRIGGER update_daily_progress_updated_at
  BEFORE UPDATE ON public.daily_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 3: Create the challenge delay functions

-- Function to check if user can complete tasks (must be at least 1 day after registration)
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
  
  -- If user hasn't started challenge yet
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

-- Create a trigger function to prevent task completion on desafios_diarios table
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

-- Step 4: Add triggers to desafios_diarios table to prevent premature task completion
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

-- Step 5: Update existing functions to work with the new logic

-- Update the record_daily_progress function to check if user can complete tasks
CREATE OR REPLACE FUNCTION public.record_daily_progress(
  user_id_param UUID,
  challenge_day_param INTEGER,
  tasks_completed_param JSONB,
  points_earned_param INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user can complete tasks
  IF NOT public.can_user_complete_tasks(user_id_param) THEN
    RAISE EXCEPTION 'CHALLENGE_NOT_STARTED' USING 
      DETAIL = 'User cannot complete tasks yet. Challenge starts the day after registration.',
      HINT = 'Wait until tomorrow to start completing tasks.';
  END IF;
  
  -- Insert or update daily progress
  INSERT INTO public.daily_progress (
    user_id,
    challenge_day,
    date,
    tasks_completed,
    points_earned
  )
  VALUES (
    user_id_param,
    challenge_day_param,
    CURRENT_DATE,
    tasks_completed_param,
    points_earned_param
  )
  ON CONFLICT (user_id, challenge_day)
  DO UPDATE SET
    tasks_completed = EXCLUDED.tasks_completed,
    points_earned = EXCLUDED.points_earned,
    updated_at = NOW();
END;
$$;

-- Create function to start a challenge for a user
CREATE OR REPLACE FUNCTION public.start_user_challenge(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the user's profile to set challenge start date
  UPDATE public.profiles 
  SET 
    challenge_start_date = NOW(),
    challenge_completed_at = NULL,
    updated_at = NOW()
  WHERE user_id = user_id_param;
  
  -- Verify the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found for user_id: %', user_id_param;
  END IF;
END;
$$;

-- Create function to complete a challenge for a user
CREATE OR REPLACE FUNCTION public.complete_user_challenge(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the user's profile to set challenge completion date
  UPDATE public.profiles 
  SET 
    challenge_completed_at = NOW(),
    updated_at = NOW()
  WHERE user_id = user_id_param 
    AND challenge_start_date IS NOT NULL 
    AND challenge_completed_at IS NULL;
  
  -- Verify the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active challenge found for user_id: %', user_id_param;
  END IF;
END;
$$;

-- Step 6: Create or update the ranking view
DROP VIEW IF EXISTS public.ranking_with_challenge_progress;
CREATE OR REPLACE VIEW public.ranking_with_challenge_progress AS
SELECT 
  p.user_id,
  p.nome,
  p.foto_url,
  p.challenge_start_date,
  p.challenge_completed_at,
  COALESCE(SUM(dp.points_earned), 0) as total_challenge_points,
  COUNT(dp.challenge_day) as days_completed,
  -- Include legacy points from pontuacoes table for backward compatibility
  COALESCE(pt.pontuacao_total, 0) as legacy_points,
  COALESCE(SUM(dp.points_earned), 0) + COALESCE(pt.pontuacao_total, 0) as total_points
FROM public.profiles p
LEFT JOIN public.daily_progress dp ON p.user_id = dp.user_id
LEFT JOIN public.pontuacoes pt ON p.user_id = pt.user_id
GROUP BY p.user_id, p.nome, p.foto_url, p.challenge_start_date, p.challenge_completed_at, pt.pontuacao_total
ORDER BY total_points DESC;

-- Step 7: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.can_user_complete_tasks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_challenge_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_user_challenge(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_user_challenge(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_daily_progress(UUID, INTEGER, JSONB, INTEGER) TO authenticated;
GRANT SELECT ON public.ranking_with_challenge_progress TO authenticated;

-- Step 8: Add comments for documentation
COMMENT ON COLUMN public.profiles.challenge_start_date IS 'Timestamp when user started their 7-day challenge (in UTC, converted to Brasilia timezone in application)';
COMMENT ON COLUMN public.profiles.challenge_completed_at IS 'Timestamp when user completed their 7-day challenge';
COMMENT ON FUNCTION public.can_user_complete_tasks(UUID) IS 'Check if user can complete challenge tasks (must be at least 1 day after registration in Brasília timezone)';
COMMENT ON FUNCTION public.get_user_challenge_status(UUID) IS 'Get comprehensive challenge status including whether user can complete tasks';
COMMENT ON FUNCTION public.check_challenge_start_before_task_completion() IS 'Trigger function to prevent task completion before challenge officially starts';

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'Challenge delay fix migration completed successfully!';
  RAISE NOTICE 'You can now test the functionality with a new user registration.';
END $$;