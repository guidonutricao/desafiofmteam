-- Test script to verify celebration page is using total_points correctly
-- Run this in Supabase SQL Editor to check the data structure

-- 1. Check if ranking_with_challenge_progress view exists and has the correct columns
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'ranking_with_challenge_progress' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Sample data from the ranking view to see the difference between legacy_points and total_points
SELECT 
  user_id,
  nome,
  legacy_points,
  total_challenge_points,
  total_points,
  days_completed,
  challenge_start_date,
  challenge_completed_at
FROM public.ranking_with_challenge_progress
LIMIT 5;

-- 3. Check if there are users with different legacy_points vs total_points
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN legacy_points > 0 THEN 1 END) as users_with_legacy_points,
  COUNT(CASE WHEN total_challenge_points > 0 THEN 1 END) as users_with_challenge_points,
  COUNT(CASE WHEN total_points != legacy_points THEN 1 END) as users_with_different_totals
FROM public.ranking_with_challenge_progress;

-- 4. Show examples of users where total_points differs from legacy_points
SELECT 
  user_id,
  nome,
  legacy_points,
  total_challenge_points,
  total_points,
  (total_points - legacy_points) as difference
FROM public.ranking_with_challenge_progress
WHERE total_points != legacy_points
LIMIT 10;

-- 5. Verify that total_points = legacy_points + total_challenge_points
SELECT 
  user_id,
  nome,
  legacy_points,
  total_challenge_points,
  total_points,
  (legacy_points + total_challenge_points) as calculated_total,
  CASE 
    WHEN total_points = (legacy_points + total_challenge_points) THEN 'CORRECT'
    ELSE 'INCORRECT'
  END as calculation_check
FROM public.ranking_with_challenge_progress
WHERE total_points > 0
LIMIT 10;