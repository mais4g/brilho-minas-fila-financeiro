import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Gera amostra/ a partir de dados/: os mesmos registros, com CNPJ e telefone
 * trocados por valores fictícios. É o que vai para o repositório, o CI e o Pages.
 *
 * - A troca é sequencial (1º CNPJ visto → 1º falso…), não um hash: não dá para
 *   voltar ao original por força bruta.
 * - CNPJs iguais continuam iguais (a duplicidade C001/C037 continua detectável),
 *   e o CNPJ falso tem dígitos verificadores válidos.
 * - Campo vazio continua vazio (o C038 continua "sem CNPJ").
 */

const raiz = resolve(import.meta.dirname, '..');
const ARQUIVOS = ['clientes', 'pedidos', 'produtos', 'titulos_financeiros', 'vendedores'] as const;

function digitoCnpj(base: number[]): number {
  const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const resto = base.reduce((soma, d, i) => soma + d * (pesos[i] ?? 0), 0) % 11;
  return resto < 2 ? 0 : 11 - resto;
}

function cnpjFicticio(n: number): string {
  const base = `${String(n).padStart(8, '0')}0001`.split('').map(Number);
  const d1 = digitoCnpj(base);
  const d2 = digitoCnpj([...base, d1]);
  const s = [...base, d1, d2].join('');
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8, 12)}-${s.slice(12)}`;
}

const telefoneFicticio = (n: number) => `+55 31 90000-${String(n).padStart(4, '0')}`;

function substituidor(gerar: (n: number) => string) {
  const mapa = new Map<string, string>();
  return (original: string) => {
    if (!original.trim()) return original;
    if (!mapa.has(original)) mapa.set(original, gerar(mapa.size + 1));
    return mapa.get(original) as string;
  };
}

export function mascararClientes(clientes: unknown): unknown {
  if (!Array.isArray(clientes)) return clientes;
  const cnpj = substituidor(cnpjFicticio);
  const telefone = substituidor(telefoneFicticio);
  return clientes.map((c: Record<string, unknown>) => ({
    ...c,
    ...(typeof c.cnpj === 'string' ? { cnpj: cnpj(c.cnpj) } : {}),
    ...(typeof c.telefone_whatsapp === 'string' ? { telefone_whatsapp: telefone(c.telefone_whatsapp) } : {}),
  }));
}

function principal() {
  const origem = resolve(raiz, 'dados');
  const destino = resolve(raiz, 'amostra');
  mkdirSync(destino, { recursive: true });
  for (const nome of ARQUIVOS) {
    const dados: unknown = JSON.parse(readFileSync(resolve(origem, `${nome}.json`), 'utf-8'));
    const saida = nome === 'clientes' ? mascararClientes(dados) : dados;
    writeFileSync(resolve(destino, `${nome}.json`), `${JSON.stringify(saida, null, 2)}\n`);
  }
  console.log('amostra/ gerada a partir de dados/ (CNPJ e telefone trocados por valores fictícios)');
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) principal();
