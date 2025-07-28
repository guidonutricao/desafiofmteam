-- Check and fix user challenge dates
-- Run this to verify and correct existing user data

-- Step 1: Check current state of users
SELECT 
  'BEFORE FIX' as status,
  user_id,
  nome,
  created_at::date as profile_created_date,
  challenge_start_date::date as challenge_start_date,
  CASE 
    WHEN challenge_start_date IS NULL THEN '❌ No challenge start date'
    WHEN DATE(challenge_start_date) = DATE(created_at) THEN '✅ Matches creation date'
    WHEN challenge_start_date > created_at THEN '⚠️ Challenge started after profile creation'
    ELSE '⚠️ Challenge started before profile creation'
  END as date_status
FROM public.profiles
ORDER BY created_at DESC;

-- Step 2: Fix users who don't have challenge_start_date or have incorrect dates
UPDATE public.profiles 
SET 
  challenge_start_date = created_at,
  updated_at = NOW()
WHERE 
  challenge_start_date IS NULL 
  OR DATE(challenge_start_date) != DATE(created_at);

-- Step 3: Check state after fix
SELECT 
  'AFTER FIX' as status,
  user_id,
  nome,
  created_at::date as profile_created_date,
  challenge_start_date::date as challenge_start_date,
  CASE 
    WHEN challenge_start_date IS NULL THEN '❌ Still no challenge start date'
    WHEN DATE(challenge_start_date) = DATE(created_at) THEN '✅ Now matches creation date'
    ELSE '⚠️ Still has issues'
  END as date_status
FROM public.profiles
ORDER BY created_at DESC;

-- Step 4: Summary report
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN challenge_start_date IS NOT NULL THEN 1 END) as users_with_challenge_date,
  COUNT(CASE WHEN DATE(challenge_start_date) = DATE(created_at) THEN 1 END) as users_with_correct_dates,
  COUNT(CASE WHEN challenge_start_date IS NULL THEN 1 END) as users_without_challenge_date
FROM public.profiles;

-- Step 5: Check specific user mentioned in the issue
SELECT 
  'SPECIFIC USER CHECK' as check_type,
  user_id,
  nome,
  created_at,
  challenge_start_date,
  EXTRACT(DAY FROM (challenge_start_date - created_at)) as days_difference,
  CASE 
    WHEN DATE(challenge_start_date) = DATE(created_at) THEN '✅ Fixed - dates match'
    ELSE '❌ Still needs fixing'
  END as status
FROM public.profiles
WHERE user_id = '3bcdb8ab-120c-43ab-b403-fe50607f40ea';

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'User challenge dates have been checked and fixed!';
  RAISE NOTICE 'All users should now have challenge_start_date equal to their profile creation date.';
  RAISE NOTICE 'The "Start Challenge" button should only appear for truly new users.';
END $$;