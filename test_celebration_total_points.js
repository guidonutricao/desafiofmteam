// Test script to verify celebration page hook is using total_points correctly
// Run this in browser console on the celebration page

console.log('🧪 Testing Celebration Page Total Points...');

// Function to test the ranking view data structure
async function testRankingViewData() {
  try {
    console.log('📊 Testing ranking view data...');
    
    // This would be the actual supabase call that the hook makes
    const { data, error } = await window.supabase
      .from('ranking_with_challenge_progress')
      .select('total_points, legacy_points, total_challenge_points, nome')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching ranking data:', error);
      return;
    }
    
    console.log('✅ Ranking view data:', data);
    
    // Check if total_points is correctly calculated
    data.forEach(user => {
      const calculatedTotal = (user.legacy_points || 0) + (user.total_challenge_points || 0);
      const isCorrect = user.total_points === calculatedTotal;
      
      console.log(`${isCorrect ? '✅' : '❌'} ${user.nome}: 
        Legacy: ${user.legacy_points || 0}, 
        Challenge: ${user.total_challenge_points || 0}, 
        Total: ${user.total_points}, 
        Calculated: ${calculatedTotal}`);
    });
    
  } catch (error) {
    console.error('❌ Error in testRankingViewData:', error);
  }
}

// Function to simulate the hook's data fetching logic
async function testCelebrationDataFetch(userId) {
  try {
    console.log('🎉 Testing celebration data fetch for user:', userId);
    
    // Test the desafios_diarios query first (primary data source)
    const { data: desafiosData, error: desafiosError } = await window.supabase
      .from('desafios_diarios')
      .select(`
        data,
        pontuacao_total,
        hidratacao,
        sono_qualidade,
        atividade_fisica,
        seguiu_dieta,
        registro_visual
      `)
      .eq('user_id', userId)
      .order('data', { ascending: true });
    
    console.log('📅 Desafios diarios data:', desafiosData);
    
    let totalScore = 0;
    
    if (desafiosData && desafiosData.length > 0) {
      totalScore = desafiosData.reduce((sum, day) => sum + (day.pontuacao_total || 0), 0);
      console.log('✅ Using desafios_diarios data, total score:', totalScore);
    } else {
      // Fallback to ranking view (updated logic)
      const { data: rankingData, error: rankingError } = await window.supabase
        .from('ranking_with_challenge_progress')
        .select('total_points, legacy_points, total_challenge_points')
        .eq('user_id', userId)
        .single();
      
      if (!rankingError && rankingData) {
        totalScore = rankingData.total_points || 0;
        console.log('✅ Using ranking view data:', {
          total_points: rankingData.total_points,
          legacy_points: rankingData.legacy_points,
          total_challenge_points: rankingData.total_challenge_points
        });
        console.log('✅ Final total score:', totalScore);
      } else {
        console.log('❌ No data found in either table');
      }
    }
    
    return totalScore;
    
  } catch (error) {
    console.error('❌ Error in testCelebrationDataFetch:', error);
  }
}

// Function to compare old vs new logic
async function compareOldVsNewLogic(userId) {
  try {
    console.log('🔄 Comparing old vs new logic for user:', userId);
    
    // Old logic (pontuacoes table)
    const { data: oldData, error: oldError } = await window.supabase
      .from('pontuacoes')
      .select('pontuacao_total')
      .eq('user_id', userId)
      .single();
    
    const oldScore = oldData?.pontuacao_total || 0;
    
    // New logic (ranking view)
    const { data: newData, error: newError } = await window.supabase
      .from('ranking_with_challenge_progress')
      .select('total_points, legacy_points, total_challenge_points')
      .eq('user_id', userId)
      .single();
    
    const newScore = newData?.total_points || 0;
    
    console.log('📊 Comparison Results:');
    console.log(`Old logic (pontuacoes): ${oldScore}`);
    console.log(`New logic (ranking view): ${newScore}`);
    console.log(`Difference: ${newScore - oldScore}`);
    console.log(`Legacy points: ${newData?.legacy_points || 0}`);
    console.log(`Challenge points: ${newData?.total_challenge_points || 0}`);
    
    if (newScore > oldScore) {
      console.log('✅ New logic includes additional challenge points!');
    } else if (newScore === oldScore) {
      console.log('ℹ️ Scores are the same (user may not have new challenge data)');
    } else {
      console.log('⚠️ New score is lower than old score - investigate');
    }
    
  } catch (error) {
    console.error('❌ Error in compareOldVsNewLogic:', error);
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting celebration page total points tests...\n');
  
  await testRankingViewData();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Get current user ID if available
  const user = window.supabase?.auth?.getUser ? await window.supabase.auth.getUser() : null;
  const userId = user?.data?.user?.id;
  
  if (userId) {
    await testCelebrationDataFetch(userId);
    console.log('\n' + '='.repeat(50) + '\n');
    await compareOldVsNewLogic(userId);
  } else {
    console.log('ℹ️ No authenticated user found, skipping user-specific tests');
  }
  
  console.log('\n🎯 Tests completed!');
}

// Auto-run if supabase is available
if (typeof window !== 'undefined' && window.supabase) {
  runAllTests();
} else {
  console.log('ℹ️ Supabase not available. Make sure you are on a page with supabase loaded.');
  console.log('ℹ️ You can run runAllTests() manually when ready.');
}

// Export functions for manual testing
window.celebrationTests = {
  testRankingViewData,
  testCelebrationDataFetch,
  compareOldVsNewLogic,
  runAllTests
};