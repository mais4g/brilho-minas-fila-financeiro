import { useMemo, useState } from 'react';
import type { Sugestao } from '../dominio/credito';
import { ROTULO_SUGESTAO } from '../dominio/textos';
import type { DadosFinanceiro, PedidoFilaFinanceiro } from '../dominio/visoes';
import { formatarCanal, formatarData, formatarReais } from './formato';

type Filtro = 'todos' | Sugestao | 'alertas';

const SECOES: { sugestao: Sugestao; titulo: string; dica: string }[] = [
  { sugestao: 'bloquear', titulo: 'Bloquear', dica: 'Pela regra, não liberar. Confira o motivo e avise o vendedor.' },
  { sugestao: 'atencao', titulo: 'Atenção', dica: 'Pode liberar, mas o vendedor precisa cobrar o boleto em atraso.' },
  { sugestao: 'liberar', titulo: 'Liberar', dica: 'Dentro da regra. Confira os avisos, se houver, e libere.' },
];

export function VisaoFinanceiro({ dados }: { dados: DadosFinanceiro }) {
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [busca, setBusca] = useState('');

  const contagem = useMemo(() => {
    const c = { todos: dados.fila.length, bloquear: 0, atencao: 0, liberar: 0, alertas: 0 };
    for (const p of dados.fila) {
      c[p.sugestao] += 1;
      if (p.alertas.length > 0) c.alertas += 1;
    }
    return c;
  }, [dados.fila]);

  const termo = normalizar(busca.trim());
  const visiveis = dados.fila.filter(
    (p) =>
      (filtro === 'todos' || (filtro === 'alertas' ? p.alertas.length > 0 : p.sugestao === filtro)) &&
      (!termo || normalizar(`${p.numero} ${p.cliente?.razaoSocial ?? ''} ${p.vendedor?.nome ?? ''}`).includes(termo)),
  );

  const filtros: { id: Filtro; rotulo: string }[] = [
    { id: 'todos', rotulo: 'Todos' },
    { id: 'bloquear', rotulo: 'Bloquear' },
    { id: 'atencao', rotulo: 'Atenção' },
    { id: 'liberar', rotulo: 'Liberar' },
    { id: 'alertas', rotulo: 'Com aviso' },
  ];

  return (
    <section aria-labelledby="titulo-fila">
      <div className="cabecalho-visao">
        <h1 id="titulo-fila">Pedidos aguardando liberação</h1>
        <p className="subtitulo">
          {contagem.todos} pedidos na fila. A sugestão segue a sua regra de crédito; a decisão continua sendo sua.
        </p>
      </div>

      <div className="barra-filtros">
        <div className="filtros" role="group" aria-label="Filtrar pela sugestão">
          {filtros.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filtro filtro--${f.id}`}
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
            >
              {f.rotulo} <span className="filtro__numero">{contagem[f.id]}</span>
            </button>
          ))}
        </div>
        <input
          className="busca"
          type="search"
          placeholder="Buscar cliente, pedido ou vendedor"
          aria-label="Buscar cliente, pedido ou vendedor"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {visiveis.length === 0 && <p className="vazio">Nenhum pedido com esse filtro.</p>}

      {SECOES.map((secao) => {
        const pedidos = visiveis.filter((p) => p.sugestao === secao.sugestao);
        if (pedidos.length === 0) return null;
        return (
          <section key={secao.sugestao} className="secao" aria-labelledby={`secao-${secao.sugestao}`}>
            <h2 id={`secao-${secao.sugestao}`} className={`secao__titulo secao__titulo--${secao.sugestao}`}>
              {secao.titulo} <span className="secao__numero">{pedidos.length}</span>
            </h2>
            <p className="secao__dica">{secao.dica}</p>
            <ol className="lista-pedidos">
              {pedidos.map((p) => (
                <li key={p.numero}>
                  <CartaoPedido pedido={p} />
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </section>
  );
}

function CartaoPedido({ pedido: p }: { pedido: PedidoFilaFinanceiro }) {
  return (
    <article className={`cartao cartao--${p.sugestao}`} aria-label={`Pedido ${p.numero}: ${ROTULO_SUGESTAO[p.sugestao]}`}>
      <div className="cartao__topo">
        <span className={`selo selo--${p.sugestao}`}>{ROTULO_SUGESTAO[p.sugestao]}</span>
        <div className="cartao__identificacao">
          <h3 className="cartao__cliente">{p.cliente?.razaoSocial ?? 'Cliente não encontrado'}</h3>
          <p className="cartao__meta">
            Pedido {p.numero} · {formatarData(p.criadoEm)} · {p.vendedor?.nome ?? 'sem vendedor'} · {formatarCanal(p.canal)}
          </p>
        </div>
        <div className="cartao__valor">
          <span className="cartao__valor-rotulo">Pedido</span>
          <strong>{formatarReais(p.valor)}</strong>
        </div>
      </div>

      <ul className="motivos">
        {p.motivos.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>

      <BarraCredito pedido={p} />

      {p.alertas.length > 0 && (
        <ul className="avisos" aria-label="Avisos">
          {p.alertas.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      )}

      <details className="detalhes">
        <summary>Itens e boletos</summary>
        <div className="detalhes__grade">
          <div>
            <h4>Itens</h4>
            <table className="tabela">
              <tbody>
                {p.itens.map((i) => (
                  <tr key={i.descricao}>
                    <td>{i.quantidade}×</td>
                    <td>{i.descricao}</td>
                    <td className="numero">{formatarReais(i.quantidade * i.precoUnitario)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h4>Boletos em aberto</h4>
            {p.boletosEmAberto.length === 0 ? (
              <p className="sem-itens">Nenhum.</p>
            ) : (
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Boleto</th>
                    <th>Vencimento</th>
                    <th className="numero">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {p.boletosEmAberto.map((b) => (
                    <tr key={b.id} className={b.diasAtraso > 5 ? 'linha--grave' : b.diasAtraso > 0 ? 'linha--leve' : ''}>
                      <td>
                        {b.id}
                        {p.cliente && b.clienteId !== p.cliente.id && <span className="etiqueta">{b.clienteId}</span>}
                      </td>
                      <td>
                        {formatarData(b.vencimento)}
                        {b.diasAtraso > 0 && <span className="atraso"> · {b.diasAtraso} {b.diasAtraso === 1 ? 'dia' : 'dias'} de atraso</span>}
                      </td>
                      <td className="numero">{formatarReais(b.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {p.cliente && (
          <p className="detalhes__cliente">
            {p.cliente.id} · CNPJ {p.cliente.cnpj || 'não informado'} · {p.cliente.segmento} · {p.cliente.cidade}
          </p>
        )}
      </details>
    </article>
  );
}

/** Quanto do limite fica comprometido se este pedido for liberado. */
function BarraCredito({ pedido: p }: { pedido: PedidoFilaFinanceiro }) {
  if (p.limite === null) {
    return <p className="credito credito--sem-limite">Sem limite de crédito cadastrado.</p>;
  }
  const escala = Math.max(p.limite, p.totalComPedido);
  const pctDivida = (p.divida / escala) * 100;
  const pctPedido = (p.valor / escala) * 100;
  const pctLimite = (p.limite / escala) * 100;
  const passou = p.totalComPedido > p.limite;

  return (
    <div className="credito">
      <div
        className="credito__barra"
        role="img"
        aria-label={`Dívida ${formatarReais(p.divida)} mais pedido ${formatarReais(p.valor)} somam ${formatarReais(p.totalComPedido)} de ${formatarReais(p.limite)} de limite`}
      >
        <span className="credito__divida" style={{ width: `${pctDivida}%` }} />
        <span className={`credito__pedido ${passou ? 'credito__pedido--passou' : ''}`} style={{ width: `${pctPedido}%` }} />
        <span className="credito__limite" style={{ left: `${pctLimite}%` }} />
      </div>
      <p className="credito__legenda">
        <span className="legenda legenda--divida">Dívida {formatarReais(p.divida)}</span>
        <span className="legenda legenda--pedido">+ pedido {formatarReais(p.valor)}</span>
        <span className={passou ? 'legenda--passou' : ''}>
          = {formatarReais(p.totalComPedido)} de {formatarReais(p.limite)}
        </span>
      </p>
    </div>
  );
}

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}
