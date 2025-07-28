-- Test script to verify the "Start Challenge" button functionality
-- Run this in Supabase SQL Editor to test the challenge start process

-- 1. Check current state of a user (replace with actual user_id)
-- SELECT user_id, nome, challenge_start_date, challenge_completed_at 
-- FROM public.profiles 
-- WHERE user_id = 'your-user-id-here';

-- 2. Check pontuacoes table for the same user
-- SELECT user_id, pontuacao_total, ultima_data_participacao, created_at
-- FROM public.pontuacoes 
-- WHERE user_id = 'your-user-id-here';

-- 3. Test the start_user_challenge function (if it exists)
-- SELECT public.start_user_challenge('your-user-id-here');

-- 4. Check if the function exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'start_user_challenge'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) 
    THEN '✅ start_user_challenge function EXISTS'
    ELSE '❌ start_user_challenge function MISSING'
  END as function_status;

-- 5. Check if challenge columns exist in profiles
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'challenge_start_date'
      AND table_schema = 'public'
    ) 
    THEN '✅ challenge_start_date column EXISTS'
    ELSE '❌ challenge_start_date column MISSING'
  END as column_status;

-- 6. Show all users and their challenge status
SELECT 
  p.user_id,
  p.nome,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'challenge_start_date'
      AND table_schema = 'public'
    ) 
    THEN 'Has challenge columns'
    ELSE 'Missing challenge columns'
  END as profile_status,
  pt.pontuacao_total,
  pt.ultima_data_participacao
FROM public.profiles p
LEFT JOIN public.pontuacoes pt ON p.user_id = pt.user_id
LIMIT 5;

-- INSTRUCTIONS:
-- 1. If you see "❌ MISSING" messages, run complete_challenge_migration.sql first
-- 2. Replace 'your-user-id-here' with actual user IDs from the results above
-- 3. Test the start_user_challenge function with a real user ID
-- 4. Check if the challenge_start_date gets updated after running the function