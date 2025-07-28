-- Script to check current database structure
-- Run this first to understand what's missing in your database

-- 1. Check if profiles table has challenge columns
SELECT 
  'profiles' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if daily_progress table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'daily_progress' 
      AND table_schema = 'public'
    ) 
    THEN 'daily_progress table EXISTS' 
    ELSE 'daily_progress table MISSING' 
  END as daily_progress_status;

-- 3. Check existing functions related to challenge
SELECT 
  proname as function_name,
  pg_get_function_result(oid) as return_type,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname LIKE '%challenge%' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- 4. Check existing triggers on desafios_diarios
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'desafios_diarios'
AND event_object_schema = 'public'
ORDER BY trigger_name;

-- 5. Check if ranking view exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.views 
      WHERE table_name = 'ranking_with_challenge_progress' 
      AND table_schema = 'public'
    ) 
    THEN 'ranking_with_challenge_progress view EXISTS' 
    ELSE 'ranking_with_challenge_progress view MISSING' 
  END as ranking_view_status;

-- 6. Sample data from profiles to understand current structure
SELECT 
  user_id, 
  nome,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'challenge_start_date'
      AND table_schema = 'public'
    ) 
    THEN 'Has challenge_start_date column'
    ELSE 'Missing challenge_start_date column'
  END as challenge_column_status
FROM public.profiles 
LIMIT 3;

-- 7. Check what needs to be created
SELECT 
  'SUMMARY' as section,
  CASE 
    WHEN NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'challenge_start_date'
      AND table_schema = 'public'
    ) 
    THEN 'NEED TO: Add challenge columns to profiles table'
    ELSE 'OK: Challenge columns exist in profiles'
  END as profiles_status,
  
  CASE 
    WHEN NOT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'daily_progress' 
      AND table_schema = 'public'
    ) 
    THEN 'NEED TO: Create daily_progress table'
    ELSE 'OK: daily_progress table exists'
  END as daily_progress_status,
  
  CASE 
    WHEN NOT EXISTS (
      SELECT FROM pg_proc 
      WHERE proname = 'can_user_complete_tasks'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) 
    THEN 'NEED TO: Create challenge functions'
    ELSE 'OK: Challenge functions exist'
  END as functions_status;

-- Instructions based on results:
-- If you see "NEED TO" messages above, use: complete_challenge_migration.sql
-- If you see all "OK" messages, you can use: apply_migration_simple.sql