-- Debug script to test the start_user_challenge function
-- This script can be run in Supabase SQL editor to test the function

-- First, let's check if the function exists
SELECT 
  proname as function_name,
  proargnames as argument_names,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'start_user_challenge';

-- Check if the profiles table has the required columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('challenge_start_date', 'challenge_completed_at', 'user_id');

-- Test the function with a sample user (replace with actual user_id)
-- SELECT public.start_user_challenge('your-user-id-here');

-- Check current profiles data structure
SELECT user_id, challenge_start_date, challenge_completed_at, created_at, updated_at
FROM public.profiles 
LIMIT 5;