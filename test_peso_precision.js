// Teste para verificar precisão do peso_inicial

console.log('🧪 Testando precisão do peso_inicial...\n');

// 1. Testar conversões JavaScript
const testValues = [75, 75.0, '75', '75.0', 75.1, '75.1'];

console.log('1. Testando conversões JavaScript:');
testValues.forEach(value => {
    const parsed = parseFloat(value);
    console.log(`${value} (${typeof value}) -> parseFloat: ${parsed} (${typeof parsed})`);
});

// 2. Testar conversões para string
console.log('\n2. Testando conversões para string:');
testValues.forEach(value => {
    const parsed = parseFloat(value);
    console.log(`${value} -> parseFloat -> toString: "${parsed.toString()}"`);
    console.log(`${value} -> parseFloat -> toFixed(1): "${parsed.toFixed(1)}"`);
    console.log(`${value} -> parseFloat -> toFixed(2): "${parsed.toFixed(2)}"`);
    console.log('---');
});

// 3. Simular o fluxo do formulário
console.log('\n3. Simulando fluxo do formulário:');

function simulateFormFlow(inputValue) {
    console.log(`\nInput do usuário: "${inputValue}"`);
    
    // Simular o que acontece no handleSignup
    const pesoInicial = inputValue ? parseFloat(inputValue) : undefined;
    console.log(`Após parseFloat: ${pesoInicial}`);
    
    // Simular o que vai para o Supabase metadata
    const metadata = {
        nome: 'Teste',
        peso_inicial: pesoInicial
    };
    console.log(`Metadata para Supabase:`, metadata);
    
    // Simular conversão SQL (NUMERIC(5,2))
    if (pesoInicial !== undefined) {
        const sqlValue = Math.round(pesoInicial * 100) / 100; // Simular NUMERIC(5,2)
        console.log(`Valor após conversão SQL NUMERIC(5,2): ${sqlValue}`);
        
        // Simular exibição no frontend
        const displayValue = `${sqlValue} kg`;
        console.log(`Valor exibido no frontend: "${displayValue}"`);
    }
}

// Testar diferentes inputs
simulateFormFlow('75');
simulateFormFlow('75.0');
simulateFormFlow('75.1');
simulateFormFlow('74.9');

// 4. Verificar problemas de ponto flutuante
console.log('\n4. Verificando problemas de ponto flutuante:');

const floatTests = [
    0.1 + 0.2,
    75.0,
    74.9,
    75.1,
    (75 * 100) / 100,
    parseFloat('75.0'),
    Number('75.0')
];

floatTests.forEach(value => {
    console.log(`${value} -> toString(): "${value.toString()}"`);
    console.log(`${value} -> JSON.stringify(): ${JSON.stringify(value)}`);
    console.log('---');
});

// 5. Testar cenário específico do problema
console.log('\n5. Testando cenário específico (75 -> 74.9):');

const userInput = '75';
const parsed = parseFloat(userInput);
console.log(`Input: "${userInput}"`);
console.log(`parseFloat: ${parsed}`);
console.log(`typeof: ${typeof parsed}`);
console.log(`toString: "${parsed.toString()}"`);
console.log(`JSON: ${JSON.stringify(parsed)}`);

// Simular possíveis problemas
const possibleIssues = [
    parsed - 0.1,  // Subtração acidental
    parsed * 0.999, // Multiplicação incorreta
    Math.floor(parsed * 10) / 10, // Arredondamento incorreto
    parseFloat(parsed.toFixed(1)) - 0.1, // Problema de precisão
];

console.log('\nPossíveis causas do problema:');
possibleIssues.forEach((value, index) => {
    console.log(`Causa ${index + 1}: ${value}`);
});

console.log('\n✅ Teste de precisão concluído!');
console.log('💡 Execute este script para identificar onde está o problema de arredondamento.');