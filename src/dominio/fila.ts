import { type Base, valorDosItens } from './carregar';
import { avaliarCredito, type ResultadoCredito } from './credito';
import type { Pedido, StatusPedido } from './esquemas';
import { centavos, reais } from './util';

/** Pedidos que ainda dependem de uma decisão de crédito. */
export const STATUS_COM_CREDITO: readonly StatusPedido[] = ['recebido', 'aguardando_liberacao', 'bloqueado_financeiro'];

/** Janela para considerar dois pedidos iguais do mesmo cliente como possível duplicidade. */
export const JANELA_DUPLICIDADE_MIN = 60;

/** Situações que a regra não cobre, mas que a Marta precisa saber antes de decidir. */
export type Alerta =
  | { tipo: 'cadastro_duplicado'; outros: { id: string; razaoSocial: string; limite: number }[]; limiteUsado: number | null }
  | { tipo: 'cadastro_incompleto'; problemas: string[] }
  | { tipo: 'status_boleto_desatualizado'; tituloIds: string[] }
  | { tipo: 'possivel_duplicado'; outroPedido: number; status: StatusPedido }
  | { tipo: 'fila_acumulada'; outrosPedidos: number[]; totalSeLiberarTodos: number; limite: number }
  | { tipo: 'valor_divergente'; informado: number; somaItens: number }
  | { tipo: 'vendedor_divergente'; vendedorPedido: string | null; vendedorCliente: string | null }
  | { tipo: 'observacao'; texto: string };

export interface AnalisePedido {
  pedido: Pedido;
  /** Valor usado na regra: o maior entre o informado e a soma dos itens. */
  valorConsiderado: number;
  credito: ResultadoCredito;
  alertas: Alerta[];
}

export interface SituacaoCliente {
  clienteId: string;
  credito: ResultadoCredito;
}

function titulosDoGrupo(base: Base, clienteId: string) {
  const grupo = base.grupoDoCliente.get(clienteId);
  const ids = grupo?.clienteIds ?? [clienteId];
  return ids.flatMap((id) => base.titulosDoCliente.get(id) ?? []);
}

/** Situação de crédito de um cliente sem pedido novo (o que o vendedor pode consultar antes de prometer). */
export function situacaoDoCliente(base: Base, clienteId: string, dataReferencia: string): SituacaoCliente {
  return {
    clienteId,
    credito: avaliarCredito({
      valorPedido: 0,
      limite: base.grupoDoCliente.get(clienteId)?.limite ?? null,
      titulos: titulosDoGrupo(base, clienteId),
      dataReferencia,
    }),
  };
}

const assinaturaItens = (p: Pedido) =>
  p.itens.map((i) => `${i.produto_id}x${i.quantidade}`).sort().join('|');

const minutosEntre = (a: string, b: string) => Math.abs(Date.parse(`${a}Z`) - Date.parse(`${b}Z`)) / 60000;

