import { z } from 'zod';

// Formato do que a API do Sistemão devolve. Validamos registro a registro:
// o que não bate com o formato vira anomalia e não entra no cálculo,
// em vez de derrubar a tela inteira.

const dataIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data no formato AAAA-MM-DD');
const dataHoraIso = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, 'data e hora no formato AAAA-MM-DDTHH:MM');
const dinheiro = z.number().finite();

export const vendedorSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  regiao: z.string(),
  comissao_pct: z.number().min(0),
});

export const clienteSchema = z.object({
  id: z.string().min(1),
  razao_social: z.string().min(1),
  segmento: z.string(),
  cnpj: z.string(),
  vendedor_id: z.string().nullable(),
  limite_credito: dinheiro,
  telefone_whatsapp: z.string(),
  cidade: z.string(),
});

export const produtoSchema = z.object({
  id: z.string().min(1),
  descricao: z.string(),
  preco: dinheiro,
});

export const statusPedido = z.enum([
  'recebido',
  'aguardando_liberacao',
  'bloqueado_financeiro',
  'separacao',
  'em_rota',
  'entregue',
  'cancelado',
]);

export const itemPedidoSchema = z.object({
  produto_id: z.string(),
  descricao: z.string(),
  quantidade: z.number(),
  preco_unitario: dinheiro,
});

export const pedidoSchema = z.object({
  numero: z.number().int(),
  cliente_id: z.string(),
  vendedor_id: z.string().nullable(),
  canal_origem: z.string(),
  criado_em: dataHoraIso,
  itens: z.array(itemPedidoSchema),
  valor_total: dinheiro,
  comissao_valor: dinheiro,
  status: statusPedido,
  liberado_por: z.string().nullable(),
  liberado_em: z.string().nullable(),
  observacao: z.string(),
});

export const statusTitulo = z.enum(['aberto', 'vencido', 'pago']);

export const tituloSchema = z.object({
  id: z.string().min(1),
  cliente_id: z.string(),
  valor: dinheiro,
  emissao: dataIso,
  vencimento: dataIso,
  status: statusTitulo,
  data_pagamento: dataIso.nullable(),
});

export type Vendedor = z.infer<typeof vendedorSchema>;
export type Cliente = z.infer<typeof clienteSchema>;
export type Produto = z.infer<typeof produtoSchema>;
export type Pedido = z.infer<typeof pedidoSchema>;
export type ItemPedido = z.infer<typeof itemPedidoSchema>;
export type Titulo = z.infer<typeof tituloSchema>;
export type StatusPedido = z.infer<typeof statusPedido>;
export type StatusTitulo = z.infer<typeof statusTitulo>;
