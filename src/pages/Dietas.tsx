import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { Coffee, Utensils, Apple, Trophy } from 'lucide-react';

interface PlanoDetalhes {
  nome: string;
  descricao: string;
  faixaPeso: string;
  genero: 'masculino' | 'feminino';
  refeicoes: {
    refeicao01: string[];
    refeicao02: string[];
    refeicao03: string[];
    refeicao04: string[];
    refeicao05: string[];
  };
  horarios: string[];
  dicas: string[];
}

// Estrutura unificada com identificadores únicos
const todosOsPlanos: Record<string, PlanoDetalhes> = {
  // PLANOS MASCULINOS
  'masc-60kg': {
    nome: 'Plano até 60kg',
    descricao: 'Plano nutricional equilibrado para manutenção de peso',
    faixaPeso: 'Ideal para: até 60kg',
    genero: 'masculino',
    refeicoes: {
      refeicao01: [
        '1 Pão francês sem miolo (60g)',
        'Ovo inteiro - 2 unidades (100g)',
        'Mamão Papaia - 0.5 unidade média (155g)',
        'Café sem açúcar ou com adoçante - À vontade'
      ],
      refeicao02: [
        'Aveia - 20g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao03: [
        'Arroz branco ou integral cozido - 100g',
        'Feijão cozido - 50g',
        'Peito de frango cozido, assado ou grelhado - 100g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ],
      refeicao04: [
        'Iogurte desnatado, zero ou light - 1 unidade (170ml)',
        'Aveia - 20g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao05: [
        'Peito de frango cozido, assado ou grelhado - 150g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 150g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ]
    },
    horarios: [
      'Refeição 01: 7h – 9h',
      'Refeição 02: 10h – 11h',
      'Refeição 03: 12h – 14h',
      'Refeição 04: 15h – 17h',
      'Refeição 05: 19h – 21h'
    ],
    dicas: [
      'Beba 2-3 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  },

  'masc-70kg': {
    nome: 'Plano 60-70kg',
    descricao: 'Plano nutricional balanceado para energia sustentada',
    faixaPeso: 'Ideal para: 60kg - 70kg',
    genero: 'masculino',
    refeicoes: {
      refeicao01: [
        '1 Pão francês sem miolo (60g)',
        'Ovo inteiro - 3 unidades (150g)',
        'Mamão Papaia - 0.5 unidade média (155g)',
        'Café sem açúcar ou com adoçante - À vontade'
      ],
      refeicao02: [
        'Aveia - 30g',
        'Banana - 2 unidades médias (140g)'
      ],
      refeicao03: [
        'Arroz branco ou integral cozido - 100g',
        'Feijão cozido - 50g',
        'Peito de frango cozido, assado ou grelhado - 100g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ],
      refeicao04: [
        'Iogurte desnatado, zero ou light - 1 unidade (170ml)',
        'Aveia - 20g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao05: [
        'Peito de frango cozido, assado ou grelhado - 100g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 150g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ]
    },
    horarios: [
      'Refeição 01: 7h – 9h',
      'Refeição 02: 10h – 11h',
      'Refeição 03: 12h – 14h',
      'Refeição 04: 15h – 17h',
      'Refeição 05: 19h – 21h'
    ],
    dicas: [
      'Beba 2-3 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  },

  'masc-80kg': {
    nome: 'Plano 70-80kg',
    descricao: 'Plano nutricional robusto para maior demanda energética',
    faixaPeso: 'Ideal para: 70kg - 80kg',
    genero: 'masculino',
    refeicoes: {
      refeicao01: [
        '1 Pão francês sem miolo (60g)',
        'Ovo inteiro - 3 unidades (150g)',
        'Mamão Papaia - 1 unidade média (310g)',
        'Café sem açúcar ou com adoçante - À vontade'
      ],
      refeicao02: [
        'Aveia - 30g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao03: [
        'Arroz branco ou integral cozido - 125g',
        'Feijão cozido - 80g',
        'Peito de frango cozido, assado ou grelhado - 100g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ],
      refeicao04: [
        'Iogurte desnatado, zero ou light - 1 unidade (170ml)',
        'Granola Zero ou Light - 30g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao05: [
        'Arroz branco ou integral cozido - 100g',
        'Peito de frango cozido, assado ou grelhado - 100g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ]
    },
    horarios: [
      'Refeição 01: 7h – 9h',
      'Refeição 02: 10h – 11h',
      'Refeição 03: 12h – 14h',
      'Refeição 04: 15h – 17h',
      'Refeição 05: 19h – 21h'
    ],
    dicas: [
      'Beba 2-3 litros de água por dia',
      'Evite frituras e doces',
      'Mantenha bem os alimentos',
      'Respeite os intervalos entre refeições'
    ]
  },

  'masc-80kg-veg': {
    nome: 'Plano 70-80kg (Vegetariano)',
    descricao: 'Plano nutricional vegetariano completo e balanceado',
    faixaPeso: 'Ideal para: 70kg - 80kg',
    genero: 'masculino',
    refeicoes: {
      refeicao01: [
        '1 Pão francês sem miolo (60g)',
        'Ovo inteiro - 3 unidades (150g)',
        'Mamão Papaia - 1 unidade média (310g)',
        'Café sem açúcar ou com adoçante - À vontade'
      ],
      refeicao02: [
        'Aveia - 30g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao03: [
        'Arroz branco ou integral cozido - 150g',
        'Feijão cozido - 80g',
        'Ovo inteiro - 2 unidades (100g)',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ],
      refeicao04: [
        'Iogurte desnatado, zero ou light - 1 unidade (170ml)',
        'Granola Zero ou Light - 30g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao05: [
        'Arroz branco ou integral cozido - 100g',
        'Ovo inteiro - 2 unidades (100g)',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ]
    },
    horarios: [
      'Refeição 01: 7h – 9h',
      'Refeição 02: 10h – 11h',
      'Refeição 03: 12h – 14h',
      'Refeição 04: 15h – 17h',
      'Refeição 05: 19h – 21h'
    ],
    dicas: [
      'Beba 2-3 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  },

  'masc-90kg': {
    nome: 'Plano 80-90kg',
    descricao: 'Plano nutricional intensivo para alta demanda energética',
    faixaPeso: 'Ideal para: 80kg - 90kg',
    genero: 'masculino',
    refeicoes: {
      refeicao01: [
        '1 Pão francês sem miolo (60g)',
        'Ovo inteiro - 3 unidades (150g)',
        'Mamão Papaia - 1 unidade média (310g)',
        'Café sem açúcar ou com adoçante - À vontade'
      ],
      refeicao02: [
        'Aveia - 30g',
        'Banana - 2 unidades médias (140g)'
      ],
      refeicao03: [
        'Arroz branco ou integral cozido - 150g',
        'Feijão cozido - 80g',
        'Peito de frango cozido, assado ou grelhado - 150g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ],
      refeicao04: [
        'Iogurte desnatado, zero ou light - 1 unidade (170ml)',
        'Granola Zero ou Light - 40g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao05: [
        'Arroz branco ou integral cozido - 100g',
        'Peito de frango cozido, assado ou grelhado - 125g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ]
    },
    horarios: [
      'Refeição 01: 7h – 9h',
      'Refeição 02: 10h – 11h',
      'Refeição 03: 12h – 14h',
      'Refeição 04: 15h – 17h',
      'Refeição 05: 19h – 21h'
    ],
    dicas: [
      'Beba 3-4 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  },

  'masc-90kg+': {
    nome: 'Plano 90kg ou mais',
    descricao: 'Plano nutricional completo para máxima performance',
    faixaPeso: 'Ideal para: 90kg ou mais',
    genero: 'masculino',
    refeicoes: {
      refeicao01: [
        '1 Pão francês sem miolo (60g)',
        'Ovo inteiro - 3 unidades (150g)',
        'Mamão Papaia - 1 unidade média (310g)',
        'Café sem açúcar ou com adoçante - À vontade'
      ],
      refeicao02: [
        'Aveia - 30g',
        'Mel de abelha - 10g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao03: [
        'Arroz branco ou integral cozido - 150g',
        'Feijão cozido - 80g',
        'Peito de frango cozido, assado ou grelhado - 125g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ],
      refeicao04: [
        'Iogurte desnatado, zero ou light - 1 unidade (170ml)',
        'Granola Zero ou Light - 40g',
        'Banana - 2 unidades médias (140g)'
      ],
      refeicao05: [
        'Arroz branco ou integral cozido - 150g',
        'Peito de frango cozido, assado ou grelhado - 150g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 150g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ]
    },
    horarios: [
      'Refeição 01: 7h – 9h',
      'Refeição 02: 10h – 11h',
      'Refeição 03: 12h – 14h',
      'Refeição 04: 15h – 17h',
      'Refeição 05: 19h – 21h'
    ],
    dicas: [
      'Beba 3-4 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  },

  // PLANOS FEMININOS
  'fem-60kg': {
    nome: 'Plano até 60kg',
    descricao: 'Plano nutricional equilibrado para manutenção de peso',
    faixaPeso: 'Ideal para: até 60kg',
    genero: 'feminino',
    refeicoes: {
      refeicao01: [
        '1 pão francês sem miolo (40g)',
        'Ovo inteiro – 2 unidades (100g)',
        'Mamão papaia – 0,5 unidade média (155g)',
        'Café sem açúcar ou com adoçante – à vontade'
      ],
      refeicao02: [
        'Aveia – 20g',
        'Banana – 1 unidade pequena (60g)'
      ],
      refeicao03: [
        'Arroz cozido – 80g',
        'Feijão cozido – 60g',
        'Peito de frango grelhado – 100g',
        'Legumes cozidos – à vontade',
        'Salada crua (folhas, tomate e cebola, sem azeite) – à vontade'
      ],
      refeicao04: [
        'Iogurte desnatado – 1 unidade (170ml)',
        'Granola light – 30g',
        'Banana – 1 unidade pequena (60g)'
      ],
      refeicao05: [
        'Arroz cozido – 80g',
        'Peito de frango grelhado – 100g',
        'Legumes cozidos – 100g',
        'Salada crua – à vontade'
      ]
    },
    horarios: [
      'Refeição 01: 7h – 9h',
      'Refeição 02: 10h – 11h',
      'Refeição 03: 12h – 14h',
      'Refeição 04: 15h – 17h',
      'Refeição 05: 19h – 21h'
    ],
    dicas: [
      'Beba 2-3 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  },

  'fem-70kg': {
    nome: 'Plano 60-70kg',
    descricao: 'Plano nutricional balanceado para energia sustentada',
    faixaPeso: 'Ideal para: 60kg - 70kg',
    genero: 'feminino',
    refeicoes: {
      refeicao01: [
        '1 Pão francês sem miolo (40g)',
        'Ovo inteiro - 2 unidades (100g)',
        'Mamão Papaia - 0.5 unidade média (155g)',
        'Café sem açúcar ou com adoçante - À vontade'
      ],
      refeicao02: [
        'Aveia - 15g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao03: [
        'Arroz branco ou integral cozido - 75g',
        'Feijão cozido - 50g',
        'Peito de frango cozido, assado ou grelhado - 100g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ],
      refeicao04: [
        'Iogurte desnatado, zero ou light - 1 unidade (170ml)',
        'Aveia - 20g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao05: [
        'Peito de frango cozido, assado ou grelhado - 100g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 150g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ]
    },
    horarios: [
      'Refeição 01: 7h – 9h',
      'Refeição 02: 10h – 11h',
      'Refeição 03: 12h – 14h',
      'Refeição 04: 15h – 17h',
      'Refeição 05: 19h – 21h'
    ],
    dicas: [
      'Beba 2-3 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  },

  'fem-80kg': {
    nome: 'Plano 70-80kg',
    descricao: 'Plano nutricional robusto para maior demanda energética',
    faixaPeso: 'Ideal para: 70kg - 80kg',
    genero: 'feminino',
    refeicoes: {
      refeicao01: [
        '1 Pão francês sem miolo (40g)',
        'Ovo inteiro - 2 unidades (100g)',
        'Mamão Papaia - 0.5 unidade média (155g)',
        'Café sem açúcar ou com adoçante - À vontade'
      ],
      refeicao02: [
        'Aveia - 25g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao03: [
        'Arroz branco ou integral cozido - 100g',
        'Feijão cozido - 80g',
        'Peito de frango cozido, assado ou grelhado - 100g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ],
      refeicao04: [
        'Iogurte desnatado, zero ou light - 1 unidade (170ml)',
        'Granola Zero ou Light - 30g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao05: [
        'Arroz branco ou integral cozido - 100g',
        'Peito de frango cozido, assado ou grelhado - 100g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ]
    },
    horarios: [
      'Refeição 01: 7h – 9h',
      'Refeição 02: 10h – 11h',
      'Refeição 03: 12h – 14h',
      'Refeição 04: 15h – 17h',
      'Refeição 05: 19h – 21h'
    ],
    dicas: [
      'Beba 2-3 litros de água por dia',
      'Evite frituras e doces',
      'Mantenha bem os alimentos',
      'Respeite os intervalos entre refeições'
    ]
  },

  'fem-80kg-veg': {
    nome: 'Plano 70-80kg (Vegetariano)',
    descricao: 'Plano nutricional vegetariano completo e balanceado',
    faixaPeso: 'Ideal para: 70kg - 80kg',
    genero: 'feminino',
    refeicoes: {
      refeicao01: [
        '1 Pão francês sem miolo (40g)',
        'Ovo inteiro - 2 unidades (100g)',
        'Mamão Papaia - 0.5 unidade média (155g)',
        'Café sem açúcar ou com adoçante - À vontade'
      ],
      refeicao02: [
        'Aveia - 25g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao03: [
        'Arroz branco ou integral cozido - 100g',
        'Feijão cozido - 80g',
        'Ovo inteiro - 2 unidades (100g)',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ],
      refeicao04: [
        'Iogurte desnatado, zero ou light - 1 unidade (170ml)',
        'Granola Zero ou Light - 30g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao05: [
        'Arroz branco ou integral cozido - 100g',
        'Ovo inteiro - 2 unidades (100g)',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ]
    },
    horarios: [
      'Refeição 01: 7h – 9h',
      'Refeição 02: 10h – 11h',
      'Refeição 03: 12h – 14h',
      'Refeição 04: 15h – 17h',
      'Refeição 05: 19h – 21h'
    ],
    dicas: [
      'Beba 2-3 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  },

  'fem-90kg': {
    nome: 'Plano 80-90kg',
    descricao: 'Plano nutricional intensivo para alta demanda energética',
    faixaPeso: 'Ideal para: 80kg - 90kg',
    genero: 'feminino',
    refeicoes: {
      refeicao01: [
        '1 Pão francês sem miolo (40g)',
        'Ovo inteiro - 3 unidades (150g)',
        'Mamão Papaia - 0.5 unidade média (155g)',
        'Café sem açúcar ou com adoçante - À vontade'
      ],
      refeicao02: [
        'Aveia - 25g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao03: [
        'Arroz branco ou integral cozido - 100g',
        'Feijão cozido - 80g',
        'Peito de frango cozido, assado ou grelhado - 125g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ],
      refeicao04: [
        'Iogurte desnatado, zero ou light - 1 unidade (170ml)',
        'Granola Zero ou Light - 40g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao05: [
        'Arroz branco ou integral cozido - 100g',
        'Peito de frango cozido, assado ou grelhado - 125g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) - 100g',
        'Salada de folhas, tomate e cebola (sem azeite) - À vontade'
      ]
    },
    horarios: [
      'Refeição 01: 7h – 9h',
      'Refeição 02: 10h – 11h',
      'Refeição 03: 12h – 14h',
      'Refeição 04: 15h – 17h',
      'Refeição 05: 19h – 21h'
    ],
    dicas: [
      'Beba 3-4 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  },

  'fem-90kg+': {
    nome: 'Plano 90kg ou mais',
    descricao: 'Plano nutricional completo para máxima performance',
    faixaPeso: 'Ideal para: 90kg ou mais',
    genero: 'feminino',
    refeicoes: {
      refeicao01: [
        '1 pão francês sem miolo (40g)',
        'Ovo inteiro – 3 unidades (150g)',
        'Mamão Papaia – 0,5 unidade média (155g)',
        'Café sem açúcar ou com adoçante – À vontade'
      ],
      refeicao02: [
        'Aveia - 30g',
        'Mel de abelha - 10g',
        'Banana - 1 unidade média (70g)'
      ],
      refeicao03: [
        'Arroz branco ou integral cozido – 125g',
        'Feijão cozido – 80g',
        'Peito de frango cozido, assado ou grelhado – 125g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) – 100g',
        'Salada de folhas, tomate e cebola (sem azeite) – À vontade'
      ],
      refeicao04: [
        'Iogurte desnatado, zero ou light – 1 unidade (170ml)',
        'Granola Zero ou Light – 40g',
        'Banana – 2 unidade média (140g)'
      ],
      refeicao05: [
        'Arroz branco ou integral cozido – 125g',
        'Peito de frango cozido, assado ou grelhado – 150g',
        'Legumes crus ou cozidos (cenoura, beterraba, couve flor, brócolis, etc) – 150g',
        'Salada de folhas, tomate e cebola (sem azeite) – À vontade'
      ]
    },
    horarios: [
      'Refeição 01: 7h – 9h',
      'Refeição 02: 10h – 11h',
      'Refeição 03: 12h – 14h',
      'Refeição 04: 15h – 17h',
      'Refeição 05: 19h – 21h'
    ],
    dicas: [
      'Beba 3-4 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  }
};

// Função para obter planos filtrados por gênero
const obterPlanosPorGenero = (genero: 'masculino' | 'feminino') => {
  return Object.entries(todosOsPlanos)
    .filter(([_, plano]) => plano.genero === genero)
    .reduce((acc, [key, plano]) => {
      // Remove o prefixo do gênero para manter a interface limpa
      const keyLimpa = key.replace(/^(masc|fem)-/, '');
      acc[keyLimpa] = plano;
      return acc;
    }, {} as Record<string, PlanoDetalhes>);
};

export default function Dietas() {
  const [planoSelecionado, setPlanoSelecionado] = useState('80kg');
  const [generoSelecionado, setGeneroSelecionado] = useState<'masculino' | 'feminino'>('masculino');

  // Nova lógica: filtra planos por gênero usando identificadores únicos
  const planosDetalhados = obterPlanosPorGenero(generoSelecionado);
  const plano = planosDetalhados[planoSelecionado];

  return (
    <div className="min-h-screen text-white p-6 pb-6 lg:pb-6" style={{ backgroundColor: '#0B111F' }}>
      <div className="space-y-6">
        {/* Header com título centralizado e toggle de gênero */}
        <div className="text-center space-y-4 relative">
          {/* Toggle de Gênero - Responsivo */}
          <div className="absolute top-0 right-0 sm:right-0 max-sm:relative max-sm:flex max-sm:justify-center max-sm:mb-4">
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1 gap-1 max-sm:scale-90">
              <Toggle
                pressed={generoSelecionado === 'masculino'}
                onPressedChange={() => setGeneroSelecionado('masculino')}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${generoSelecionado === 'masculino'
                  ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                👨 Masculino
              </Toggle>
              <Toggle
                pressed={generoSelecionado === 'feminino'}
                onPressedChange={() => setGeneroSelecionado('feminino')}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${generoSelecionado === 'feminino'
                  ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                👩 Feminino
              </Toggle>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
            <Trophy className="w-5 h-5" />
            Planos Alimentares Shape Express
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto diet-item">
            Planos nutricionais personalizados para todos os pesos. Escolha o plano ideal para seus objetivos.
          </p>
        </div>

        {/* Botões de Seleção */}
        <div className="flex flex-wrap gap-3 justify-center">
          {Object.entries(planosDetalhados).map(([key, plano]) => (
            <Button
              key={key}
              variant={planoSelecionado === key ? "default" : "outline"}
              onClick={() => setPlanoSelecionado(key)}
              className={`${planoSelecionado === key
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:opacity-90 text-white'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
            >
              <Apple className="w-4 h-4" />
              <span className="ml-2">{plano.nome}</span>
            </Button>
          ))}
        </div>

        {/* Grid de Refeições Premium */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {/* Refeição 01 */}
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 text-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-200/30 to-yellow-200/30 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400 to-yellow-400 shadow-lg">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">☕</span>
                    <span className="diet-title text-gray-800">Refeição 01</span>
                  </div>
                  <p className="diet-description text-gray-600 mt-1">Energia para começar o dia</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              {plano.refeicoes.refeicao01.map((item, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-100 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/90">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex-shrink-0"></div>
                    <p className="text-gray-800 diet-item font-medium leading-relaxed">{item}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Refeição 02 */}
          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 text-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 shadow-lg">
                  <Apple className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍎</span>
                    <span className="diet-title text-gray-800">Refeição 02</span>
                  </div>
                  <p className="diet-description text-gray-600 mt-1">Lanche da manhã</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              {plano.refeicoes.refeicao02.map((item, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-pink-100 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/90">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex-shrink-0"></div>
                    <p className="text-gray-800 diet-item font-medium leading-relaxed">{item}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Refeição 03 */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 shadow-lg">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍽️</span>
                    <span className="diet-title text-gray-800">Refeição 03</span>
                  </div>
                  <p className="diet-description text-gray-600 mt-1">Refeição principal do dia</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              {plano.refeicoes.refeicao03.map((item, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-100 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/90">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex-shrink-0"></div>
                    <p className="text-gray-800 diet-item font-medium leading-relaxed">{item}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Refeição 04 */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 text-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-violet-200/30 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-violet-400 shadow-lg">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥤</span>
                    <span className="diet-title text-gray-800">Refeição 04</span>
                  </div>
                  <p className="diet-description text-gray-600 mt-1">Lanche da tarde</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              {plano.refeicoes.refeicao04.map((item, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/90">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full flex-shrink-0"></div>
                    <p className="text-gray-800 diet-item font-medium leading-relaxed">{item}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Refeição 05 */}
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 text-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-400 shadow-lg">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌙</span>
                    <span className="diet-title text-gray-800">Refeição 05</span>
                  </div>
                  <p className="diet-description text-gray-600 mt-1">Refeição noturna leve</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              {plano.refeicoes.refeicao05.map((item, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/90">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full flex-shrink-0"></div>
                    <p className="text-gray-800 diet-item font-medium leading-relaxed">{item}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Informações Adicionais */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Horários */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500">
                  <Coffee className="w-5 h-5 text-white" />
                </div>
                Horários Recomendados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plano.horarios.map((horario, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                  <span className="text-gray-300">{horario}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-400 to-teal-500">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                Dicas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plano.dicas.map((dica, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-teal-500 rounded-full"></div>
                  <span className="text-gray-300">{dica}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* App de Substituição de Alimentos */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-400 to-red-500">
                  <Apple className="w-5 h-5 text-white" />
                </div>
                App de Substituição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-gray-300 text-sm leading-relaxed">
                <p className="mb-3">
                  Descubra alternativas nutricionalmente equivalentes para seus alimentos favoritos com nossa calculadora inteligente.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
                    <span>Substituições precisas</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
                    <span>Baseado em dados nutricionais</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
                    <span>Ideal para planejamento alimentar</span>
                  </div>
                </div>
              </div>
              <a
                href="https://quantocomer.com.br/fabriciomoura/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <Apple className="w-4 h-4 mr-2" />
                Acessar App
                <span className="ml-2 text-xs">↗</span>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}