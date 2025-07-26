// Test script to verify profiles table structure
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ibwhrmivclyrsdstyxvm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlid2hybWl2Y2x5cnNkc3R5eHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzgzNTksImV4cCI6MjA2ODg1NDM1OX0.15B6WAb0iUdK_UKxyNvF_F6fHrOBI2Evr89Va5CdPDg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testProfilesTable() {
  console.log('Testing profiles table...');
  
  try {
    // Try to select from profiles table to see what columns exist
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying profiles:', error);
    } else {
      console.log('Profiles table structure (sample row):', data?.[0] || 'No data');
      if (data?.[0]) {
        console.log('Available columns:', Object.keys(data[0]));
      }
    }
    
    // Try to select specific columns to see if they exist
    const { data: challengeData, error: challengeError } = await supabase
      .from('profiles')
      .select('user_id, challenge_start_date, challenge_completed_at')
      .limit(1);
    
    if (challengeError) {
      console.error('Error querying challenge columns:', challengeError);
      console.log('This suggests the challenge columns do not exist yet');
    } else {
      console.log('Challenge columns exist:', challengeData);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testProfilesTable();