import { describe, expect, it } from 'vitest';
import { lerDados } from '../scripts/gerar';
import { carregarBase } from '../src/dominio/carregar';
import { DATA_REFERENCIA } from '../src/dominio/config';
import { filaDoFinanceiro } from '../src/dominio/fila';

const base = carregarBase(lerDados(), DATA_REFERENCIA);
const fila = filaDoFinanceiro(base, DATA_REFERENCIA);
const doPedido = (n: number) => {
  const a = fila.find((x) => x.pedido.numero === n);
  if (!a) throw new Error(`pedido ${n} não está na fila`);
  return a;
};
const tiposAlerta = (n: number) => doPedido(n).alertas.map((a) => a.tipo);

describe('fila do financeiro com os dados da Brilho Minas (11/11/2026)', () => {
  it('tem os 14 pedidos aguardando liberação', () => {
    expect(fila).toHaveLength(14);
  });

  it.each([
    [1090, 'liberar'],
    [1091, 'bloquear'], // 43 dias de atraso e acima do limite
    [1094, 'liberar'],
    [1096, 'bloquear'], // só limite: 4.127,57 > 4.000
    [1097, 'atencao'], // 3 dias de atraso
    [1098, 'liberar'],
    [1099, 'bloquear'], // 27 dias e acima do limite
    [1102, 'liberar'],
    [1104, 'bloquear'], // 6 dias: um a mais que a tolerância
    [1105, 'liberar'],
    [1106, 'bloquear'], // boleto "aberto" que venceu há 12 dias
    [1108, 'liberar'],
    [1109, 'atencao'], // exatamente 5 dias
    [1110, 'bloquear'], // CNPJ duplicado com C001, que tem atrasos
  ] as const)('pedido %i → %s', (numero, esperado) => {
    expect(doPedido(numero).credito.sugestao).toBe(esperado);
  });

  it('1104 e 1109 são as bordas da tolerância (6 e 5 dias)', () => {
    expect(doPedido(1104).credito.maiorAtrasoDias).toBe(6);
    expect(doPedido(1109).credito.maiorAtrasoDias).toBe(5);
  });

  it('1096 bloqueia só pelo limite', () => {
    expect(doPedido(1096).credito.motivos.map((m) => m.tipo)).toEqual(['acima_limite']);
  });

  it('1110 (C037) herda os boletos do C001, que tem o mesmo CNPJ', () => {
    const a = doPedido(1110);
    expect(doPedido(1110).alertas).toContainEqual(expect.objectContaining({ tipo: 'cadastro_duplicado', nomesDiferentes: true }));
    expect(a.credito.titulosEmAberto.length).toBeGreaterThan(0);
    expect(a.credito.limite).toBe(5000);
  });

  it('1106 avisa que o boleto T0132 está com status desatualizado', () => {
    expect(doPedido(1106).alertas).toContainEqual({ tipo: 'status_boleto_desatualizado', tituloIds: ['T0132'] });
  });

  it('1105 e 1108 são apontados como possível duplicidade um do outro e estouram o limite juntos', () => {
    expect(doPedido(1105).alertas).toContainEqual(expect.objectContaining({ tipo: 'possivel_duplicado', outroPedido: 1108 }));
    expect(doPedido(1108).alertas).toContainEqual(expect.objectContaining({ tipo: 'possivel_duplicado', outroPedido: 1105 }));
    expect(tiposAlerta(1105)).toContain('fila_acumulada');
  });

  it('pedidos sem nada de estranho não têm alerta', () => {
    for (const n of [1090, 1094, 1096, 1097, 1098, 1099, 1102, 1104, 1109]) expect(tiposAlerta(n)).toEqual([]);
  });

  it('ordena: Bloquear, Atenção, Liberar; dentro de cada um, o mais antigo primeiro', () => {
    expect(fila.map((a) => a.pedido.numero)).toEqual([1091, 1099, 1096, 1110, 1104, 1106, 1097, 1109, 1090, 1094, 1098, 1102, 1105, 1108]);
  });
});

describe('anomalias dos dados', () => {
  const texto = base.anomalias.map((a) => `${a.registro} ${a.descricao}`).join('\n');

  it.each([
    ['C038', 'sem CNPJ'],
    ['C037', 'mesmo CNPJ'],
    ['T0132', 'status "aberto"'],
    ['1006', 'sem vendedor'],
    ['1013', 'comissão'],
    ['1108', 'digitado 2x'],
    ['C018', 'nomes quase iguais'],
  ])('encontra %s (%s)', (registro, trecho) => {
    expect(texto).toMatch(new RegExp(`${registro}.*${trecho.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  });

  it('registro com formato inválido vira anomalia em vez de quebrar', () => {
    const dados = lerDados();
    const pedidos = [...(dados.pedidos as unknown[]), { numero: 9999, cliente_id: 'C001', itens: 'quebrado' }];
    const b = carregarBase({ ...dados, pedidos }, DATA_REFERENCIA);
    expect(b.pedidos).toHaveLength(110);
    expect(b.anomalias.some((a) => a.registro === '9999' && a.tratamento === 'registro ignorado')).toBe(true);
  });
});
