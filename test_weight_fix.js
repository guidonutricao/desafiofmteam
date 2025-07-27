// Teste para verificar se o problema de precisão do peso foi corrigido

// Simular as funções utilitárias
function parseWeight(weightString) {
  if (!weightString || weightString.trim() === '') {
    return undefined;
  }

  const cleanWeight = weightString.trim();
  
  if (!/^\d+(\.\d{1,2})?$/.test(cleanWeight)) {
    return undefined;
  }

  const weight = parseFloat(cleanWeight);
  
  if (isNaN(weight) || weight < 30 || weight > 300) {
    return undefined;
  }

  return Math.round(weight * 10) / 10;
}

function formatWeight(weight) {
  if (weight === undefined || weight === null) {
    return 'Não informado';
  }

  return `${weight.toFixed(1)} kg`;
}

function weightToDatabase(weight) {
  return Math.round(weight * 100) / 100;
}

function weightFromDatabase(dbWeight) {
  if (dbWeight === null || dbWeight === undefined) {
    return undefined;
  }

  const weight = typeof dbWeight === 'string' ? parseFloat(dbWeight) : dbWeight;
  
  if (isNaN(weight)) {
    return undefined;
  }

  return Math.round(weight * 10) / 10;
}

// Testes
console.log('🧪 Testando correção de precisão do peso...\n');

// 1. Testar parseWeight
console.log('1. Testando parseWeight:');
const testInputs = ['75', '75.0', '75.1', '74.9', '75.99', '76.01'];
testInputs.forEach(input => {
  const result = parseWeight(input);
  console.log(`"${input}" -> ${result}`);
});

// 2. Testar formatWeight
console.log('\n2. Testando formatWeight:');
const testWeights = [75, 75.0, 75.1, 74.9, 75.99, undefined, null];
testWeights.forEach(weight => {
  const result = formatWeight(weight);
  console.log(`${weight} -> "${result}"`);
});

// 3. Testar weightToDatabase
console.log('\n3. Testando weightToDatabase:');
testWeights.filter(w => w !== undefined && w !== null).forEach(weight => {
  const result = weightToDatabase(weight);
  console.log(`${weight} -> ${result}`);
});

// 4. Testar weightFromDatabase
console.log('\n4. Testando weightFromDatabase:');
const dbValues = [75, 75.0, 74.9, 75.1, '75', '74.9', null, undefined];
dbValues.forEach(value => {
  const result = weightFromDatabase(value);
  console.log(`${value} (${typeof value}) -> ${result}`);
});

// 5. Testar fluxo completo
console.log('\n5. Testando fluxo completo (input -> parse -> database -> display):');
const completeTestInputs = ['75', '75.0', '74.9', '75.1'];
completeTestInputs.forEach(input => {
  console.log(`\nInput: "${input}"`);
  
  const parsed = parseWeight(input);
  console.log(`  Parsed: ${parsed}`);
  
  if (parsed !== undefined) {
    const forDb = weightToDatabase(parsed);
    console.log(`  Para DB: ${forDb}`);
    
    const fromDb = weightFromDatabase(forDb);
    console.log(`  Do DB: ${fromDb}`);
    
    const display = formatWeight(fromDb);
    console.log(`  Display: "${display}"`);
  }
});

// 6. Testar cenário específico do problema (75 -> 74.9)
console.log('\n6. Testando cenário específico:');
const problematicInput = '75';
console.log(`Input problemático: "${problematicInput}"`);

const step1 = parseWeight(problematicInput);
console.log(`Após parseWeight: ${step1}`);

const step2 = weightToDatabase(step1);
console.log(`Após weightToDatabase: ${step2}`);

const step3 = weightFromDatabase(step2);
console.log(`Após weightFromDatabase: ${step3}`);

const step4 = formatWeight(step3);
console.log(`Exibição final: "${step4}"`);

console.log('\n✅ Teste concluído!');
console.log('💡 Se todos os valores estão corretos, o problema foi resolvido.');

// Executar o teste
if (typeof module !== 'undefined' && require.main === module) {
  // Executado diretamente
}