import type { z } from 'zod';
import {
  type Cliente,
  clienteSchema,
  type Pedido,
  pedidoSchema,
  type Produto,
  produtoSchema,
  type Titulo,
  tituloSchema,
  type Vendedor,
  vendedorSchema,
} from './esquemas';
import { centavos, diasEntre, reais, somenteDigitos } from './util';

export type Arquivo = 'clientes' | 'pedidos' | 'produtos' | 'titulos_financeiros' | 'vendedores';

export interface Anomalia {
  arquivo: Arquivo;
  registro: string;
  descricao: string;
  /** O que o sistema faz com isso. */
  tratamento: string;
}

export interface DadosBrutos {
  clientes: unknown;
  pedidos: unknown;
  produtos: unknown;
  titulos_financeiros: unknown;
  vendedores: unknown;
}

/**
 * Clientes que são a mesma empresa (mesmo CNPJ) cadastrados mais de uma vez.
 * A análise de crédito é feita pelo grupo: a dívida de um cadastro conta para o outro.
 */
export interface GrupoCredito {
  chave: string;
  clienteIds: string[];
  /** Menor limite positivo entre os cadastros; `null` se nenhum tem limite. */
  limite: number | null;
}

export interface Base {
  vendedores: Map<string, Vendedor>;
  clientes: Map<string, Cliente>;
  produtos: Map<string, Produto>;
  pedidos: Pedido[];
  titulos: Titulo[];
  grupoDoCliente: Map<string, GrupoCredito>;
  titulosDoCliente: Map<string, Titulo[]>;
  anomalias: Anomalia[];
}

function validarLista<S extends z.ZodType>(
  arquivo: Arquivo,
  bruto: unknown,
  schema: S,
  idDe: (registro: unknown, indice: number) => string,
  anomalias: Anomalia[],
): z.infer<S>[] {
  if (!Array.isArray(bruto)) {
    anomalias.push({ arquivo, registro: '(arquivo)', descricao: 'o arquivo não é uma lista', tratamento: 'arquivo ignorado' });
    return [];
  }
  const validos: z.infer<S>[] = [];
  bruto.forEach((registro, i) => {
    const r = schema.safeParse(registro);
    if (r.success) {
      validos.push(r.data);
    } else {
      const campos = r.error.issues.map((e) => `${e.path.join('.') || '(registro)'}: ${e.message}`).join('; ');
      anomalias.push({ arquivo, registro: idDe(registro, i), descricao: `formato inválido (${campos})`, tratamento: 'registro ignorado' });
    }
  });
  return validos;
}

const campo = (chave: string) => (registro: unknown, indice: number) => {
  const valor = typeof registro === 'object' && registro !== null ? (registro as Record<string, unknown>)[chave] : undefined;
  return valor === undefined || valor === null ? `#${indice + 1}` : String(valor);
};

function semDuplicados<T>(arquivo: Arquivo, itens: T[], id: (t: T) => string, anomalias: Anomalia[]): Map<string, T> {
  const mapa = new Map<string, T>();
  for (const item of itens) {
    const chave = id(item);
    if (mapa.has(chave)) {
      anomalias.push({ arquivo, registro: chave, descricao: 'identificador repetido', tratamento: 'mantida a primeira ocorrência' });
    } else {
      mapa.set(chave, item);
    }
  }
  return mapa;
}

