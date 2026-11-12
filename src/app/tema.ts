/**
 * Cores dos dois temas. Base: a identidade visual do Divos da IA (bordô,
 * fundo rosado, verde/âmbar/vermelho/cobalto suaves). O tema escuro é derivado
 * dela, com as cores clareadas para manter o contraste.
 *
 * As cores ficam aqui (e não soltas no CSS) para que testes/contraste.test.ts
 * confira o contraste mínimo do WCAG 2.2 AA em cada par usado na tela.
 * As variáveis CSS são geradas a partir deste arquivo em main.tsx.
 */

export interface Tema {
  fundo: string;
  superficie: string;
  superficie2: string;
  /** Trilho de barras e linhas divisórias suaves. */
  trilho: string;
  linha: string;
  /** Borda de controles (campo de busca, seletor): precisa de 3:1. */
  controle: string;
  texto: string;
  textoSuave: string;
  marca: string;
  marcaClara: string;
  /** Texto sobre um fundo `marca`. */
  sobreMarca: string;
  bloquear: string;
  bloquearFundo: string;
  atencao: string;
  atencaoFundo: string;
  /** Marca gráfica (bolinha, faixa) de Atenção: só precisa de 3:1. */
  atencaoForte: string;
  liberar: string;
  liberarFundo: string;
  /** Avisos de dados (cadastro em dobro, pedido repetido): cobalto, para não confundir com Atenção. */
  info: string;
  infoFundo: string;
  infoBorda: string;
  /** Parte da barra de crédito que já é dívida. */
  divida: string;
  botaoBloquear: string;
  sobreBotaoBloquear: string;
  botaoLiberar: string;
  sobreBotaoLiberar: string;
  foco: string;
}

export const CLARO: Tema = {
  fundo: '#FBF8F9',
  superficie: '#FFFFFF',
  superficie2: '#F6EFF2',
  trilho: '#EFE6EA',
  linha: '#E8DDE1',
  controle: '#8C7880',
  texto: '#22181A',
  textoSuave: '#5B4A4F',
  marca: '#741E31',
  marcaClara: '#F9EBEF',
  sobreMarca: '#FFFFFF',
  bloquear: '#A3262C',
  bloquearFundo: '#FBE7E7',
  atencao: '#8F5600',
  atencaoFundo: '#FCF0DC',
  atencaoForte: '#B07A1E',
  liberar: '#2D6A44',
  liberarFundo: '#E5F2EA',
  info: '#2B4C9B',
  infoFundo: '#E9EEF9',
  infoBorda: '#C5D1EE',
  divida: '#8C7880',
  botaoBloquear: '#A3262C',
  sobreBotaoBloquear: '#FFFFFF',
  botaoLiberar: '#2D6A44',
  sobreBotaoLiberar: '#FFFFFF',
  foco: '#2B4C9B',
};

export const ESCURO: Tema = {
  fundo: '#161113',
  superficie: '#201A1C',
  superficie2: '#2A2225',
  trilho: '#3A2F33',
  linha: '#3A2F33',
  controle: '#8E7C83',
  texto: '#F5EEF1',
  textoSuave: '#C9B9BF',
  marca: '#F0A6B8',
  marcaClara: '#3A2129',
  sobreMarca: '#2A0E16',
  bloquear: '#FF9E98',
  bloquearFundo: '#3B1A1C',
  atencao: '#F3C16E',
  atencaoFundo: '#35280F',
  atencaoForte: '#F3C16E',
  liberar: '#86D6A5',
  liberarFundo: '#15301F',
  info: '#A9BFF5',
  infoFundo: '#1C2542',
  infoBorda: '#34457A',
  divida: '#9A878E',
  botaoBloquear: '#FF9E98',
  sobreBotaoBloquear: '#2B0E10',
  botaoLiberar: '#86D6A5',
  sobreBotaoLiberar: '#0F2417',
  foco: '#A9BFF5',
};

const kebab = (s: string) => s.replace(/[A-Z0-9]/g, (c) => `-${c.toLowerCase()}`);

export function variaveisCss(tema: Tema): string {
  return Object.entries(tema)
    .map(([nome, valor]) => `--${kebab(nome)}:${valor};`)
    .join('');
}

/**
 * CSS dos temas: o do sistema por padrão (prefers-color-scheme) e o escolhido
 * no seletor, gravado em data-tema no <html>.
 */
export function cssDosTemas(): string {
  return [
    `:root{${variaveisCss(CLARO)}color-scheme:light}`,
    `@media (prefers-color-scheme: dark){:root:not([data-tema='claro']){${variaveisCss(ESCURO)}color-scheme:dark}}`,
    `:root[data-tema='escuro']{${variaveisCss(ESCURO)}color-scheme:dark}`,
  ].join('\n');
}

// ---- Contraste (WCAG 2.2) -----------------------------------------------------

function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

type Chave = keyof Tema;

/** Pares de texto (mínimo 4,5:1) que aparecem na tela. */
export const PARES_TEXTO: [Chave, Chave][] = [
  ['texto', 'fundo'],
  ['texto', 'superficie'],
  ['texto', 'superficie2'],
  ['textoSuave', 'fundo'],
  ['textoSuave', 'superficie'],
  ['textoSuave', 'superficie2'],
  ['marca', 'superficie'],
  ['marca', 'fundo'],
  ['marca', 'marcaClara'],
  ['texto', 'marcaClara'],
  ['sobreMarca', 'marca'],
  ['bloquear', 'bloquearFundo'],
  ['bloquear', 'superficie'],
  ['atencao', 'atencaoFundo'],
  ['atencao', 'superficie'],
  ['liberar', 'liberarFundo'],
  ['liberar', 'superficie'],
  ['info', 'infoFundo'],
  ['texto', 'infoFundo'],
  ['texto', 'bloquearFundo'],
  ['texto', 'atencaoFundo'],
  ['texto', 'liberarFundo'],
  ['sobreBotaoBloquear', 'botaoBloquear'],
  ['sobreBotaoLiberar', 'botaoLiberar'],
  // linha selecionada (fundo marcaClara) e linha sob o cursor (superficie2)
  ['textoSuave', 'marcaClara'],
  ['bloquear', 'marcaClara'],
  ['bloquear', 'superficie2'],
  ['marca', 'superficie2'],
  ['info', 'superficie'],
];

/** Elementos gráficos e bordas de controles (mínimo 3:1, WCAG 1.4.11). */
export const PARES_GRAFICOS: [Chave, Chave][] = [
  ['controle', 'superficie'],
  ['controle', 'fundo'],
  ['foco', 'superficie'],
  ['foco', 'fundo'],
  ['divida', 'trilho'],
  ['marca', 'trilho'],
  ['bloquear', 'trilho'],
  ['atencaoForte', 'superficie'],
  ['liberar', 'superficie'],
  ['bloquear', 'superficie'],
  ['texto', 'trilho'],
];
