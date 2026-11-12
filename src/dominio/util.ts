// Dinheiro em centavos (inteiro) para comparar com o limite sem erro de
// ponto flutuante: 0.1 + 0.2 !== 0.3, mas 10 + 20 === 30.
export const centavos = (reais: number): number => Math.round(reais * 100);
export const reais = (centavos: number): number => centavos / 100;

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Dias corridos de `de` até `ate` (datas AAAA-MM-DD), sem influência de fuso horário. */
export function diasEntre(de: string, ate: string): number {
  return Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / MS_POR_DIA);
}

export const somenteDigitos = (texto: string): string => texto.replace(/\D/g, '');
