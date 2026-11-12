import type { Motivo, ResultadoCredito, Sugestao } from './credito';
import type { StatusPedido } from './esquemas';
import type { Alerta } from './fila';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatarReais = (valor: number): string => brl.format(valor);

/** "2026-11-10" ou "2026-11-10T08:07" → "10/11" ou "10/11 08:07". */
export function formatarData(iso: string): string {
  const [data = '', hora] = iso.split('T');
  const [, mes, dia] = data.split('-');
  return hora ? `${dia}/${mes} ${hora.slice(0, 5)}` : `${dia}/${mes}`;
}

const dias = (n: number) => (n === 1 ? '1 dia' : `${n} dias`);

export const ROTULO_SUGESTAO: Record<Sugestao, string> = {
  liberar: 'Liberar',
  atencao: 'Atenção',
  bloquear: 'Bloquear',
};

// ---------------------------------------------------------------------------
// Financeiro: tem acesso a dívida, atraso e limite.
// ---------------------------------------------------------------------------

export function motivoFinanceiro(m: Motivo, r: Pick<ResultadoCredito, 'divida' | 'totalComPedido' | 'limite'>): string {
  switch (m.tipo) {
    case 'sem_limite':
      return 'Cliente sem limite de crédito no cadastro. Não dá para liberar sem saber o limite.';
    case 'atraso_grave':
      return m.quantidade > 1
        ? `${m.quantidade} boletos vencidos há mais de 5 dias. O mais antigo está ${dias(m.maiorAtrasoDias)} em atraso.`
        : `Boleto vencido há ${dias(m.maiorAtrasoDias)} (a tolerância é de 5 dias).`;
    case 'acima_limite':
      return `Dívida + este pedido dá ${formatarReais(m.totalComPedido)} e o limite é ${formatarReais(m.limite)}: passa ${formatarReais(m.excesso)}.`;
    case 'atraso_leve':
      return m.quantidade > 1
        ? `${m.quantidade} boletos vencidos, o mais antigo há ${dias(m.maiorAtrasoDias)}. Pode liberar, mas o vendedor precisa cobrar.`
        : `Boleto vencido há ${dias(m.maiorAtrasoDias)}. Pode liberar, mas o vendedor precisa cobrar.`;
    case 'em_dia':
      if (r.divida === 0) return 'Nenhum boleto em aberto. Pedido dentro do limite.';
      return r.limite
        ? `Sem atraso. Dívida + pedido fica em ${formatarReais(r.totalComPedido)} de ${formatarReais(r.limite)} de limite.`
        : 'Sem atraso.';
  }
}

export function alertaFinanceiro(a: Alerta): string {
  switch (a.tipo) {
    case 'cadastro_duplicado': {
      const outros = a.outros.map((o) => `${o.id} "${o.razaoSocial}" (limite ${formatarReais(o.limite)})`).join(', ');
      const limite = a.limiteUsado === null ? 'sem limite' : `o menor limite, ${formatarReais(a.limiteUsado)}`;
      return `Mesmo CNPJ cadastrado também como ${outros}. Os boletos dos cadastros foram somados e foi usado ${limite}.`;
    }
    case 'cadastro_incompleto':
      return `Cadastro incompleto: ${a.problemas.join(', ')}.`;
    case 'status_boleto_desatualizado':
      return `${a.tituloIds.length > 1 ? 'Os boletos' : 'O boleto'} ${a.tituloIds.join(', ')} ${a.tituloIds.length > 1 ? 'estão' : 'está'} como "aberto" no Sistemão, mas já ${a.tituloIds.length > 1 ? 'venceram' : 'venceu'}. Foi tratado como vencido.`;
    case 'possivel_duplicado':
      return `Possível pedido em dobro: o pedido ${a.outroPedido} (${ROTULO_STATUS[a.status].toLowerCase()}) tem o mesmo cliente e os mesmos itens, no mesmo horário. Confirme com o vendedor antes de liberar os dois.`;
    case 'fila_acumulada':
      return `Há outro${a.outrosPedidos.length > 1 ? 's' : ''} pedido${a.outrosPedidos.length > 1 ? 's' : ''} deste cliente na fila (${a.outrosPedidos.join(', ')}). Liberando todos, a conta vai a ${formatarReais(a.totalSeLiberarTodos)} e passa o limite de ${formatarReais(a.limite)}.`;
    case 'valor_divergente':
      return `O valor do pedido (${formatarReais(a.informado)}) não bate com a soma dos itens (${formatarReais(a.somaItens)}). A regra usou o maior.`;
    case 'vendedor_divergente':
      return `O vendedor do pedido (${a.vendedorPedido ?? 'nenhum'}) não é o responsável pelo cliente (${a.vendedorCliente ?? 'nenhum'}).`;
    case 'observacao':
      return `Observação no pedido: "${a.texto}"`;
  }
}

// ---------------------------------------------------------------------------
// Vendedor: só a situação, em linguagem simples. Nenhum número de dívida,
// limite ou dias de atraso (regra "Quem pode ver o quê").
// ---------------------------------------------------------------------------

export const ROTULO_SITUACAO_VENDEDOR: Record<Sugestao, string> = {
  liberar: 'Liberado',
  atencao: 'Atenção',
  bloquear: 'Bloqueado',
};

export type MotivoVendedor =
  | 'em_dia'
  | 'cobrar_atraso'
  | 'pagamento_atrasado'
  | 'sem_credito_disponivel'
  | 'cadastro_incompleto'
  | 'barrado_pelo_financeiro';

/** Reduz os motivos do financeiro ao que o vendedor pode saber. */
export function motivoParaVendedor(motivos: readonly Motivo[]): MotivoVendedor {
  const principal = motivos[0]?.tipo ?? 'em_dia';
  switch (principal) {
    case 'sem_limite':
      return 'cadastro_incompleto';
    case 'atraso_grave':
      return 'pagamento_atrasado';
    case 'acima_limite':
      return 'sem_credito_disponivel';
    case 'atraso_leve':
      return 'cobrar_atraso';
    case 'em_dia':
      return 'em_dia';
  }
}

export const TEXTO_MOTIVO_VENDEDOR: Record<MotivoVendedor, string> = {
  em_dia: 'Cliente em dia com o financeiro.',
  cobrar_atraso: 'O cliente tem um boleto em atraso. O pedido pode seguir, mas cobre o cliente.',
  pagamento_atrasado: 'O cliente tem pagamento atrasado. Combine a regularização com ele antes de prometer entrega.',
  sem_credito_disponivel: 'Este pedido passa do crédito disponível do cliente. Fale com o financeiro: talvez seja preciso reduzir o pedido ou pagar à vista.',
  cadastro_incompleto: 'O cadastro deste cliente está incompleto no financeiro. Fale com o financeiro.',
  barrado_pelo_financeiro: 'O financeiro barrou este pedido. Fale com o financeiro para saber o que falta.',
};

/** Mesmo motivo, para a lista de clientes (antes de existir um pedido). */
export const TEXTO_MOTIVO_VENDEDOR_CLIENTE: Record<MotivoVendedor, string> = {
  ...TEXTO_MOTIVO_VENDEDOR,
  sem_credito_disponivel: 'O cliente já usou todo o crédito. Fale com o financeiro antes de tirar um pedido novo.',
};

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  recebido: 'Recebido',
  aguardando_liberacao: 'Na fila do financeiro',
  bloqueado_financeiro: 'Barrado pelo financeiro',
  separacao: 'Em separação',
  em_rota: 'Saiu para entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};
