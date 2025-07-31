// Debug script to test celebration score calculation
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ixqjgfqhqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'your-anon-key'; // Replace with actual key

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCelebrationScore(userId) {
  console.log('🔍 Debugging celebration score calculation for user:', userId);
  
  try {
    // 1. Check desafios_diarios table
    console.log('\n📊 Checking desafios_diarios table...');
    const { data: desafiosData, error: desafiosError } = await supabase
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

    if (desafiosError) {
      console.error('❌ Error fetching desafios_diarios:', desafiosError);
    } else {
      console.log('✅ Desafios data found:', desafiosData?.length || 0, 'records');
      
      if (desafiosData && desafiosData.length > 0) {
        const totalFromDesafios = desafiosData.reduce((sum, day) => sum + (day.pontuacao_total || 0), 0);
        console.log('📈 Total score from desafios_diarios:', totalFromDesafios);
        
        desafiosData.forEach((day, index) => {
          console.log(`  Day ${index + 1}: ${day.pontuacao_total || 0} points (${day.data})`);
        });
      }
    }

    // 2. Check pontuacoes table as fallback
    console.log('\n📊 Checking pontuacoes table...');
    const { data: pontuacoesData, error: pontuacoesError } = await supabase
      .from('pontuacoes')
      .select('pontuacao_total')
      .eq('user_id', userId)
      .single();

    if (pontuacoesError) {
      console.error('❌ Error fetching pontuacoes:', pontuacoesError);
    } else {
      console.log('✅ Pontuacoes data:', pontuacoesData);
      console.log('📈 Total score from pontuacoes:', pontuacoesData?.pontuacao_total || 0);
    }

    // 3. Check user profile
    console.log('\n👤 Checking user profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('nome')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
    } else {
      console.log('✅ User profile:', profileData);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Example usage - replace with actual user ID
// debugCelebrationScore('user-id-here');

console.log('🚀 Celebration score debug script ready');
console.log('📝 Usage: debugCelebrationScore("your-user-id")');

module.exports = { debugCelebrationScore };