export function carregarBase(brutos: DadosBrutos, dataReferencia: string): Base {
  const anomalias: Anomalia[] = [];

  const vendedores = semDuplicados('vendedores', validarLista('vendedores', brutos.vendedores, vendedorSchema, campo('id'), anomalias), (v) => v.id, anomalias);
  const produtos = semDuplicados('produtos', validarLista('produtos', brutos.produtos, produtoSchema, campo('id'), anomalias), (p) => p.id, anomalias);
  const clientes = semDuplicados('clientes', validarLista('clientes', brutos.clientes, clienteSchema, campo('id'), anomalias), (c) => c.id, anomalias);
  const pedidos = [...semDuplicados('pedidos', validarLista('pedidos', brutos.pedidos, pedidoSchema, campo('numero'), anomalias), (p) => String(p.numero), anomalias).values()];
  const titulos = [...semDuplicados('titulos_financeiros', validarLista('titulos_financeiros', brutos.titulos_financeiros, tituloSchema, campo('id'), anomalias), (t) => t.id, anomalias).values()];

  // ---- Clientes -------------------------------------------------------------
  for (const c of clientes.values()) {
    const problemas: string[] = [];
    if (somenteDigitos(c.cnpj).length !== 14) problemas.push(c.cnpj ? `CNPJ inválido (${c.cnpj})` : 'sem CNPJ');
    if (c.vendedor_id === null) problemas.push('sem vendedor responsável');
    else if (!vendedores.has(c.vendedor_id)) problemas.push(`vendedor ${c.vendedor_id} não existe`);
    if (c.limite_credito <= 0) problemas.push(`limite de crédito ${c.limite_credito}`);
    if (problemas.length > 0) {
      anomalias.push({
        arquivo: 'clientes',
        registro: `${c.id} ${c.razao_social}`,
        descricao: `cadastro incompleto: ${problemas.join(', ')}`,
        tratamento: 'qualquer pedido desse cliente é sugerido como Bloquear até o cadastro ser corrigido; sem vendedor, não aparece para nenhum vendedor',
      });
    }
  }

  // Mesma empresa (CNPJ) cadastrada mais de uma vez → um grupo de crédito só.
  const porCnpj = new Map<string, Cliente[]>();
  for (const c of clientes.values()) {
    const cnpj = somenteDigitos(c.cnpj);
    const chave = cnpj.length === 14 ? `cnpj:${cnpj}` : `id:${c.id}`;
    porCnpj.set(chave, [...(porCnpj.get(chave) ?? []), c]);
  }
  const grupoDoCliente = new Map<string, GrupoCredito>();
  for (const [chave, membros] of porCnpj) {
    const limites = membros.map((m) => m.limite_credito).filter((l) => l > 0);
    const grupo: GrupoCredito = {
      chave,
      clienteIds: membros.map((m) => m.id),
      limite: limites.length > 0 ? Math.min(...limites) : null,
    };
    for (const m of membros) grupoDoCliente.set(m.id, grupo);
    if (membros.length > 1) {
      anomalias.push({
        arquivo: 'clientes',
        registro: membros.map((m) => `${m.id} ${m.razao_social}`).join(' / '),
        descricao: `mesmo CNPJ (${membros[0]?.cnpj}) cadastrado ${membros.length} vezes, com limites ${membros.map((m) => m.limite_credito).join(' e ')}`,
        tratamento: 'tratados como um cliente só: a dívida de todos os cadastros soma e vale o menor limite',
      });
    }
  }

  // ---- Títulos --------------------------------------------------------------
  const titulosDoCliente = new Map<string, Titulo[]>();
  for (const t of titulos) {
    if (!clientes.has(t.cliente_id)) {
      anomalias.push({ arquivo: 'titulos_financeiros', registro: t.id, descricao: `cliente ${t.cliente_id} não existe`, tratamento: 'boleto ignorado' });
      continue;
    }
    titulosDoCliente.set(t.cliente_id, [...(titulosDoCliente.get(t.cliente_id) ?? []), t]);

    const atraso = diasEntre(t.vencimento, dataReferencia);
    const registro = `${t.id} (cliente ${t.cliente_id})`;
    if (t.status === 'aberto' && atraso > 0) {
      anomalias.push({
        arquivo: 'titulos_financeiros',
        registro,
        descricao: `status "aberto", mas venceu em ${t.vencimento} (${atraso} dias de atraso)`,
        tratamento: 'considerado vencido: a regra usa a data de vencimento, não o status',
      });
    }
    if (t.status === 'vencido' && atraso <= 0) {
      anomalias.push({ arquivo: 'titulos_financeiros', registro, descricao: `status "vencido", mas só vence em ${t.vencimento}`, tratamento: 'conta como dívida, mas não como atraso' });
    }
    if (t.status === 'pago' && !t.data_pagamento) {
      anomalias.push({ arquivo: 'titulos_financeiros', registro, descricao: 'status "pago" sem data de pagamento', tratamento: 'considerado pago' });
    }
    if (t.status !== 'pago' && t.data_pagamento) {
      anomalias.push({ arquivo: 'titulos_financeiros', registro, descricao: `tem data de pagamento (${t.data_pagamento}), mas status "${t.status}"`, tratamento: 'considerado não pago (vale o status)' });
    }
    if (t.valor <= 0) {
      anomalias.push({ arquivo: 'titulos_financeiros', registro, descricao: `valor ${t.valor}`, tratamento: 'mantido como está' });
    }
    if (t.emissao > t.vencimento) {
      anomalias.push({ arquivo: 'titulos_financeiros', registro, descricao: 'emissão depois do vencimento', tratamento: 'mantido como está' });
    }
  }

  // ---- Pedidos --------------------------------------------------------------
  for (const p of pedidos) {
    const problemas: string[] = [];
    const cliente = clientes.get(p.cliente_id);
    if (!cliente) problemas.push(`cliente ${p.cliente_id} não existe`);
    if (p.vendedor_id === null || !vendedores.has(p.vendedor_id)) {
      problemas.push(p.vendedor_id === null ? 'sem vendedor' : `vendedor ${p.vendedor_id} não existe`);
    } else if (cliente?.vendedor_id && cliente.vendedor_id !== p.vendedor_id) {
      problemas.push(`vendedor do pedido (${p.vendedor_id}) diferente do responsável pelo cliente (${cliente.vendedor_id})`);
    }
    for (const item of p.itens) {
      const produto = produtos.get(item.produto_id);
      if (!produto) problemas.push(`produto ${item.produto_id} não existe no catálogo`);
      else if (centavos(produto.preco) !== centavos(item.preco_unitario)) {
        problemas.push(`${item.produto_id} com preço ${item.preco_unitario} (catálogo: ${produto.preco})`);
      }
      if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) problemas.push(`${item.produto_id} com quantidade ${item.quantidade}`);
    }
    const somaItens = valorDosItens(p);
    if (centavos(somaItens) !== centavos(p.valor_total)) {
      problemas.push(`valor total ${p.valor_total}, mas a soma dos itens dá ${somaItens}`);
    }
    const vendedor = p.vendedor_id ? vendedores.get(p.vendedor_id) : undefined;
    if (vendedor) {
      const esperada = reais(Math.round(centavos(p.valor_total) * vendedor.comissao_pct / 100));
      if (Math.abs(centavos(esperada) - centavos(p.comissao_valor)) > 1) {
        problemas.push(`comissão ${p.comissao_valor}, mas ${vendedor.comissao_pct}% do valor dá ${esperada}`);
      }
    }
    if (p.criado_em.slice(0, 10) > dataReferencia) problemas.push(`criado no futuro (${p.criado_em})`);
    if (p.observacao.trim()) problemas.push(`observação: "${p.observacao.trim()}"`);

    if (problemas.length > 0) {
      anomalias.push({
        arquivo: 'pedidos',
        registro: `${p.numero} (${p.status})`,
        descricao: problemas.join('; '),
        tratamento: tratamentoPedido(p),
      });
    }
  }

  return { vendedores, clientes, produtos, pedidos, titulos, grupoDoCliente, titulosDoCliente, anomalias };
}

export function valorDosItens(p: Pedido): number {
  return reais(p.itens.reduce((soma, i) => soma + Math.round(i.quantidade * centavos(i.preco_unitario)), 0));
}

function tratamentoPedido(p: Pedido): string {
  if (p.status === 'aguardando_liberacao' || p.status === 'recebido' || p.status === 'bloqueado_financeiro') {
    return 'aparece como alerta para o financeiro no pedido';
  }
  return 'pedido já fechado: só registrado, não afeta a fila';
}
