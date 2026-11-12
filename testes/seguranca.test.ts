import { describe, expect, it } from 'vitest';
import { gerarPerfis, lerDados } from '../scripts/gerar';
import { carregarBase } from '../src/dominio/carregar';
import { DATA_REFERENCIA } from '../src/dominio/config';

/**
 * "Quem pode ver o quê", testado em cima do que de fato vai para cada página.
 * Se alguém adicionar um campo na projeção sem pensar no perfil, estes testes quebram.
 */

const base = carregarBase(lerDados(), DATA_REFERENCIA);
const perfis = gerarPerfis(base);

function todasAsChaves(valor: unknown, caminho = ''): string[] {
  if (Array.isArray(valor)) return valor.flatMap((v) => todasAsChaves(v, `${caminho}[]`));
  if (valor && typeof valor === 'object') {
    return Object.entries(valor).flatMap(([k, v]) => [`${caminho}.${k}`, ...todasAsChaves(v, `${caminho}.${k}`)]);
  }
  return [];
}

const CNPJ = /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/;
const TELEFONE = /\+55 \d{2} \d{4,5}-\d{4}/;

describe.each([...base.vendedores.keys()])('página do vendedor %s', (id) => {
  const dados = perfis.get(id);
  if (dados?.perfil !== 'vendedor') throw new Error('perfil errado');
  const json = JSON.stringify(dados);

  it('só tem campos da lista permitida', () => {
    const permitidas = new Set([
      '.perfil', '.dataReferencia',
      '.perfis', '.perfis[].id', '.perfis[].nome', '.perfis[].descricao', '.perfis[].arquivo',
      '.vendedor', '.vendedor.id', '.vendedor.nome', '.vendedor.regiao',
      '.pedidos', '.pedidos[].numero', '.pedidos[].criadoEm', '.pedidos[].cliente', '.pedidos[].status',
      '.pedidos[].rotuloStatus', '.pedidos[].itens', '.pedidos[].itens[].descricao', '.pedidos[].itens[].quantidade',
      '.pedidos[].valor', '.pedidos[].situacao', '.pedidos[].situacao.sugestao', '.pedidos[].situacao.rotulo', '.pedidos[].situacao.texto',
      '.clientes', '.clientes[].id', '.clientes[].razaoSocial', '.clientes[].cidade',
      '.clientes[].situacao', '.clientes[].situacao.sugestao', '.clientes[].situacao.rotulo', '.clientes[].situacao.texto',
    ]);
    const extras = [...new Set(todasAsChaves(dados))].filter((k) => !permitidas.has(k));
    expect(extras).toEqual([]);
  });

  it('não tem CNPJ, telefone, comissão, dívida, limite nem boletos', () => {
    expect(json).not.toMatch(CNPJ);
    expect(json).not.toMatch(TELEFONE);
    // Nenhum campo com esses nomes (os textos podem dizer "boleto em atraso", sem valores).
    expect(todasAsChaves(dados).join(' ')).not.toMatch(/comiss|divida|limite|boleto|titulo|atraso|cnpj|telefone/i);
    // Nenhum identificador de boleto.
    expect(json).not.toMatch(/"T\d{4}"/);
  });

  it('os textos de situação não trazem números (valores ou dias de atraso)', () => {
    const textos = [...dados.pedidos.map((p) => p.situacao?.texto ?? ''), ...dados.clientes.map((c) => c.situacao.texto)];
    for (const t of textos) expect(t).not.toMatch(/\d/);
  });

  it('não tem clientes nem pedidos de outro vendedor', () => {
    const meus = new Set([...base.clientes.values()].filter((c) => c.vendedor_id === id).map((c) => c.razao_social));
    expect(dados.clientes.every((c) => meus.has(c.razaoSocial))).toBe(true);
    expect(dados.pedidos.every((p) => meus.has(p.cliente))).toBe(true);
    for (const c of base.clientes.values()) {
      if (c.vendedor_id !== id && !meus.has(c.razao_social)) expect(json).not.toContain(`"${c.razao_social}"`);
    }
    const numerosDeOutros = base.pedidos.filter((p) => p.vendedor_id !== id).map((p) => p.numero);
    expect(dados.pedidos.map((p) => p.numero).filter((n) => numerosDeOutros.includes(n))).toEqual([]);
  });
});

describe('página do financeiro', () => {
  const dados = perfis.get('financeiro');
  const json = JSON.stringify(dados);

  it('não tem comissão nem telefone', () => {
    expect(json).not.toMatch(/comiss/i);
    expect(json).not.toMatch(TELEFONE);
  });

  it('mostra só pedidos aguardando liberação', () => {
    if (dados?.perfil !== 'financeiro') throw new Error('perfil errado');
    const aguardando = base.pedidos.filter((p) => p.status === 'aguardando_liberacao').map((p) => p.numero).sort();
    expect(dados.fila.map((p) => p.numero).sort()).toEqual(aguardando);
  });
});

describe('cliente sem vendedor (C038)', () => {
  it('não aparece para nenhum vendedor', () => {
    for (const d of perfis.values()) {
      if (d.perfil === 'vendedor') expect(JSON.stringify(d)).not.toContain('Savasi');
    }
  });
});
