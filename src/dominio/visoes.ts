import type { Base } from './carregar';
import type { Sugestao } from './credito';
import type { StatusPedido } from './esquemas';
import { type AnalisePedido, analisarPedido, filaDoFinanceiro, STATUS_COM_CREDITO, situacaoDoCliente } from './fila';
import {
  alertaFinanceiro,
  motivoFinanceiro,
  motivoParaVendedor,
  ROTULO_SITUACAO_VENDEDOR,
  ROTULO_STATUS,
  TEXTO_MOTIVO_VENDEDOR,
  TEXTO_MOTIVO_VENDEDOR_CLIENTE,
} from './textos';

/**
 * Projeções dos dados por perfil ("Quem pode ver o quê"). Cada página recebe
 * SÓ a projeção do seu perfil; os tipos abaixo são a lista do que é permitido.
 *
 * - Financeiro: todos os pedidos, clientes e boletos, MENOS comissão.
 *   Telefone também fica de fora: a tela não usa (minimização, LGPD).
 * - Vendedor: só os próprios clientes e pedidos; do financeiro, só a
 *   situação (liberado / atenção / bloqueado) e um motivo sem números.
 */

export interface PerfilDisponivel {
  id: string;
  nome: string;
  descricao: string;
  arquivo: string;
}

// ---- Financeiro -------------------------------------------------------------

export interface BoletoEmAbertoFinanceiro {
  id: string;
  valor: number;
  vencimento: string;
  diasAtraso: number;
  clienteId: string;
}

export interface PedidoFilaFinanceiro {
  numero: number;
  criadoEm: string;
  canal: string;
  cliente: { id: string; razaoSocial: string; cnpj: string; segmento: string; cidade: string } | null;
  vendedor: { id: string; nome: string } | null;
  itens: { descricao: string; quantidade: number; precoUnitario: number }[];
  valor: number;
  sugestao: Sugestao;
  motivos: string[];
  divida: number;
  totalComPedido: number;
  limite: number | null;
  maiorAtrasoDias: number;
  boletosEmAberto: BoletoEmAbertoFinanceiro[];
  alertas: string[];
}

export interface DadosFinanceiro {
  perfil: 'financeiro';
  dataReferencia: string;
  perfis: PerfilDisponivel[];
  fila: PedidoFilaFinanceiro[];
}

// ---- Vendedor ---------------------------------------------------------------

export interface SituacaoVendedor {
  sugestao: Sugestao;
  rotulo: string;
  texto: string;
}

export interface PedidoVendedor {
  numero: number;
  criadoEm: string;
  cliente: string;
  status: StatusPedido;
  rotuloStatus: string;
  itens: { descricao: string; quantidade: number }[];
  /** Valor do próprio pedido (é do vendedor; não é dado de dívida). */
  valor: number;
  /** Só para pedidos que ainda dependem do financeiro. */
  situacao: SituacaoVendedor | null;
  /** Aviso operacional (ex.: pedido possivelmente lançado duas vezes). */
  aviso: string | null;
}

export interface ClienteVendedor {
  id: string;
  razaoSocial: string;
  cidade: string;
  situacao: SituacaoVendedor;
}

export interface DadosVendedor {
  perfil: 'vendedor';
  dataReferencia: string;
  perfis: PerfilDisponivel[];
  vendedor: { id: string; nome: string; regiao: string };
  pedidos: PedidoVendedor[];
  clientes: ClienteVendedor[];
}

export type DadosPerfil = DadosFinanceiro | DadosVendedor;

// ---- Projeções --------------------------------------------------------------

export const arquivoDoPerfil = (id: string) => (id === 'financeiro' ? 'financeiro.html' : `vendedor-${id.toLowerCase()}.html`);

export function listarPerfis(base: Base): PerfilDisponivel[] {
  return [
    { id: 'financeiro', nome: 'Marta', descricao: 'Financeiro', arquivo: arquivoDoPerfil('financeiro') },
    ...[...base.vendedores.values()]
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      .map((v) => ({ id: v.id, nome: v.nome, descricao: `Vendas · ${v.regiao}`, arquivo: arquivoDoPerfil(v.id) })),
  ];
}

