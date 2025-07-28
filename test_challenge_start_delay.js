const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testChallengeStartDelay() {
  console.log('🧪 Testando lógica de delay no início do desafio...\n');

  try {
    // Teste 1: Verificar se as funções foram criadas
    console.log('1. Verificando se as funções foram criadas...');
    
    const { data: functions, error: functionsError } = await supabase
      .rpc('pg_get_functiondef', { funcoid: 'public.can_user_complete_tasks'::regproc });
    
    if (functionsError) {
      console.log('❌ Função can_user_complete_tasks não encontrada');
    } else {
      console.log('✅ Função can_user_complete_tasks criada com sucesso');
    }

    // Teste 2: Verificar estrutura da tabela profiles
    console.log('\n2. Verificando estrutura da tabela profiles...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public')
      .in('column_name', ['challenge_start_date', 'challenge_completed_at']);

    if (columnsError) {
      console.log('❌ Erro ao verificar colunas:', columnsError.message);
    } else {
      console.log('✅ Colunas de desafio encontradas:', columns);
    }

    // Teste 3: Simular cenário de usuário que acabou de se registrar
    console.log('\n3. Simulando cenário de usuário recém-registrado...');
    
    // Criar um usuário de teste (você precisará ajustar isso para seu ambiente)
    const testUserId = 'test-user-' + Date.now();
    
    // Simular inserção de perfil com data de hoje
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: testUserId,
        nome: 'Usuário Teste',
        challenge_start_date: new Date().toISOString()
      });

    if (insertError) {
      console.log('❌ Erro ao inserir usuário teste:', insertError.message);
      return;
    }

    console.log('✅ Usuário teste criado com sucesso');

    // Teste 4: Verificar se usuário pode completar tarefas (deve ser false)
    console.log('\n4. Testando se usuário pode completar tarefas no mesmo dia...');
    
    const { data: canComplete, error: canCompleteError } = await supabase
      .rpc('can_user_complete_tasks', { user_id_param: testUserId });

    if (canCompleteError) {
      console.log('❌ Erro ao verificar se pode completar tarefas:', canCompleteError.message);
    } else {
      if (canComplete === false) {
        console.log('✅ Correto! Usuário NÃO pode completar tarefas no mesmo dia');
      } else {
        console.log('❌ Erro! Usuário pode completar tarefas no mesmo dia (deveria ser false)');
      }
    }

    // Teste 5: Verificar status completo do desafio
    console.log('\n5. Verificando status completo do desafio...');
    
    const { data: status, error: statusError } = await supabase
      .rpc('get_user_challenge_status', { user_id_param: testUserId });

    if (statusError) {
      console.log('❌ Erro ao obter status do desafio:', statusError.message);
    } else {
      console.log('✅ Status do desafio:', status[0]);
      
      const userStatus = status[0];
      if (userStatus.has_started && !userStatus.can_complete_tasks && userStatus.current_challenge_day === 0) {
        console.log('✅ Status correto: usuário iniciou mas não pode completar tarefas ainda');
      } else {
        console.log('❌ Status incorreto:', userStatus);
      }
    }

    // Teste 6: Tentar marcar uma tarefa (deve falhar)
    console.log('\n6. Tentando marcar uma tarefa (deve falhar)...');
    
    const { error: taskError } = await supabase
      .from('desafios_diarios')
      .insert({
        user_id: testUserId,
        data: new Date().toISOString().split('T')[0],
        hidratacao: true
      });

    if (taskError) {
      if (taskError.message.includes('CHALLENGE_NOT_STARTED')) {
        console.log('✅ Correto! Tarefa foi bloqueada com erro CHALLENGE_NOT_STARTED');
      } else {
        console.log('❌ Erro inesperado ao tentar marcar tarefa:', taskError.message);
      }
    } else {
      console.log('❌ Erro! Tarefa foi marcada quando deveria ter sido bloqueada');
    }

    // Limpeza: remover usuário teste
    console.log('\n7. Limpando dados de teste...');
    
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', testUserId);

    if (deleteError) {
      console.log('⚠️ Aviso: Erro ao limpar dados de teste:', deleteError.message);
    } else {
      console.log('✅ Dados de teste limpos com sucesso');
    }

    console.log('\n🎉 Teste concluído! Verifique os resultados acima.');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste
testChallengeStartDelay();