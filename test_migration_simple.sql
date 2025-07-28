-- Test script to verify the challenge start delay fix
-- Run this in Supabase SQL Editor after applying the migration

-- 1. Check if functions were created successfully
SELECT 
  proname as function_name,
  prosrc IS NOT NULL as has_body
FROM pg_proc 
WHERE proname IN (
  'can_user_complete_tasks',
  'get_user_challenge_status',
  'check_challenge_start_before_task_completion'
)
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 2. Check if triggers were created
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name LIKE '%challenge_start%'
AND event_object_schema = 'public';

-- 3. Check if challenge columns were added to profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('challenge_start_date', 'challenge_completed_at');

-- 4. Test with a sample user (replace 'sample-user-id' with a real user ID from your system)
-- First, let's see what users exist
SELECT user_id, nome, challenge_start_date, challenge_completed_at 
FROM public.profiles 
LIMIT 5;

-- 5. Test the can_user_complete_tasks function
-- Replace 'your-user-id-here' with an actual user_id from the query above
-- SELECT public.can_user_complete_tasks('your-user-id-here');

-- 6. Test the get_user_challenge_status function
-- Replace 'your-user-id-here' with an actual user_id from the query above
-- SELECT * FROM public.get_user_challenge_status('your-user-id-here');

-- 7. Create a test user to verify the logic (optional)
-- This will create a user with today's date as challenge_start_date
/*
INSERT INTO public.profiles (user_id, nome, challenge_start_date)
VALUES (
  gen_random_uuid(),
  'Test User - Delete Me',
  NOW()
)
RETURNING user_id, nome, challenge_start_date;
*/

-- 8. Test the function with the test user (use the user_id from step 7)
-- SELECT public.can_user_complete_tasks('test-user-id-from-step-7');
-- This should return FALSE because the user registered today

-- 9. Check challenge status for the test user
-- SELECT * FROM public.get_user_challenge_status('test-user-id-from-step-7');
-- This should show has_started=true, can_complete_tasks=false, current_challenge_day=0

-- 10. Test the start_user_challenge function with an existing user
-- Replace 'your-user-id-here' with an actual user_id from step 4
-- SELECT public.start_user_challenge('your-user-id-here');
-- Then check: SELECT challenge_start_date FROM public.profiles WHERE user_id = 'your-user-id-here';

-- 11. Clean up test user (uncomment and replace with actual user_id)
-- DELETE FROM public.profiles WHERE nome = 'Test User - Delete Me';

-- Expected results:
-- - Functions should exist and have bodies
-- - Triggers should be created on desafios_diarios table
-- - can_user_complete_tasks should return FALSE for users who registered today
-- - get_user_challenge_status should show correct status for new users