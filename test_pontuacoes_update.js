import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestData() {
  console.log('🚀 Inserindo dados de teste...\n');

  try {
    // Dados de teste
    const testUsers = [
      {
        user_id: '11111111-1111-1111-1111-111111111111',
        nome: 'Guido',
        foto_url: null,
        pontuacao_total: 1400,
        dias_consecutivos: 8
      },
      {
        user_id: '22222222-2222-2222-2222-222222222222',
        nome: 'Teste',
        foto_url: null,
        pontuacao_total: 650,
        dias_consecutivos: 5
      },
      {
        user_id: '33333333-3333-3333-3333-333333333333',
        nome: 'Fabricio Moura',
        foto_url: null,
        pontuacao_total: 500,
        dias_consecutivos: 3
      }
    ];

    // Inserir perfis
    console.log('📝 Inserindo perfis...');
    for (const user of testUsers) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.user_id,
          nome: user.nome,
          foto_url: user.foto_url
        });

      if (profileError) {
        console.log(`❌ Erro ao inserir perfil ${user.nome}:`, profileError.message);
      } else {
        console.log(`✅ Perfil ${user.nome} inserido/atualizado`);
      }
    }

    // Inserir pontuações
    console.log('\n🏆 Inserindo pontuações...');
    for (const user of testUsers) {
      const { error: pontuacaoError } = await supabase
        .from('pontuacoes')
        .upsert({
          user_id: user.user_id,
          pontuacao_total: user.pontuacao_total,
          dias_consecutivos: user.dias_consecutivos,
          ultima_data_participacao: new Date().toISOString().split('T')[0]
        });

      if (pontuacaoError) {
        console.log(`❌ Erro ao inserir pontuação ${user.nome}:`, pontuacaoError.message);
      } else {
        console.log(`✅ Pontuação ${user.nome} inserida/atualizada: ${user.pontuacao_total} pts`);
      }
    }

    // Verificar dados inseridos
    console.log('\n🔍 Verificando dados inseridos...');
    const { data: rankingData, error: rankingError } = await supabase
      .from('pontuacoes')
      .select(`
        user_id,
        pontuacao_total,
        dias_consecutivos,
        profiles!inner(nome, foto_url)
      `)
      .order('pontuacao_total', { ascending: false });

    if (rankingError) {
      console.log('❌ Erro ao verificar dados:', rankingError.message);
    } else {
      console.log(`✅ Dados verificados - ${rankingData?.length || 0} registros encontrados:`);
      rankingData?.forEach((user, index) => {
        console.log(`${index + 1}. ${user.profiles.nome} - ${user.pontuacao_total} pts (${user.dias_consecutivos} dias)`);
      });
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

insertTestData();