// Test script to verify challenge setup
// Run this with: node test_challenge_setup.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ibwhrmivclyrsdstyxvm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlid2hybWl2Y2x5cnNkc3R5eHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzgzNTksImV4cCI6MjA2ODg1NDM1OX0.15B6WAb0iUdK_UKxyNvF_F6fHrOBI2Evr89Va5CdPDg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testChallengeSetup() {
  console.log('Testing challenge setup...');
  
  try {
    // Test 1: Check if profiles table has required columns
    console.log('\n1. Checking profiles table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public')
      .in('column_name', ['challenge_start_date', 'challenge_completed_at']);
    
    if (columnsError) {
      console.error('Error checking columns:', columnsError);
    } else {
      console.log('Profiles table columns:', columns);
    }
    
    // Test 2: Check if function exists
    console.log('\n2. Checking if start_user_challenge function exists...');
    const { data: functions, error: functionsError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'start_user_challenge');
    
    if (functionsError) {
      console.error('Error checking functions:', functionsError);
    } else {
      console.log('Function exists:', functions?.length > 0);
    }
    
    // Test 3: Try to call the function (this will fail without auth, but we can see the error)
    console.log('\n3. Testing function call (expect auth error)...');
    const { data: result, error: callError } = await supabase
      .rpc('start_user_challenge', { user_id_param: '00000000-0000-0000-0000-000000000000' });
    
    console.log('Function call result:', result);
    console.log('Function call error:', callError);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testChallengeSetup();