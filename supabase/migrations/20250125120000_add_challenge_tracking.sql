-- Migration: Add challenge tracking functionality
-- This migration adds challenge tracking columns to profiles table and creates daily_progress table

-- Add challenge tracking columns to profiles table
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

-- Create daily_progress table for tracking individual challenge days
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

-- Enable RLS on daily_progress table
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_progress table
CREATE POLICY "Users can view their own daily progress" ON public.daily_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily progress" ON public.daily_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily progress" ON public.daily_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily progress" ON public.daily_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger to update updated_at column for daily_progress
CREATE TRIGGER update_daily_progress_updated_at
  BEFORE UPDATE ON public.daily_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to start a challenge for a user
CREATE OR REPLACE FUNCTION public.start_user_challenge(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
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
$;

-- Create function to complete a challenge for a user
CREATE OR REPLACE FUNCTION public.complete_user_challenge(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
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
$;

-- Create function to get user challenge progress
CREATE OR REPLACE FUNCTION public.get_user_challenge_progress(user_id_param UUID)
RETURNS TABLE (
  user_id UUID,
  challenge_start_date TIMESTAMPTZ,
  challenge_completed_at TIMESTAMPTZ,
  total_points INTEGER,
  days_completed INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.challenge_start_date,
    p.challenge_completed_at,
    COALESCE(SUM(dp.points_earned), 0)::INTEGER as total_points,
    COUNT(dp.challenge_day)::INTEGER as days_completed
  FROM public.profiles p
  LEFT JOIN public.daily_progress dp ON p.user_id = dp.user_id
  WHERE p.user_id = user_id_param
  GROUP BY p.user_id, p.challenge_start_date, p.challenge_completed_at;
END;
$;

-- Create function to record daily progress
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
AS $
BEGIN
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
$;

-- Create view for ranking with challenge progress
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

-- Grant necessary permissions
GRANT SELECT ON public.ranking_with_challenge_progress TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_user_challenge(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_user_challenge(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_challenge_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_daily_progress(UUID, INTEGER, JSONB, INTEGER) TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.challenge_start_date IS 'Timestamp when user started their 7-day challenge (in UTC, converted to Brasilia timezone in application)';
COMMENT ON COLUMN public.profiles.challenge_completed_at IS 'Timestamp when user completed their 7-day challenge';
COMMENT ON TABLE public.daily_progress IS 'Tracks individual daily progress for each user''s 7-day challenge';
COMMENT ON COLUMN public.daily_progress.challenge_day IS 'Day number in the challenge (1-7)';
COMMENT ON COLUMN public.daily_progress.tasks_completed IS 'JSON object tracking which tasks were completed for this day';
COMMENT ON COLUMN public.daily_progress.points_earned IS 'Points earned for this specific challenge day';