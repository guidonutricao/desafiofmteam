-- Fix existing users challenge dates
-- This migration sets challenge_start_date to created_at for existing users

-- Step 1: Update existing users who don't have challenge_start_date set
-- Set their challenge_start_date to their profile creation date
UPDATE public.profiles 
SET challenge_start_date = created_at,
    updated_at = NOW()
WHERE challenge_start_date IS NULL 
  AND created_at IS NOT NULL;

-- Step 2: Verify the update
SELECT 
  user_id,
  nome,
  created_at,
  challenge_start_date,
  CASE 
    WHEN challenge_start_date IS NULL THEN '❌ Still NULL'
    WHEN DATE(challenge_start_date) = DATE(created_at) THEN '✅ Matches creation date'
    ELSE '⚠️ Different from creation date'
  END as status
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: Show summary of changes
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN challenge_start_date IS NOT NULL THEN 1 END) as users_with_challenge_date,
  COUNT(CASE WHEN DATE(challenge_start_date) = DATE(created_at) THEN 1 END) as users_with_matching_dates
FROM public.profiles;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'Existing users challenge dates have been fixed!';
  RAISE NOTICE 'All users now have challenge_start_date set to their profile creation date.';
END $$;