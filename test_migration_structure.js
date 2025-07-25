// Test script to verify migration structure matches design requirements
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function testMigrationStructure() {
  const migrationPath = path.join(__dirname, 'supabase/migrations/20250125120000_add_challenge_tracking.sql');
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('🧪 Testing Migration Structure Against Design Requirements...\n');
  
  const tests = [
    {
      name: 'Profiles table has challenge_start_date column',
      test: () => migrationContent.includes('challenge_start_date TIMESTAMPTZ'),
      requirement: '4.1, 4.2'
    },
    {
      name: 'Profiles table has challenge_completed_at column', 
      test: () => migrationContent.includes('challenge_completed_at TIMESTAMPTZ'),
      requirement: '4.1, 4.2'
    },
    {
      name: 'Daily progress table exists with correct structure',
      test: () => migrationContent.includes('CREATE TABLE IF NOT EXISTS public.daily_progress') &&
                  migrationContent.includes('challenge_day INTEGER NOT NULL CHECK (challenge_day >= 1 AND challenge_day <= 7)') &&
                  migrationContent.includes('tasks_completed JSONB DEFAULT \'{}\'') &&
                  migrationContent.includes('points_earned INTEGER DEFAULT 0'),
      requirement: '5.3, 5.4'
    },
    {
      name: 'Unique constraint on user_id and challenge_day',
      test: () => migrationContent.includes('UNIQUE(user_id, challenge_day)'),
      requirement: '4.1, 4.2'
    },
    {
      name: 'Foreign key relationship to profiles table',
      test: () => migrationContent.includes('REFERENCES public.profiles(user_id) ON DELETE CASCADE'),
      requirement: '4.1, 4.2'
    },
    {
      name: 'Performance indexes created',
      test: () => migrationContent.includes('idx_profiles_challenge_start') &&
                  migrationContent.includes('idx_profiles_challenge_completed') &&
                  migrationContent.includes('idx_daily_progress_user_day') &&
                  migrationContent.includes('idx_daily_progress_date'),
      requirement: '5.3, 5.4'
    },
    {
      name: 'Row Level Security enabled',
      test: () => migrationContent.includes('ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY'),
      requirement: '4.1, 4.2'
    },
    {
      name: 'RLS policies for user data isolation',
      test: () => migrationContent.includes('auth.uid() = user_id'),
      requirement: '4.1, 4.2'
    },
    {
      name: 'Helper functions for challenge management',
      test: () => migrationContent.includes('start_user_challenge') &&
                  migrationContent.includes('complete_user_challenge') &&
                  migrationContent.includes('get_user_challenge_progress') &&
                  migrationContent.includes('record_daily_progress'),
      requirement: '4.1, 4.2, 5.3, 5.4'
    },
    {
      name: 'Ranking view with challenge progress',
      test: () => migrationContent.includes('ranking_with_challenge_progress') &&
                  migrationContent.includes('total_challenge_points') &&
                  migrationContent.includes('days_completed'),
      requirement: '4.3, 5.1, 5.2'
    }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  tests.forEach((test, index) => {
    const result = test.test();
    if (result) {
      console.log(`✅ Test ${index + 1}: ${test.name} (Requirements: ${test.requirement})`);
      passedTests++;
    } else {
      console.log(`❌ Test ${index + 1}: ${test.name} (Requirements: ${test.requirement})`);
      failedTests++;
    }
  });
  
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / tests.length) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Migration structure matches design requirements.');
    return true;
  } else {
    console.log('\n💥 Some tests failed. Please review the migration.');
    return false;
  }
}

// Run tests
const success = testMigrationStructure();
process.exit(success ? 0 : 1);