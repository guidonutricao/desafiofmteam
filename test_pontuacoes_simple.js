import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase local
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPontuacoesData() {
  console.log('🔍 Testando dados da tabela pontuacoes...\n');

  try {
    // Testar se conseguimos acessar a tabela pontuacoes
    const { data, error } = await supabase
      .from('pontuacoes')
      .select(`
        user_id,
        pontuacao_total,
        dias_consecutivos,
        profiles!inner(nome, foto_url)
      `)
      .order('pontuacao_total', { ascending: false });

    if (error) {
      console.log('❌ Erro ao acessar tabela pontuacoes:', error.message);
      
      // Tentar acessar as tabelas separadamente
      console.log('\n🔍 Testando tabelas separadamente...');
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, nome, foto_url');
        
      const { data: pontuacoes, error: pontuacoesError } = await supabase
        .from('pontuacoes')
        .select('user_id, pontuacao_total, dias_consecutivos');

      console.log('Profiles:', profilesError ? `❌ ${profilesError.message}` : `✅ ${profiles?.length || 0} registros`);
      console.log('Pontuacoes:', pontuacoesError ? `❌ ${pontuacoesError.message}` : `✅ ${pontuacoes?.length || 0} registros`);
      
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ Tabela pontuacoes está vazia');
      
      // Vamos verificar se há usuários na tabela profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, nome');
        
      if (profilesError) {
        console.log('❌ Erro ao verificar profiles:', profilesError.message);
        return;
      }
      
      if (profiles && profiles.length > 0) {
        console.log(`✅ Encontrados ${profiles.length} perfis, mas sem pontuações`);
        console.log('Perfis encontrados:', profiles.map(p => p.nome).join(', '));
      } else {
        console.log('⚠️ Nenhum perfil encontrado');
      }
      
      return;
    }

    console.log('✅ Dados encontrados na tabela pontuacoes!');
    console.log(`Total de registros: ${data.length}\n`);
    
    data.forEach((user, index) => {
      console.log(`${index + 1}. ${user.profiles.nome} - ${user.pontuacao_total} pontos (${user.dias_consecutivos} dias consecutivos)`);
    });

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testPontuacoesData();