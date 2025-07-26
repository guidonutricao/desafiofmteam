// Test script to check available tables
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ibwhrmivclyrsdstyxvm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlid2hybWl2Y2x5cnNkc3R5eHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzgzNTksImV4cCI6MjA2ODg1NDM1OX0.15B6WAb0iUdK_UKxyNvF_F6fHrOBI2Evr89Va5CdPDg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testTables() {
  console.log('Testing available tables...');
  
  const tables = ['profiles', 'desafios_diarios', 'pontuacoes', 'daily_progress'];
  
  for (const table of tables) {
    try {
      console.log(`\nTesting table: ${table}`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`Error with ${table}:`, error.message);
      } else {
        console.log(`${table} exists. Sample:`, data?.[0] || 'No data');
        if (data?.[0]) {
          console.log(`${table} columns:`, Object.keys(data[0]));
        }
      }
    } catch (error) {
      console.error(`Failed to test ${table}:`, error.message);
    }
  }
}

testTables();