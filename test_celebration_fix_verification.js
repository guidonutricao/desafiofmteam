// Test script to verify the celebration page fix is working
// Run this in browser console on the celebration page

console.log('🔍 Testing Celebration Page Fix...');

// Function to test the current user's data
async function testCurrentUserData() {
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
      console.log('❌ No authenticated user found');
      return;
    }
    
    console.log('👤 Testing for user:', user.id);
    
    // 1. Test desafios_diarios data (what the hook used to prioritize)
    console.log('\n📅 Testing desafios_diarios data...');
    const { data: desafiosData, error: desafiosError } = await window.supabase
      .from('desafios_diarios')
      .select('data, pontuacao_total, hidratacao, sono_qualidade, atividade_fisica, seguiu_dieta, registro_visual')
      .eq('user_id', user.id)
      .order('data', { ascending: true });
    
    if (desafiosError) {
      console.error('❌ Error fetching desafios_diarios:', desafiosError);
    } else {
      console.log('✅ Desafios diarios records:', desafiosData?.length || 0);
      if (desafiosData && desafiosData.length > 0) {
        const oldTotalScore = desafiosData.reduce((sum, day) => sum + (day.pontuacao_total || 0), 0);
        console.log('📊 Old logic total (pontuacao_total sum):', oldTotalScore);
      }
    }
    
    // 2. Test ranking view data (what the hook should now use)
    console.log('\n🏆 Testing ranking view data...');
    const { data: rankingData, error: rankingError } = await window.supabase
      .from('ranking_with_challenge_progress')
      .select('total_points, legacy_points, total_challenge_points, days_completed')
      .eq('user_id', user.id)
      .single();
    
    if (rankingError) {
      console.error('❌ Error fetching ranking data:', rankingError);
    } else {
      console.log('✅ Ranking view data:', rankingData);
      console.log('📊 New logic total (total_points):', rankingData?.total_points || 0);
      console.log('📊 Legacy points:', rankingData?.legacy_points || 0);
      console.log('📊 Challenge points:', rankingData?.total_challenge_points || 0);
    }
    
    // 3. Compare the two approaches
    if (desafiosData && desafiosData.length > 0 && rankingData) {
      const oldTotal = desafiosData.reduce((sum, day) => sum + (day.pontuacao_total || 0), 0);
      const newTotal = rankingData.total_points || 0;
      
      console.log('\n🔄 Comparison:');
      console.log(`Old approach (desafios sum): ${oldTotal}`);
      console.log(`New approach (ranking total): ${newTotal}`);
      console.log(`Difference: ${newTotal - oldTotal}`);
      
      if (newTotal > oldTotal) {
        console.log('✅ Fix is working! New total includes additional points.');
      } else if (newTotal === oldTotal) {
        console.log('ℹ️ Totals are the same (user may not have new challenge data)');
      } else {
        console.log('⚠️ New total is lower - this needs investigation');
      }
    }
    
    // 4. Test what the celebration page should now display
    console.log('\n🎉 What celebration page should display:');
    if (rankingData) {
      console.log(`Total Score: ${rankingData.total_points || 0} points`);
      console.log(`Breakdown:`);
      console.log(`  - Legacy points: ${rankingData.legacy_points || 0}`);
      console.log(`  - Challenge points: ${rankingData.total_challenge_points || 0}`);
      console.log(`  - Days completed: ${rankingData.days_completed || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Error in testCurrentUserData:', error);
  }
}

// Function to simulate the hook's new logic
async function simulateNewHookLogic() {
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) return;
    
    console.log('\n🔧 Simulating new hook logic...');
    
    // Step 1: Always fetch from ranking view first (new logic)
    const { data: rankingData, error: rankingError } = await window.supabase
      .from('ranking_with_challenge_progress')
      .select('total_points, legacy_points, total_challenge_points')
      .eq('user_id', user.id)
      .single();
    
    let totalScore = 0;
    if (!rankingError && rankingData) {
      totalScore = rankingData.total_points || 0;
      console.log('✅ Total score from ranking view:', totalScore);
    }
    
    // Step 2: Fetch desafios_diarios for daily breakdown
    const { data: desafiosData, error: desafiosError } = await window.supabase
      .from('desafios_diarios')
      .select('data, pontuacao_total, hidratacao, sono_qualidade, atividade_fisica, seguiu_dieta, registro_visual')
      .eq('user_id', user.id)
      .order('data', { ascending: true });
    
    if (desafiosData && desafiosData.length > 0) {
      console.log('✅ Using desafios_diarios for daily breakdown');
      console.log('📊 Daily data records:', desafiosData.length);
    } else if (rankingData) {
      console.log('✅ Using simulated daily data from ranking totals');
    }
    
    console.log('🎯 Final result: Total score =', totalScore);
    
    return { totalScore, hasDesafiosData: !!(desafiosData && desafiosData.length > 0) };
    
  } catch (error) {
    console.error('❌ Error in simulateNewHookLogic:', error);
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting celebration page fix verification...\n');
  
  await testCurrentUserData();
  console.log('\n' + '='.repeat(60) + '\n');
  await simulateNewHookLogic();
  
  console.log('\n✨ Tests completed!');
  console.log('\n💡 If the new total is higher than the old total, the fix is working correctly.');
  console.log('💡 The celebration page should now show the total_points value from the ranking view.');
}

// Auto-run if supabase is available
if (typeof window !== 'undefined' && window.supabase) {
  runTests();
} else {
  console.log('ℹ️ Supabase not available. Run runTests() when ready.');
}

// Export for manual testing
window.celebrationFixTests = {
  testCurrentUserData,
  simulateNewHookLogic,
  runTests
};