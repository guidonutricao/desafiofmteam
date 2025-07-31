// Debug script to test celebration data flow
// This script helps identify where the score calculation might be going wrong

console.log('🔍 Celebration Data Debug Script');
console.log('================================');

// Mock data to test the transformation functions
const mockDesafiosData = [
  {
    data: '2025-01-25',
    pontuacao_total: 400,
    hidratacao: true,
    sono_qualidade: true,
    atividade_fisica: true,
    seguiu_dieta: true,
    registro_visual: false
  },
  {
    data: '2025-01-26',
    pontuacao_total: 500,
    hidratacao: true,
    sono_qualidade: true,
    atividade_fisica: true,
    seguiu_dieta: true,
    registro_visual: true
  },
  {
    data: '2025-01-27',
    pontuacao_total: 300,
    hidratacao: true,
    sono_qualidade: false,
    atividade_fisica: true,
    seguiu_dieta: true,
    registro_visual: false
  },
  {
    data: '2025-01-28',
    pontuacao_total: 450,
    hidratacao: true,
    sono_qualidade: true,
    atividade_fisica: true,
    seguiu_dieta: true,
    registro_visual: true
  },
  {
    data: '2025-01-29',
    pontuacao_total: 350,
    hidratacao: true,
    sono_qualidade: true,
    atividade_fisica: false,
    seguiu_dieta: true,
    registro_visual: true
  },
  {
    data: '2025-01-30',
    pontuacao_total: 400,
    hidratacao: true,
    sono_qualidade: true,
    atividade_fisica: true,
    seguiu_dieta: false,
    registro_visual: true
  },
  {
    data: '2025-01-31',
    pontuacao_total: 500,
    hidratacao: true,
    sono_qualidade: true,
    atividade_fisica: true,
    seguiu_dieta: true,
    registro_visual: true
  }
];

// Test the total score calculation
function testTotalScoreCalculation(data) {
  console.log('\n📊 Testing Total Score Calculation');
  console.log('----------------------------------');
  
  const totalScore = data.reduce((sum, day) => sum + (day.pontuacao_total || 0), 0);
  
  console.log('Daily scores:');
  data.forEach((day, index) => {
    console.log(`  Day ${index + 1}: ${day.pontuacao_total} points (${day.data})`);
  });
  
  console.log(`\n✅ Total Score: ${totalScore} points`);
  console.log(`📈 Average Score: ${Math.round(totalScore / data.length)} points`);
  
  return totalScore;
}

// Test the data transformation
function testDataTransformation(rawData) {
  console.log('\n🔄 Testing Data Transformation');
  console.log('------------------------------');
  
  const transformDailyData = (rawData) => {
    const fullWeekData = [];
    
    // Create complete 7-day structure
    for (let day = 1; day <= 7; day++) {
      const dayData = rawData.find(item => {
        if (item.day) return item.day === day;
        return rawData.indexOf(item) + 1 === day;
      });
      
      if (dayData) {
        const tasks = {
          hidratacao: dayData.hidratacao || false,
          sono_qualidade: dayData.sono_qualidade || false,
          atividade_fisica: dayData.atividade_fisica || false,
          seguiu_dieta: dayData.seguiu_dieta || false,
          registro_visual: dayData.registro_visual || false
        };
        
        const completedTasksCount = Object.values(tasks).filter(Boolean).length;
        const goals = [];
        if (tasks.hidratacao) goals.push('Hidratação');
        if (tasks.sono_qualidade) goals.push('Sono de qualidade');
        if (tasks.atividade_fisica) goals.push('Atividade física');
        if (tasks.seguiu_dieta) goals.push('Dieta');
        if (tasks.registro_visual) goals.push('Registro visual');
        
        fullWeekData.push({
          day,
          score: dayData.pontuacao_total || 0,
          date: dayData.data || new Date(Date.now() - (7 - day) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          goals,
          completed: completedTasksCount > 0,
          tasks_completed: tasks
        });
      } else {
        // Day without data - fill with zeros
        fullWeekData.push({
          day,
          score: 0,
          date: new Date(Date.now() - (7 - day) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          goals: [],
          completed: false,
          tasks_completed: {
            hidratacao: false,
            sono_qualidade: false,
            atividade_fisica: false,
            seguiu_dieta: false,
            registro_visual: false
          }
        });
      }
    }
    
    return fullWeekData;
  };
  
  const transformedData = transformDailyData(rawData);
  
  console.log('Transformed daily data:');
  transformedData.forEach(day => {
    console.log(`  Day ${day.day}: ${day.score} points, ${day.goals.length} goals completed`);
  });
  
  return transformedData;
}

// Test the complete flow
function testCompleteFlow() {
  console.log('\n🚀 Testing Complete Data Flow');
  console.log('=============================');
  
  // 1. Calculate total score
  const totalScore = testTotalScoreCalculation(mockDesafiosData);
  
  // 2. Transform data
  const dailyScores = testDataTransformation(mockDesafiosData);
  
  // 3. Create final challenge data structure
  const challengeData = {
    patientName: 'Test User',
    challengeDuration: 7,
    totalScore,
    dailyScores,
    achievements: [],
    stats: {
      perfectDays: 0,
      averageScore: Math.round(totalScore / 7),
      improvementPercent: 0,
      streakRecord: 0
    }
  };
  
  console.log('\n📋 Final Challenge Data:');
  console.log(`  Patient Name: ${challengeData.patientName}`);
  console.log(`  Total Score: ${challengeData.totalScore}`);
  console.log(`  Daily Scores Length: ${challengeData.dailyScores.length}`);
  console.log(`  Average Score: ${challengeData.stats.averageScore}`);
  
  return challengeData;
}

// Run the test
const result = testCompleteFlow();

console.log('\n✅ Debug completed successfully!');
console.log('If you see a hardcoded 2800 in the UI, check:');
console.log('1. The CelebrationPage.tsx component');
console.log('2. Make sure data.totalScore is being used correctly');
console.log('3. Check if there are any cached values or hardcoded numbers');

module.exports = {
  testTotalScoreCalculation,
  testDataTransformation,
  testCompleteFlow,
  mockDesafiosData
};