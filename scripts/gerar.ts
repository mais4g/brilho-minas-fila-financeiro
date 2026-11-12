import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type Anomalia, type Base, carregarBase, type DadosBrutos } from '../src/dominio/carregar';
import { DATA_REFERENCIA } from '../src/dominio/config';
import { type DadosPerfil, projetarFinanceiro, projetarInicio, projetarVendedor } from '../src/dominio/visoes';

/**
 * Lê os JSONs do Sistemão (pasta dados/), valida, aplica a regra de crédito e
 * grava UM arquivo por perfil em src/gerado/. Cada página do build importa
 * apenas o arquivo do seu perfil.
 */

const raiz = resolve(import.meta.dirname, '..');

/**
 * dados/ tem os JSONs do Sistemão (fictícios, fornecidos pela avaliadora).
 * DADOS=<pasta> usa outra pasta, por exemplo a amostra mascarada (npm run mascarar).
 */
export const pastaDeDados = (): string => resolve(raiz, process.env.DADOS ?? 'dados');

export function lerDados(pasta = pastaDeDados()): DadosBrutos {
  const ler = (nome: string): unknown => JSON.parse(readFileSync(resolve(pasta, `${nome}.json`), 'utf-8'));
  return {
    clientes: ler('clientes'),
    pedidos: ler('pedidos'),
    produtos: ler('produtos'),
    titulos_financeiros: ler('titulos_financeiros'),
    vendedores: ler('vendedores'),
  };
}

export function gerarPerfis(base: Base): Map<string, DadosPerfil> {
  const perfis = new Map<string, DadosPerfil>([['financeiro', projetarFinanceiro(base, DATA_REFERENCIA)]]);
  for (const id of base.vendedores.keys()) perfis.set(id, projetarVendedor(base, id, DATA_REFERENCIA));
  return perfis;
}

function relatorioAnomalias(anomalias: Anomalia[]): string {
  const escapar = (s: string) => s.replaceAll('|', '\|');
  const linhas = anomalias.map((a) => `| ${a.arquivo} | ${escapar(a.registro)} | ${escapar(a.descricao)} | ${escapar(a.tratamento)} |`);
  return [
    '# Anomalias encontradas nos dados',
    '',
    `> Gerado automaticamente por \`npm run gerar\` (data de referência ${DATA_REFERENCIA}). Não editar à mão.`,
    '',
    `${anomalias.length} ocorrências.`,
    '',
    '| Arquivo | Registro | O que tem de errado | O que o sistema faz |',
    '|---|---|---|---|',
    ...linhas,
    '',
  ].join('\n');
}

/** Grava src/gerado/<perfil>.json e docs/anomalias-dos-dados.md. O build usa a mesma função. */
export function gravarTudo(): { base: Base; perfis: Map<string, DadosPerfil> } {
  const base = carregarBase(lerDados(), DATA_REFERENCIA);
  const perfis = gerarPerfis(base);

  const destino = resolve(raiz, 'src/gerado');
  mkdirSync(destino, { recursive: true });
  for (const [id, dados] of perfis) {
    writeFileSync(resolve(destino, `${id}.json`), `${JSON.stringify(dados, null, 2)}\n`);
  }
  // Página de entrada (tela/index.html): só a lista de perfis.
  writeFileSync(resolve(destino, 'inicio.json'), `${JSON.stringify(projetarInicio(base, DATA_REFERENCIA), null, 2)}\n`);
  mkdirSync(resolve(raiz, 'docs'), { recursive: true });
  writeFileSync(resolve(raiz, 'docs/anomalias-dos-dados.md'), relatorioAnomalias(base.anomalias));
  return { base, perfis };
}

function principal() {
  const { base, perfis } = gravarTudo();
  const fin = perfis.get('financeiro');
  const fila = fin?.perfil === 'financeiro' ? fin.fila : [];
  const conta = (s: string) => fila.filter((p) => p.sugestao === s).length;
  console.log(`Dados lidos de: ${pastaDeDados()}`);
  console.log(`Perfis gerados: ${[...perfis.keys()].join(', ')}`);
  console.log(`Fila do financeiro: ${fila.length} pedidos (bloquear ${conta('bloquear')}, atenção ${conta('atencao')}, liberar ${conta('liberar')})`);
  console.log(`Anomalias: ${base.anomalias.length} (ver docs/anomalias-dos-dados.md)`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) principal();