export function analisarPedido(base: Base, pedido: Pedido, dataReferencia: string): AnalisePedido {
  const cliente = base.clientes.get(pedido.cliente_id);
  const grupo = base.grupoDoCliente.get(pedido.cliente_id);
  const somaItens = valorDosItens(pedido);
  const valorConsiderado = Math.max(pedido.valor_total, somaItens);

  const credito = avaliarCredito({
    valorPedido: valorConsiderado,
    limite: grupo?.limite ?? null,
    titulos: titulosDoGrupo(base, pedido.cliente_id),
    dataReferencia,
  });

  const alertas: Alerta[] = [];

  // Cadastro
  if (!cliente) {
    alertas.push({ tipo: 'cadastro_incompleto', problemas: [`cliente ${pedido.cliente_id} não encontrado no cadastro`] });
  } else {
    const problemas: string[] = [];
    if (!cliente.cnpj.trim()) problemas.push('sem CNPJ');
    if (!cliente.vendedor_id) problemas.push('sem vendedor responsável');
    if (cliente.limite_credito <= 0) problemas.push('sem limite de crédito');
    if (problemas.length > 0) alertas.push({ tipo: 'cadastro_incompleto', problemas });
  }
  if (grupo && grupo.clienteIds.length > 1) {
    alertas.push({
      tipo: 'cadastro_duplicado',
      outros: grupo.clienteIds
        .filter((id) => id !== pedido.cliente_id)
        .map((id) => base.clientes.get(id))
        .filter((c) => c !== undefined)
        .map((c) => ({ id: c.id, razaoSocial: c.razao_social, limite: c.limite_credito })),
      limiteUsado: grupo.limite,
    });
  }

  // Boletos com status desatualizado no Sistemão
  const desatualizados = credito.titulosEmAberto.filter((t) => t.status === 'aberto' && t.diasAtraso > 0).map((t) => t.id);
  if (desatualizados.length > 0) alertas.push({ tipo: 'status_boleto_desatualizado', tituloIds: desatualizados });

  // Mesmo pedido lançado duas vezes
  const mesmoGrupo = (p: Pedido) => (grupo?.clienteIds ?? [pedido.cliente_id]).includes(p.cliente_id);
  for (const outro of base.pedidos) {
    if (
      outro.numero !== pedido.numero &&
      outro.status !== 'cancelado' &&
      mesmoGrupo(outro) &&
      assinaturaItens(outro) === assinaturaItens(pedido) &&
      minutosEntre(outro.criado_em, pedido.criado_em) <= JANELA_DUPLICIDADE_MIN
    ) {
      alertas.push({ tipo: 'possivel_duplicado', outroPedido: outro.numero, status: outro.status });
    }
  }

  // Outros pedidos do mesmo cliente esperando na fila: liberar um não estoura,
  // mas liberar todos pode estourar o limite.
  const outrosNaFila = base.pedidos.filter(
    (p) => p.numero !== pedido.numero && mesmoGrupo(p) && STATUS_COM_CREDITO.includes(p.status) && p.status !== 'bloqueado_financeiro',
  );
  const limite = grupo?.limite ?? null;
  if (outrosNaFila.length > 0 && limite !== null && credito.sugestao !== 'bloquear') {
    const totalCent = centavos(credito.totalComPedido) + outrosNaFila.reduce((s, p) => s + centavos(Math.max(p.valor_total, valorDosItens(p))), 0);
    if (totalCent > centavos(limite)) {
      alertas.push({ tipo: 'fila_acumulada', outrosPedidos: outrosNaFila.map((p) => p.numero), totalSeLiberarTodos: reais(totalCent), limite });
    }
  }

  // Dados do pedido
  if (centavos(somaItens) !== centavos(pedido.valor_total)) {
    alertas.push({ tipo: 'valor_divergente', informado: pedido.valor_total, somaItens });
  }
  if (cliente && cliente.vendedor_id !== pedido.vendedor_id) {
    alertas.push({ tipo: 'vendedor_divergente', vendedorPedido: pedido.vendedor_id, vendedorCliente: cliente.vendedor_id });
  }
  if (pedido.observacao.trim()) alertas.push({ tipo: 'observacao', texto: pedido.observacao.trim() });

  return { pedido, valorConsiderado, credito, alertas };
}

const PESO: Record<ResultadoCredito['sugestao'], number> = { bloquear: 0, atencao: 1, liberar: 2 };

/**
 * Ordem da fila da Marta: primeiro o que exige olhar (Bloquear, depois Atenção),
 * por último o que é só confirmar (Liberar). Dentro de cada grupo, o pedido
 * mais antigo primeiro, porque é o que está esperando há mais tempo.
 */
export function ordenarFila(analises: AnalisePedido[]): AnalisePedido[] {
  return [...analises].sort(
    (a, b) => PESO[a.credito.sugestao] - PESO[b.credito.sugestao] || a.pedido.criado_em.localeCompare(b.pedido.criado_em) || a.pedido.numero - b.pedido.numero,
  );
}

export function filaDoFinanceiro(base: Base, dataReferencia: string): AnalisePedido[] {
  return ordenarFila(base.pedidos.filter((p) => p.status === 'aguardando_liberacao').map((p) => analisarPedido(base, p, dataReferencia)));
}
