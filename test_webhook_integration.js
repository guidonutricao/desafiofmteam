/**
 * Test script for webhook integration
 * This script tests the webhook functionality without creating a real user
 */

import { createClient } from '@supabase/supabase-js';

// Configure Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testWebhookFunction() {
  console.log('🧪 Testing webhook integration...');
  
  try {
    // Test data that simulates a new user
    const testUserData = {
      user_id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      nome: 'Usuário Teste',
      peso_inicial: 75.5,
      created_at: new Date().toISOString(),
      challenge_start_date: new Date().toISOString(),
      event_type: 'user_created_test'
    };
    
    console.log('📤 Sending test data to webhook:', testUserData);
    
    // Call the webhook function directly
    const { data, error } = await supabase.rpc('send_user_webhook', {
      user_data: testUserData
    });
    
    if (error) {
      console.error('❌ Error calling webhook function:', error);
      return false;
    }
    
    console.log('✅ Webhook function called successfully');
    console.log('📊 Response:', data);
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

async function checkWebhookFunctionExists() {
  console.log('🔍 Checking if webhook function exists...');
  
  try {
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'send_user_webhook');
    
    if (error) {
      console.error('❌ Error checking function:', error);
      return false;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Webhook function exists');
      return true;
    } else {
      console.log('❌ Webhook function not found');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error checking function existence:', error);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting webhook integration tests...\n');
  
  // Check if function exists
  const functionExists = await checkWebhookFunctionExists();
  if (!functionExists) {
    console.log('⚠️  Please run the migration first: supabase/migrations/20250204000000_add_webhook_integration.sql');
    return;
  }
  
  // Test webhook function
  const testResult = await testWebhookFunction();
  
  console.log('\n📋 Test Summary:');
  console.log(`Function exists: ${functionExists ? '✅' : '❌'}`);
  console.log(`Webhook test: ${testResult ? '✅' : '❌'}`);
  
  if (functionExists && testResult) {
    console.log('\n🎉 All tests passed! Webhook integration is ready.');
    console.log('💡 New user registrations will automatically send data to your n8n webhook.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the logs above.');
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { testWebhookFunction, checkWebhookFunctionExists, runTests };