export function projetarFinanceiro(base: Base, dataReferencia: string): DadosFinanceiro {
  const fila = filaDoFinanceiro(base, dataReferencia).map(({ pedido, valorConsiderado, credito, alertas }): PedidoFilaFinanceiro => {
    const c = base.clientes.get(pedido.cliente_id);
    const v = pedido.vendedor_id ? base.vendedores.get(pedido.vendedor_id) : undefined;
    return {
      numero: pedido.numero,
      criadoEm: pedido.criado_em,
      canal: pedido.canal_origem,
      cliente: c ? { id: c.id, razaoSocial: c.razao_social, cnpj: c.cnpj, segmento: c.segmento, cidade: c.cidade } : null,
      vendedor: v ? { id: v.id, nome: v.nome } : null,
      itens: pedido.itens.map((i) => ({ descricao: i.descricao, quantidade: i.quantidade, precoUnitario: i.preco_unitario })),
      valor: valorConsiderado,
      sugestao: credito.sugestao,
      motivos: credito.motivos.map((m) => motivoFinanceiro(m, credito)),
      divida: credito.divida,
      totalComPedido: credito.totalComPedido,
      limite: credito.limite,
      maiorAtrasoDias: credito.maiorAtrasoDias,
      boletosEmAberto: credito.titulosEmAberto.map((t) => ({
        id: t.id,
        valor: t.valor,
        vencimento: t.vencimento,
        diasAtraso: t.diasAtraso,
        clienteId: base.titulos.find((x) => x.id === t.id)?.cliente_id ?? '',
      })),
      alertas: alertas.map(alertaFinanceiro),
    };
  });
  return { perfil: 'financeiro', dataReferencia, perfis: listarPerfis(base), fila };
}

function situacaoVendedor(
  sugestao: Sugestao,
  motivos: Parameters<typeof motivoParaVendedor>[0],
  textos: typeof TEXTO_MOTIVO_VENDEDOR = TEXTO_MOTIVO_VENDEDOR,
): SituacaoVendedor {
  return { sugestao, rotulo: ROTULO_SITUACAO_VENDEDOR[sugestao], texto: textos[motivoParaVendedor(motivos)] };
}

function avisoDuplicidade(analise: AnalisePedido | null): string | null {
  const dup = analise?.alertas.find((a) => a.tipo === 'possivel_duplicado');
  return dup ? `Parece o mesmo pedido que o ${dup.outroPedido}. Se foi enviado duas vezes, avise o comercial.` : null;
}

export function projetarVendedor(base: Base, vendedorId: string, dataReferencia: string): DadosVendedor {
  const vendedor = base.vendedores.get(vendedorId);
  if (!vendedor) throw new Error(`Vendedor ${vendedorId} não existe`);

  // Só clientes cujo responsável é este vendedor.
  const meusClientes = [...base.clientes.values()].filter((c) => c.vendedor_id === vendedorId);
  const ehMeuCliente = new Set(meusClientes.map((c) => c.id));

  // Pedido aparece só se for dele E o cliente for dele (na dúvida, não mostra).
  const pedidos = base.pedidos
    .filter((p) => p.vendedor_id === vendedorId && ehMeuCliente.has(p.cliente_id))
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
    .map((p): PedidoVendedor => {
      const precisaCredito = STATUS_COM_CREDITO.includes(p.status);
      const analise = precisaCredito ? analisarPedido(base, p, dataReferencia) : null;
      return {
        numero: p.numero,
        criadoEm: p.criado_em,
        cliente: base.clientes.get(p.cliente_id)?.razao_social ?? '',
        status: p.status,
        rotuloStatus: ROTULO_STATUS[p.status],
        itens: p.itens.map((i) => ({ descricao: i.descricao, quantidade: i.quantidade })),
        valor: p.valor_total,
        situacao: !analise
          ? null
          : p.status === 'bloqueado_financeiro' && analise.credito.sugestao !== 'bloquear'
            ? // A decisão da Marta vale mais que a sugestão da regra.
              { sugestao: 'bloquear', rotulo: ROTULO_SITUACAO_VENDEDOR.bloquear, texto: TEXTO_MOTIVO_VENDEDOR.barrado_pelo_financeiro }
            : situacaoVendedor(analise.credito.sugestao, analise.credito.motivos),
        aviso: avisoDuplicidade(analise),
      };
    });

  const clientes = meusClientes
    .map((c): ClienteVendedor => {
      const { credito } = situacaoDoCliente(base, c.id, dataReferencia);
      return { id: c.id, razaoSocial: c.razao_social, cidade: c.cidade, situacao: situacaoVendedor(credito.sugestao, credito.motivos, TEXTO_MOTIVO_VENDEDOR_CLIENTE) };
    })
    .sort((a, b) => a.razaoSocial.localeCompare(b.razaoSocial, 'pt-BR'));

  return {
    perfil: 'vendedor',
    dataReferencia,
    perfis: listarPerfis(base),
    vendedor: { id: vendedor.id, nome: vendedor.nome, regiao: vendedor.regiao },
    pedidos,
    clientes,
  };
}
