// Test script to verify celebration page components are using total_points consistently
// Run this in browser console on the celebration page

console.log('🧪 Testing Celebration Components Consistency...');

// Function to extract data from the celebration page
function extractCelebrationData() {
  try {
    console.log('📊 Extracting data from celebration page...');
    
    // Extract total score from the main display
    const mainScoreElement = document.querySelector('[aria-label*="pontos totais"]');
    const mainScore = mainScoreElement ? parseInt(mainScoreElement.textContent.trim()) : null;
    
    // Extract total score from daily dashboard summary
    const dashboardTotalElement = document.querySelector('[aria-label*="pontos totais"] .text-3xl');
    const dashboardTotal = dashboardTotalElement ? parseInt(dashboardTotalElement.textContent.trim()) : null;
    
    // Extract average score from evolution card
    const evolutionAvgElement = document.querySelector('[aria-label*="pontos por dia"] .text-lg, [aria-label*="pontos por dia"] .text-xl, [aria-label*="pontos por dia"] .text-2xl');
    const evolutionAvg = evolutionAvgElement ? parseInt(evolutionAvgElement.textContent.trim()) : null;
    
    // Extract average from daily dashboard
    const dashboardAvgElement = document.querySelector('[aria-label*="Média diária"] .text-3xl');
    const dashboardAvg = dashboardAvgElement ? parseInt(dashboardAvgElement.textContent.trim()) : null;
    
    // Extract individual daily scores
    const dailyScoreElements = document.querySelectorAll('[aria-label*="pontos, status"]');
    const dailyScores = Array.from(dailyScoreElements).map(el => {
      const match = el.getAttribute('aria-label').match(/(\d+) pontos/);
      return match ? parseInt(match[1]) : 0;
    });
    
    const dailyScoresSum = dailyScores.reduce((sum, score) => sum + score, 0);
    
    console.log('📈 Extracted Data:');
    console.log(`Main Score Display: ${mainScore}`);
    console.log(`Dashboard Total: ${dashboardTotal}`);
    console.log(`Evolution Card Average: ${evolutionAvg}`);
    console.log(`Dashboard Average: ${dashboardAvg}`);
    console.log(`Daily Scores: [${dailyScores.join(', ')}]`);
    console.log(`Daily Scores Sum: ${dailyScoresSum}`);
    
    return {
      mainScore,
      dashboardTotal,
      evolutionAvg,
      dashboardAvg,
      dailyScores,
      dailyScoresSum
    };
    
  } catch (error) {
    console.error('❌ Error extracting celebration data:', error);
    return null;
  }
}

