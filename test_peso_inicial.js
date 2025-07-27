// Teste para verificar se o peso inicial está sendo salvo corretamente
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPesoInicial() {
  console.log('🧪 Testando funcionalidade de peso inicial...\n');

  try {
    // 1. Testar criação de usuário com peso inicial
    console.log('1. Testando criação de usuário com peso inicial...');
    
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'test123456';
    const testNome = 'Usuário Teste';
    const testPesoInicial = 75.5;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          nome: testNome,
          peso_inicial: testPesoInicial
        }
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError.message);
      return;
    }

    console.log('✅ Usuário criado com sucesso:', authData.user?.id);

    // 2. Aguardar um pouco para o trigger processar
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Verificar se o perfil foi criado com peso inicial
    console.log('\n2. Verificando se o perfil foi criado com peso inicial...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('nome, peso_inicial, peso_atual')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message);
      return;
    }

    console.log('📊 Dados do perfil:', profileData);

    // 4. Validar os dados
    if (profileData.peso_inicial === testPesoInicial) {
      console.log('✅ Peso inicial salvo corretamente:', profileData.peso_inicial, 'kg');
    } else {
      console.log('❌ Peso inicial não foi salvo corretamente');
      console.log('Esperado:', testPesoInicial);
      console.log('Recebido:', profileData.peso_inicial);
    }

    if (profileData.peso_atual === testPesoInicial) {
      console.log('✅ Peso atual inicializado corretamente:', profileData.peso_atual, 'kg');
    } else {
      console.log('❌ Peso atual não foi inicializado corretamente');
    }

    // 5. Testar atualização do peso atual (sem afetar o peso inicial)
    console.log('\n3. Testando atualização do peso atual...');
    
    const novoPesoAtual = 73.2;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ peso_atual: novoPesoAtual })
      .eq('user_id', authData.user.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar peso atual:', updateError.message);
      return;
    }

    // 6. Verificar se apenas o peso atual foi alterado
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('peso_inicial, peso_atual')
      .eq('user_id', authData.user.id)
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar perfil atualizado:', fetchError.message);
      return;
    }

    console.log('📊 Perfil após atualização:', updatedProfile);

    if (updatedProfile.peso_inicial === testPesoInicial && updatedProfile.peso_atual === novoPesoAtual) {
      console.log('✅ Peso inicial preservado e peso atual atualizado corretamente!');
    } else {
      console.log('❌ Erro na atualização dos pesos');
    }

    // 7. Limpeza - remover usuário de teste
    console.log('\n4. Limpando dados de teste...');
    
    // Primeiro fazer login para poder deletar
    await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    // Deletar usuário (isso também deletará o perfil devido ao CASCADE)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
    
    if (deleteError) {
      console.log('⚠️ Aviso: Não foi possível deletar o usuário de teste automaticamente');
      console.log('Por favor, delete manualmente o usuário:', authData.user.id);
    } else {
      console.log('✅ Usuário de teste removido com sucesso');
    }

    console.log('\n🎉 Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar o teste
if (require.main === module) {
  testPesoInicial();
}

module.exports = { testPesoInicial };