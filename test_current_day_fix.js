// Test script to verify the current day calculation fix
// Run this with: node test_current_day_fix.js

console.log('🧪 Testing Current Day Calculation Fix');
console.log('=====================================');

// Simulate the calculateCurrentChallengeDay function
function calculateCurrentChallengeDay(challengeStartDate, progressData) {
  // Se temos uma data de início específica, usar ela
  if (challengeStartDate) {
    const startDate = new Date(challengeStartDate);
    const today = new Date();
    
    // Ajustar para timezone do Brasil (UTC-3)
    const brasiliaOffset = -3 * 60; // -3 horas em minutos
    const todayBrasilia = new Date(today.getTime() + (brasiliaOffset * 60 * 1000));
    const startDateBrasilia = new Date(startDate.getTime() + (brasiliaOffset * 60 * 1000));
    
    const diffTime = todayBrasilia.getTime() - startDateBrasilia.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 porque o primeiro dia é dia 1

    // Limitar entre 1 e 7 (ou 8 se completou)
    if (diffDays < 1) return 1;
    if (diffDays > 7) return 8; // Desafio completado
    return diffDays;
  }

  // Fallback: calcular baseado nos dados de progresso disponíveis
  if (progressData && progressData.length > 0) {
    // Encontrar o último dia com dados
    const daysWithData = progressData.filter(item => item.points > 0 || item.pontuacao_total > 0);
    
    if (daysWithData.length > 0) {
      // Se tem dados, o dia atual é o próximo dia após o último com dados
      const lastDayWithData = Math.max(...daysWithData.map(item => {
        // Se tem campo 'day', usar ele; senão calcular baseado no índice
        if ('day' in item) return item.day;
        return progressData.indexOf(item) + 1;
      }));
      
      // Se completou todos os 7 dias, retornar 8 (completado)
      if (lastDayWithData >= 7) return 8;
      
      // Senão, retornar o próximo dia
      return Math.min(lastDayWithData + 1, 7);
    }
  }

  // Se não tem dados nem data de início, assumir dia 1
  return 1;
}

// Test cases
console.log('\n📅 Test Case 1: User just started (today)');
const today = new Date();
const result1 = calculateCurrentChallengeDay(today, []);
console.log(`Expected: 1, Got: ${result1} ${result1 === 1 ? '✅' : '❌'}`);

console.log('\n📅 Test Case 2: User started 3 days ago');
const threeDaysAgo = new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000));
const result2 = calculateCurrentChallengeDay(threeDaysAgo, []);
console.log(`Expected: 4, Got: ${result2} ${result2 === 4 ? '✅' : '❌'}`);

console.log('\n📅 Test Case 3: User completed challenge (8 days ago)');
const eightDaysAgo = new Date(today.getTime() - (8 * 24 * 60 * 60 * 1000));
const result3 = calculateCurrentChallengeDay(eightDaysAgo, []);
console.log(`Expected: 8, Got: ${result3} ${result3 === 8 ? '✅' : '❌'}`);

console.log('\n📅 Test Case 4: No start date, but has progress data');
const progressData = [
  { day: 1, points: 100 },
  { day: 2, points: 80 },
  { day: 3, points: 0 }, // No data for day 3
];
const result4 = calculateCurrentChallengeDay(null, progressData);
console.log(`Expected: 3, Got: ${result4} ${result4 === 3 ? '✅' : '❌'}`);

console.log('\n📅 Test Case 5: No start date, no progress data');
const result5 = calculateCurrentChallengeDay(null, []);
console.log(`Expected: 1, Got: ${result5} ${result5 === 1 ? '✅' : '❌'}`);

console.log('\n📅 Test Case 6: User completed all 7 days');
const completedData = [
  { day: 1, points: 100 },
  { day: 2, points: 80 },
  { day: 3, points: 90 },
  { day: 4, points: 85 },
  { day: 5, points: 95 },
  { day: 6, points: 88 },
  { day: 7, points: 92 },
];
const result6 = calculateCurrentChallengeDay(null, completedData);
console.log(`Expected: 8, Got: ${result6} ${result6 === 8 ? '✅' : '❌'}`);

console.log('\n🎉 Current Day Calculation Fix Test Complete!');
console.log('The fix should now correctly calculate the current challenge day.');