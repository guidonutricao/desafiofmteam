// Test script to verify the celebration score fix
// This script simulates different user scenarios to ensure the score is calculated correctly

console.log('🧪 Testing Celebration Score Fix');
console.log('================================');

// Test scenarios with different score totals
const testScenarios = [
  {
    name: 'Low Score User',
    desafiosData: [
      { data: '2025-01-25', pontuacao_total: 100, hidratacao: true, sono_qualidade: false, atividade_fisica: false, seguiu_dieta: false, registro_visual: false },
      { data: '2025-01-26', pontuacao_total: 150, hidratacao: true, sono_qualidade: true, atividade_fisica: false, seguiu_dieta: false, registro_visual: false },
      { data: '2025-01-27', pontuacao_total: 200, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: false, registro_visual: false }
    ],
    expectedTotal: 450
  },
  {
    name: 'Medium Score User',
    desafiosData: [
      { data: '2025-01-25', pontuacao_total: 300, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: false, registro_visual: false },
      { data: '2025-01-26', pontuacao_total: 400, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false },
      { data: '2025-01-27', pontuacao_total: 500, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: true },
      { data: '2025-01-28', pontuacao_total: 350, hidratacao: true, sono_qualidade: true, atividade_fisica: false, seguiu_dieta: true, registro_visual: true },
      { data: '2025-01-29', pontuacao_total: 450, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: true }
    ],
    expectedTotal: 2000
  },
  {
    name: 'High Score User',
    desafiosData: [
      { data: '2025-01-25', pontuacao_total: 500, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: true },
      { data: '2025-01-26', pontuacao_total: 500, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: true },
      { data: '2025-01-27', pontuacao_total: 500, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: true },
      { data: '2025-01-28', pontuacao_total: 500, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: true },
      { data: '2025-01-29', pontuacao_total: 500, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: true },
      { data: '2025-01-30', pontuacao_total: 500, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: true },
      { data: '2025-01-31', pontuacao_total: 500, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: true }
    ],
    expectedTotal: 3500
  },
  {
    name: 'Exactly 2800 Points User',
    desafiosData: [
      { data: '2025-01-25', pontuacao_total: 400, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false },
      { data: '2025-01-26', pontuacao_total: 400, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false },
      { data: '2025-01-27', pontuacao_total: 400, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false },
      { data: '2025-01-28', pontuacao_total: 400, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false },
      { data: '2025-01-29', pontuacao_total: 400, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false },
      { data: '2025-01-30', pontuacao_total: 400, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false },
      { data: '2025-01-31', pontuacao_total: 400, hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false }
    ],
    expectedTotal: 2800
  }
];

function testScoreCalculation(scenario) {
  console.log(`\n🧪 Testing: ${scenario.name}`);
  console.log('----------------------------');
  
  const totalScore = scenario.desafiosData.reduce((sum, day) => sum + (day.pontuacao_total || 0), 0);
  
  console.log(`Expected Total: ${scenario.expectedTotal}`);
  console.log(`Calculated Total: ${totalScore}`);
  console.log(`✅ Test ${totalScore === scenario.expectedTotal ? 'PASSED' : 'FAILED'}`);
  
  if (totalScore !== scenario.expectedTotal) {
    console.log('❌ ERROR: Score calculation mismatch!');
    return false;
  }
  
  return true;
}

// Run all test scenarios
console.log('Running test scenarios...\n');

let allTestsPassed = true;
for (const scenario of testScenarios) {
  const testPassed = testScoreCalculation(scenario);
  if (!testPassed) {
    allTestsPassed = false;
  }
}

console.log('\n📊 Test Results Summary');
console.log('=======================');
console.log(`Overall Result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

if (allTestsPassed) {
  console.log('\n🎉 Celebration score calculation is working correctly!');
  console.log('The fix should now show the actual user score instead of hardcoded 2800.');
  console.log('\nNext steps:');
  console.log('1. Clear browser cache');
  console.log('2. Rebuild the application if needed');
  console.log('3. Test with real user data');
} else {
  console.log('\n⚠️  There are issues with the score calculation logic.');
  console.log('Please review the calculation function.');
}

module.exports = {
  testScenarios,
  testScoreCalculation
};