import type { StatusTitulo } from './esquemas';
import { centavos, diasEntre, reais } from './util';

/**
 * Regra de crédito que a Marta aplica hoje "de cabeça":
 *
 * - Bloquear: algum boleto vencido há MAIS de 5 dias, ou
 *             (tudo o que o cliente deve + valor do pedido) PASSA do limite.
 * - Atenção:  algum boleto vencido há 1 a 5 dias (libera, mas o vendedor cobra).
 * - Liberar:  nenhum dos casos acima.
 *
 * Decisões de interpretação (registradas no README):
 * - "Vencido" é decidido pela data de vencimento, não pelo campo status do
 *   Sistemão: um boleto marcado "aberto" com vencimento no passado está vencido.
 * - "Passa do limite" é estritamente maior: dívida + pedido igual ao limite libera.
 * - Cliente sem limite definido (zero, negativo ou ausente) é bloqueado: não
 *   dá para liberar crédito sem saber quanto crédito ele tem.
 */

export const DIAS_TOLERANCIA_ATRASO = 5;

export type Sugestao = 'liberar' | 'atencao' | 'bloquear';

export type Motivo =
  | { tipo: 'sem_limite' }
  | { tipo: 'atraso_grave'; maiorAtrasoDias: number; quantidade: number }
  | { tipo: 'acima_limite'; totalComPedido: number; limite: number; excesso: number }
  | { tipo: 'atraso_leve'; maiorAtrasoDias: number; quantidade: number }
  | { tipo: 'em_dia' };

export interface TituloParaCredito {
  id: string;
  valor: number;
  vencimento: string;
  status: StatusTitulo;
}

export interface TituloEmAberto extends TituloParaCredito {
  diasAtraso: number;
}

export interface EntradaCredito {
  valorPedido: number;
  /** Limite de crédito. `null` quando o cadastro não tem limite. */
  limite: number | null;
  /** Todos os boletos do cliente; os pagos são ignorados aqui dentro. */
  titulos: readonly TituloParaCredito[];
  /** Data de referência AAAA-MM-DD ("hoje"). */
  dataReferencia: string;
}

export interface ResultadoCredito {
  sugestao: Sugestao;
  /** Motivos em ordem de gravidade. Sempre tem ao menos um. */
  motivos: Motivo[];
  divida: number;
  totalComPedido: number;
  limite: number | null;
  maiorAtrasoDias: number;
  /** Boletos não pagos, do mais atrasado para o menos atrasado. */
  titulosEmAberto: TituloEmAberto[];
}

export function avaliarCredito(entrada: EntradaCredito): ResultadoCredito {
  const titulosEmAberto: TituloEmAberto[] = entrada.titulos
    .filter((t) => t.status !== 'pago')
    .map((t) => ({ ...t, diasAtraso: Math.max(0, diasEntre(t.vencimento, entrada.dataReferencia)) }))
    .sort((a, b) => b.diasAtraso - a.diasAtraso || a.vencimento.localeCompare(b.vencimento));

  const dividaCent = titulosEmAberto.reduce((soma, t) => soma + centavos(t.valor), 0);
  const totalCent = dividaCent + centavos(entrada.valorPedido);
  const maiorAtrasoDias = titulosEmAberto[0]?.diasAtraso ?? 0;

  const atrasados = titulosEmAberto.filter((t) => t.diasAtraso > 0);
  const graves = atrasados.filter((t) => t.diasAtraso > DIAS_TOLERANCIA_ATRASO);
  const semLimite = entrada.limite === null || entrada.limite <= 0;

  const bloqueios: Motivo[] = [];
  if (semLimite) bloqueios.push({ tipo: 'sem_limite' });
  if (graves.length > 0) {
    bloqueios.push({ tipo: 'atraso_grave', maiorAtrasoDias, quantidade: graves.length });
  }
  if (!semLimite && entrada.limite !== null && totalCent > centavos(entrada.limite)) {
    bloqueios.push({
      tipo: 'acima_limite',
      totalComPedido: reais(totalCent),
      limite: entrada.limite,
      excesso: reais(totalCent - centavos(entrada.limite)),
    });
  }

  let sugestao: Sugestao;
  let motivos: Motivo[];
  if (bloqueios.length > 0) {
    sugestao = 'bloquear';
    motivos = bloqueios;
  } else if (atrasados.length > 0) {
    sugestao = 'atencao';
    motivos = [{ tipo: 'atraso_leve', maiorAtrasoDias, quantidade: atrasados.length }];
  } else {
    sugestao = 'liberar';
    motivos = [{ tipo: 'em_dia' }];
  }

  return {
    sugestao,
    motivos,
    divida: reais(dividaCent),
    totalComPedido: reais(totalCent),
    limite: entrada.limite,
    maiorAtrasoDias,
    titulosEmAberto,
  };
}
