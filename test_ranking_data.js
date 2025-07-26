import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (usando variáveis de ambiente ou valores padrão)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRankingData() {
  console.log('🔍 Testando dados do ranking...\n');

  try {
    // 1. Testar se a view ranking_with_challenge_progress existe
    console.log('1. Testando view ranking_with_challenge_progress...');
    const { data: viewData, error: viewError } = await supabase
      .from('ranking_with_challenge_progress')
      .select('*')
      .limit(5);

    if (viewError) {
      console.log('❌ Erro na view ranking_with_challenge_progress:', viewError.message);
      
      // 2. Fallback: testar tabela pontuacoes diretamente
      console.log('\n2. Testando tabela pontuacoes diretamente...');
      const { data: pontuacoesData, error: pontuacoesError } = await supabase
        .from('pontuacoes')
        .select(`
          user_id,
          pontuacao_total,
          dias_consecutivos,
          ultima_data_participacao,
          profiles!inner(nome, foto_url)
        `)
        .order('pontuacao_total', { ascending: false })
        .limit(10);

      if (pontuacoesError) {
        console.log('❌ Erro na tabela pontuacoes:', pontuacoesError.message);
        
        // 3. Testar tabelas separadamente
        console.log('\n3. Testando tabelas separadamente...');
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, nome, foto_url')
          .limit(5);
          
        const { data: pontuacoesSimple, error: pontuacoesSimpleError } = await supabase
          .from('pontuacoes')
          .select('user_id, pontuacao_total, dias_consecutivos')
          .limit(5);

        console.log('Profiles:', profilesError ? `❌ ${profilesError.message}` : `✅ ${profilesData?.length || 0} registros`);
        console.log('Pontuacoes:', pontuacoesSimpleError ? `❌ ${pontuacoesSimpleError.message}` : `✅ ${pontuacoesSimple?.length || 0} registros`);
        
        if (profilesData && pontuacoesSimple) {
          console.log('\nDados encontrados:');
          console.log('Profiles:', profilesData);
          console.log('Pontuacoes:', pontuacoesSimple);
        }
      } else {
        console.log('✅ Tabela pontuacoes funcionando!');
        console.log(`Encontrados ${pontuacoesData?.length || 0} registros:`);
        pontuacoesData?.forEach((user, index) => {
          console.log(`${index + 1}. ${user.profiles.nome} - ${user.pontuacao_total} pts`);
        });
      }
    } else {
      console.log('✅ View ranking_with_challenge_progress funcionando!');
      console.log(`Encontrados ${viewData?.length || 0} registros:`);
      viewData?.forEach((user, index) => {
        console.log(`${index + 1}. ${user.nome} - ${user.total_points || user.pontuacao_total || 0} pts`);
      });
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testRankingData();