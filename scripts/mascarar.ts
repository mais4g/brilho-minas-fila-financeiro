import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Ferramenta para quando os dados forem REAIS: gera amostra/ a partir de dados/,
 * com CNPJ e telefone trocados por valores fictícios, para poder versionar e
 * publicar uma amostra sem expor clientes.
 *
 * Neste desafio os dados já são fictícios (fornecidos pela avaliadora), então o
 * repositório usa os originais e este script não faz parte do build. Por que ele
 * existe e por que não foi usado: README, seção "Dados".
 *
 * - A troca é sequencial (1º CNPJ visto → 1º falso…), não um hash: não dá para
 *   voltar ao original por força bruta.
 * - CNPJs iguais continuam iguais, comparando só os dígitos (com ou sem
 *   pontuação), para a duplicidade de cadastro continuar detectável.
 * - CNPJ inválido (não tem 14 dígitos) fica como está, para a anomalia
 *   "CNPJ inválido" continuar aparecendo. Campo vazio continua vazio.
 * - Atenção: nome, cidade e histórico de pagamento continuam. Para dados reais,
 *   a razão social também precisaria ser trocada (pelo nome dá para achar o CNPJ).
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

function substituidor(gerar: (n: number) => string, chave: (original: string) => string | null) {
  const mapa = new Map<string, string>();
  return (original: string) => {
    const k = chave(original);
    if (k === null) return original;
    if (!mapa.has(k)) mapa.set(k, gerar(mapa.size + 1));
    return mapa.get(k) as string;
  };
}

const digitos = (t: string) => t.replace(/\D/g, '');
/** Só CNPJs válidos (14 dígitos) são trocados; vazio e inválido ficam como estão. */
const chaveCnpj = (t: string) => (digitos(t).length === 14 ? digitos(t) : null);
const chaveTelefone = (t: string) => (digitos(t).length >= 10 ? digitos(t) : null);

export function mascararClientes(clientes: unknown): unknown {
  if (!Array.isArray(clientes)) return clientes;
  const cnpj = substituidor(cnpjFicticio, chaveCnpj);
  const telefone = substituidor(telefoneFicticio, chaveTelefone);
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
