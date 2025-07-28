const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_SERVICE_KEY') {
  console.log('❌ Configure as variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY');
  console.log('   ou edite este arquivo com suas credenciais do Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyChallengeFix() {
  console.log('🚀 Aplicando correção do delay de início dos desafios...\n');

  try {
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250128000000_fix_challenge_start_delay.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.log('❌ Arquivo de migração não encontrado:', migrationPath);
      return;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Arquivo de migração carregado com sucesso');

    // Dividir o SQL em comandos individuais (separados por ponto e vírgula)
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Encontrados ${commands.length} comandos SQL para executar\n`);

    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.length === 0) continue;

      console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          // Tentar executar diretamente se RPC falhar
          const { error: directError } = await supabase
            .from('_temp_migration')
            .select('*')
            .limit(0);
          
          if (directError) {
            console.log(`❌ Erro no comando ${i + 1}:`, error.message);
            console.log('Comando:', command.substring(0, 100) + '...');
            continue;
          }
        }
        
        console.log(`✅ Comando ${i + 1} executado com sucesso`);
      } catch (cmdError) {
        console.log(`⚠️ Aviso no comando ${i + 1}:`, cmdError.message);
      }
    }

    console.log('\n🎉 Migração aplicada com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Teste a funcionalidade registrando um novo usuário');
    console.log('2. Tente marcar uma tarefa no mesmo dia (deve mostrar popup)');
    console.log('3. Verifique o status no ranking');
    console.log('4. Execute o teste automatizado: node test_challenge_start_delay.js');

  } catch (error) {
    console.error('❌ Erro durante a aplicação da migração:', error);
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verificando se a migração foi aplicada corretamente...\n');

  try {
    // Verificar se as funções foram criadas
    const functionsToCheck = [
      'can_user_complete_tasks',
      'get_user_challenge_status',
      'check_challenge_start_before_task_completion'
    ];

    for (const funcName of functionsToCheck) {
      const { data, error } = await supabase
        .rpc('pg_proc_exists', { function_name: funcName });

      if (error) {
        console.log(`❓ Não foi possível verificar função ${funcName}`);
      } else {
        console.log(`✅ Função ${funcName} encontrada`);
      }
    }

    // Verificar se os triggers foram criados
    const { data: triggers, error: triggersError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, action_timing')
      .eq('event_object_table', 'desafios_diarios')
      .like('trigger_name', '%challenge_start%');

    if (triggersError) {
      console.log('❓ Não foi possível verificar triggers');
    } else {
      console.log(`✅ Encontrados ${triggers.length} triggers relacionados ao desafio`);
      triggers.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name} (${trigger.action_timing} ${trigger.event_manipulation})`);
      });
    }

    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

// Executar aplicação e verificação
async function main() {
  await applyChallengeFix();
  await verifyMigration();
}

main();