// Function to validate consistency
function validateConsistency(data) {
  if (!data) return;
  
  console.log('\n🔍 Validating Consistency...');
  
  const issues = [];
  
  // Check if main score matches dashboard total
  if (data.mainScore !== data.dashboardTotal) {
    issues.push(`Main score (${data.mainScore}) != Dashboard total (${data.dashboardTotal})`);
  }
  
  // Check if averages are calculated correctly from total score
  const expectedAvgFromMain = data.mainScore ? Math.round(data.mainScore / 7) : null;
  const expectedAvgFromDashboard = data.dashboardTotal ? Math.round(data.dashboardTotal / 7) : null;
  
  if (data.evolutionAvg !== expectedAvgFromMain) {
    issues.push(`Evolution avg (${data.evolutionAvg}) != Expected from main (${expectedAvgFromMain})`);
  }
  
  if (data.dashboardAvg !== expectedAvgFromDashboard) {
    issues.push(`Dashboard avg (${data.dashboardAvg}) != Expected from total (${expectedAvgFromDashboard})`);
  }
  
  // Check if daily scores sum matches total (this might be different due to legacy vs new points)
  const difference = Math.abs(data.mainScore - data.dailyScoresSum);
  if (difference > 0) {
    console.log(`ℹ️ Note: Main score (${data.mainScore}) vs Daily sum (${data.dailyScoresSum}) difference: ${difference}`);
    console.log('   This is expected if user has legacy points in addition to daily challenge points.');
  }
  
  if (issues.length === 0) {
    console.log('✅ All consistency checks passed!');
    console.log('✅ Components are correctly using total_points from ranking view.');
  } else {
    console.log('❌ Consistency issues found:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  return issues.length === 0;
}

// Function to test the hook data directly
async function testHookData() {
  try {
    console.log('\n🔧 Testing hook data directly...');
    
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
      console.log('❌ No authenticated user found');
      return;
    }
    
    // Get data from ranking view
    const { data: rankingData, error: rankingError } = await window.supabase
      .from('ranking_with_challenge_progress')
      .select('total_points, legacy_points, total_challenge_points')
      .eq('user_id', user.id)
      .single();
    
    if (rankingError) {
      console.error('❌ Error fetching ranking data:', rankingError);
      return;
    }
    
    // Get data from desafios_diarios
    const { data: desafiosData, error: desafiosError } = await window.supabase
      .from('desafios_diarios')
      .select('pontuacao_total')
      .eq('user_id', user.id);
    
    const desafiosSum = desafiosData ? desafiosData.reduce((sum, day) => sum + (day.pontuacao_total || 0), 0) : 0;
    
    console.log('🎯 Hook Data Analysis:');
    console.log(`Ranking total_points: ${rankingData.total_points}`);
    console.log(`Ranking legacy_points: ${rankingData.legacy_points}`);
    console.log(`Ranking challenge_points: ${rankingData.total_challenge_points}`);
    console.log(`Desafios sum: ${desafiosSum}`);
    
    // Verify the calculation
    const calculatedTotal = (rankingData.legacy_points || 0) + (rankingData.total_challenge_points || 0);
    const isCalculationCorrect = rankingData.total_points === calculatedTotal;
    
    console.log(`Calculated total: ${calculatedTotal}`);
    console.log(`Calculation correct: ${isCalculationCorrect ? '✅' : '❌'}`);
    
    return {
      rankingTotal: rankingData.total_points,
      legacyPoints: rankingData.legacy_points,
      challengePoints: rankingData.total_challenge_points,
      desafiosSum,
      calculatedTotal,
      isCalculationCorrect
    };
    
  } catch (error) {
    console.error('❌ Error testing hook data:', error);
  }
}

// Main test function
async function runConsistencyTests() {
  console.log('🚀 Starting celebration components consistency tests...\n');
  
  // Test 1: Extract and validate UI data
  const uiData = extractCelebrationData();
  const isUIConsistent = validateConsistency(uiData);
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 2: Test hook data
  const hookData = await testHookData();
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 3: Compare UI vs Hook data
  if (uiData && hookData) {
    console.log('🔄 Comparing UI vs Hook Data:');
    
    if (uiData.mainScore === hookData.rankingTotal) {
      console.log('✅ UI main score matches ranking total_points');
    } else {
      console.log(`❌ UI main score (${uiData.mainScore}) != ranking total (${hookData.rankingTotal})`);
    }
    
    if (uiData.dashboardTotal === hookData.rankingTotal) {
      console.log('✅ Dashboard total matches ranking total_points');
    } else {
      console.log(`❌ Dashboard total (${uiData.dashboardTotal}) != ranking total (${hookData.rankingTotal})`);
    }
  }
  
  console.log('\n✨ Tests completed!');
  
  if (isUIConsistent && hookData?.isCalculationCorrect) {
    console.log('🎉 All tests passed! Components are correctly using total_points.');
  } else {
    console.log('⚠️ Some issues found. Check the logs above for details.');
  }
}

// Auto-run if supabase is available
if (typeof window !== 'undefined' && window.supabase) {
  runConsistencyTests();
} else {
  console.log('ℹ️ Supabase not available. Run runConsistencyTests() when ready.');
}

// Export for manual testing
window.celebrationConsistencyTests = {
  extractCelebrationData,
  validateConsistency,
  testHookData,
  runConsistencyTests
};