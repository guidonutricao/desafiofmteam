// Validation script for challenge tracking migration
// This script validates the SQL syntax and structure

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateMigration() {
  const migrationPath = path.join(__dirname, 'supabase/migrations/20250125120000_add_challenge_tracking.sql');
  
  try {
    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('✅ Migration file exists and is readable');
    
    // Check for required components
    const requiredComponents = [
      'ALTER TABLE public.profiles',
      'challenge_start_date TIMESTAMPTZ',
      'challenge_completed_at TIMESTAMPTZ',
      'CREATE TABLE IF NOT EXISTS public.daily_progress',
      'challenge_day INTEGER NOT NULL CHECK',
      'tasks_completed JSONB',
      'points_earned INTEGER',
      'UNIQUE(user_id, challenge_day)',
      'CREATE INDEX',
      'idx_profiles_challenge_start',
      'idx_profiles_challenge_completed',
      'idx_daily_progress_user_day',
      'ENABLE ROW LEVEL SECURITY',
      'CREATE POLICY',
      'start_user_challenge',
      'complete_user_challenge',
      'get_user_challenge_progress',
      'record_daily_progress',
      'ranking_with_challenge_progress'
    ];
    
    const missingComponents = [];
    
    requiredComponents.forEach(component => {
      if (!migrationContent.includes(component)) {
        missingComponents.push(component);
      }
    });
    
    if (missingComponents.length === 0) {
      console.log('✅ All required components are present in the migration');
    } else {
      console.log('❌ Missing components:', missingComponents);
      return false;
    }
    
    // Check for SQL syntax patterns
    const syntaxChecks = [
      { pattern: /CREATE TABLE.*\(/g, name: 'CREATE TABLE statements' },
      { pattern: /ALTER TABLE.*ADD COLUMN/g, name: 'ALTER TABLE statements' },
      { pattern: /CREATE INDEX.*ON/g, name: 'CREATE INDEX statements' },
      { pattern: /CREATE POLICY.*ON/g, name: 'CREATE POLICY statements' },
      { pattern: /CREATE OR REPLACE FUNCTION/g, name: 'CREATE FUNCTION statements' },
      { pattern: /REFERENCES.*ON DELETE CASCADE/g, name: 'Foreign key constraints' }
    ];
    
    syntaxChecks.forEach(check => {
      const matches = migrationContent.match(check.pattern);
      if (matches) {
        console.log(`✅ ${check.name}: ${matches.length} found`);
      } else {
        console.log(`⚠️  ${check.name}: none found`);
      }
    });
    
    // Validate specific requirements from the task
    console.log('\n📋 Task Requirements Validation:');
    
    // Requirement: Add challenge_start_date and challenge_completed_at columns to profiles
    if (migrationContent.includes('challenge_start_date TIMESTAMPTZ') && 
        migrationContent.includes('challenge_completed_at TIMESTAMPTZ')) {
      console.log('✅ Challenge tracking columns added to profiles table');
    } else {
      console.log('❌ Missing challenge tracking columns in profiles table');
    }
    
    // Requirement: Create daily_progress table with proper indexes
    if (migrationContent.includes('CREATE TABLE IF NOT EXISTS public.daily_progress') &&
        migrationContent.includes('idx_daily_progress_user_day')) {
      console.log('✅ daily_progress table created with proper indexes');
    } else {
      console.log('❌ daily_progress table or indexes missing');
    }
    
    // Requirement: Add database constraints and foreign key relationships
    if (migrationContent.includes('REFERENCES public.profiles(user_id) ON DELETE CASCADE') &&
        migrationContent.includes('CHECK (challenge_day >= 1 AND challenge_day <= 7)') &&
        migrationContent.includes('UNIQUE(user_id, challenge_day)')) {
      console.log('✅ Database constraints and foreign key relationships added');
    } else {
      console.log('❌ Missing database constraints or foreign key relationships');
    }
    
    // Check for RLS policies
    if (migrationContent.includes('ENABLE ROW LEVEL SECURITY') &&
        migrationContent.includes('CREATE POLICY')) {
      console.log('✅ Row Level Security policies implemented');
    } else {
      console.log('❌ Missing Row Level Security policies');
    }
    
    console.log('\n📊 Migration Statistics:');
    console.log(`- File size: ${migrationContent.length} characters`);
    console.log(`- Lines: ${migrationContent.split('\n').length}`);
    console.log(`- Tables created: ${(migrationContent.match(/CREATE TABLE/g) || []).length}`);
    console.log(`- Indexes created: ${(migrationContent.match(/CREATE INDEX/g) || []).length}`);
    console.log(`- Functions created: ${(migrationContent.match(/CREATE OR REPLACE FUNCTION/g) || []).length}`);
    console.log(`- Policies created: ${(migrationContent.match(/CREATE POLICY/g) || []).length}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error validating migration:', error.message);
    return false;
  }
}

// Run validation
console.log('🔍 Validating Challenge Tracking Migration...\n');
const isValid = validateMigration();

if (isValid) {
  console.log('\n🎉 Migration validation completed successfully!');
  process.exit(0);
} else {
  console.log('\n💥 Migration validation failed!');
  process.exit(1);
}