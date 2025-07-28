-- Quick check to see what's missing in your database
-- Run this in Supabase SQL Editor to understand the current state

-- 1. Check if challenge columns exist in profiles table
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'challenge_start_date'
      AND table_schema = 'public'
    ) 
    THEN '✅ challenge_start_date column EXISTS'
    ELSE '❌ challenge_start_date column MISSING - Need to run migration'
  END as challenge_start_status,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'challenge_completed_at'
      AND table_schema = 'public'
    ) 
    THEN '✅ challenge_completed_at column EXISTS'
    ELSE '❌ challenge_completed_at column MISSING - Need to run migration'
  END as challenge_completed_status;

-- 2. Check if functions exist
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'get_user_challenge_status'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) 
    THEN '✅ get_user_challenge_status function EXISTS'
    ELSE '❌ get_user_challenge_status function MISSING - Need to run migration'
  END as function_status;

-- 3. Show current profiles structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- INSTRUCTIONS:
-- If you see ❌ MISSING messages above:
-- 1. Copy and paste complete_challenge_migration.sql into Supabase SQL Editor
-- 2. Run it
-- 3. Then run this check again to verify

-- If you see all ✅ EXISTS messages:
-- Your database is ready and the white screen should be fixed!