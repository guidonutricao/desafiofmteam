/**
 * Utilitários para manipulação de peso com precisão adequada
 */

/**
 * Converte string de peso para número com precisão controlada
 * @param weightString - String do peso (ex: "75", "75.0", "75.5")
 * @returns Número com precisão de 1 casa decimal ou undefined se inválido
 */
export function parseWeight(weightString: string | undefined): number | undefined {
  if (!weightString || weightString.trim() === '') {
    return undefined;
  }

  // Remover espaços e validar formato básico
  const cleanWeight = weightString.trim();
  
  // Validar se é um número válido
  if (!/^\d+(\.\d{1,2})?$/.test(cleanWeight)) {
    return undefined;
  }

  // Converter para número
  const weight = parseFloat(cleanWeight);
  
  // Validar range razoável (30kg a 300kg)
  if (isNaN(weight) || weight < 30 || weight > 300) {
    return undefined;
  }

  // Arredondar para 1 casa decimal para evitar problemas de precisão
  return Math.round(weight * 10) / 10;
}

/**
 * Formata peso para exibição
 * @param weight - Peso em número
 * @returns String formatada (ex: "75.0 kg", "75.5 kg")
 */
export function formatWeight(weight: number | undefined | null): string {
  if (weight === undefined || weight === null) {
    return 'Não informado';
  }

  // Garantir que sempre mostre pelo menos 1 casa decimal
  return `${weight.toFixed(1)} kg`;
}

/**
 * Converte peso para valor que será enviado ao banco
 * @param weight - Peso em número
 * @returns Número formatado para NUMERIC(6,2)
 */
export function weightToDatabase(weight: number): number {
  // Arredondar para 2 casas decimais (compatível com NUMERIC(6,2))
  return Math.round(weight * 100) / 100;
}

/**
 * Valida se o peso está em um range aceitável
 * @param weight - Peso para validar
 * @returns true se válido, false caso contrário
 */
export function isValidWeight(weight: number | undefined): boolean {
  if (weight === undefined || weight === null) {
    return false;
  }

  return weight >= 30 && weight <= 300 && !isNaN(weight);
}

/**
 * Converte peso do banco para exibição (garante precisão)
 * @param dbWeight - Peso vindo do banco de dados
 * @returns Número com precisão adequada
 */
export function weightFromDatabase(dbWeight: number | string | null | undefined): number | undefined {
  if (dbWeight === null || dbWeight === undefined) {
    return undefined;
  }

  const weight = typeof dbWeight === 'string' ? parseFloat(dbWeight) : dbWeight;
  
  if (isNaN(weight)) {
    return undefined;
  }

  // Garantir precisão adequada
  return Math.round(weight * 10) / 10;
}