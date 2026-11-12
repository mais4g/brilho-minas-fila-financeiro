import { type RefObject, useId, useMemo, useRef, useState } from 'react';
import type { Sugestao } from '../dominio/credito';
import { ROTULO_SUGESTAO } from '../dominio/textos';
import type { DadosFinanceiro, PedidoFilaFinanceiro } from '../dominio/visoes';
import { formatarCanal, formatarCanalCurto, formatarData, formatarReais } from './formato';
import { IconeAviso, IconeBusca, IconeStatus } from './Icones';

type Filtro = 'todos' | Sugestao | 'aviso';
type Decisao = 'liberado' | 'bloqueado';

const GRUPOS: { sugestao: Sugestao; dica: string }[] = [
  { sugestao: 'bloquear', dica: 'Pela regra, não liberar. Fale com o vendedor antes.' },
  { sugestao: 'atencao', dica: 'Pode liberar; o vendedor precisa cobrar o atraso.' },
  { sugestao: 'liberar', dica: 'Dentro da regra. Confira os avisos e libere.' },
];

const soma = (pedidos: PedidoFilaFinanceiro[]) => formatarReais(pedidos.reduce((s, p) => s + p.valor, 0));
const normalizar = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function VisaoFinanceiro({ dados }: { dados: DadosFinanceiro }) {
  const fila = dados.fila;
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState<number | undefined>(fila[0]?.numero);
  const [decisoes, setDecisoes] = useState<Record<number, Decisao>>({});
  const [anuncio, setAnuncio] = useState('');
  const tituloDetalhe = useRef<HTMLHeadingElement>(null);

  const resumo = useMemo(() => {
    const de = (s: Sugestao) => fila.filter((p) => p.sugestao === s);
    const comAviso = fila.filter((p) => p.alertas.length > 0);
    return [
      { id: 'todos' as const, rotulo: 'Na fila', numero: fila.length, detalhe: `${soma(fila)} em pedidos` },
      { id: 'bloquear' as const, rotulo: 'Bloquear', numero: de('bloquear').length, detalhe: `${soma(de('bloquear'))} parados` },
      { id: 'atencao' as const, rotulo: 'Atenção', numero: de('atencao').length, detalhe: `${soma(de('atencao'))} · cobrar atraso` },
      { id: 'liberar' as const, rotulo: 'Liberar', numero: de('liberar').length, detalhe: `${soma(de('liberar'))} prontos` },
      { id: 'aviso' as const, rotulo: 'Com aviso', numero: comAviso.length, detalhe: 'conferir antes de decidir' },
    ];
  }, [fila]);

  const termo = normalizar(busca.trim());
  const visiveis = fila.filter(
    (p) =>
      (filtro === 'todos' || (filtro === 'aviso' ? p.alertas.length > 0 : p.sugestao === filtro)) &&
      (!termo || normalizar(`${p.numero} ${p.cliente?.razaoSocial ?? ''} ${p.vendedor?.nome ?? ''}`).includes(termo)),
  );
  const pedido = fila.find((p) => p.numero === selecionado) ?? fila[0];
  const decididos = Object.keys(decisoes).length;

  function abrir(numero: number, focar: boolean) {
    setSelecionado(numero);
    // Em tela estreita o detalhe fica abaixo da lista: leva o foco (e a rolagem) até ele.
    if (focar && window.matchMedia('(max-width: 1099px)').matches) {
      requestAnimationFrame(() => tituloDetalhe.current?.focus());
    }
  }

  function decidir(numero: number, decisao: Decisao) {
    const novas = { ...decisoes, [numero]: decisao };
    setDecisoes(novas);
    const proximo = fila.find((p) => !novas[p.numero]);
    if (proximo) setSelecionado(proximo.numero);
    setAnuncio(
      `Pedido ${numero} marcado como ${decisao}.${proximo ? ` Abrindo o pedido ${proximo.numero}.` : ' Todos os pedidos foram decididos.'}`,
    );
  }

  function desfazer(numero: number) {
    const { [numero]: _, ...resto } = decisoes;
    setDecisoes(resto);
    setAnuncio(`Decisão do pedido ${numero} desfeita.`);
  }

  function mudarFiltro(f: Filtro) {
    setFiltro(f);
    const n = fila.filter((p) => f === 'todos' || (f === 'aviso' ? p.alertas.length > 0 : p.sugestao === f)).length;
    setAnuncio(`${n} ${n === 1 ? 'pedido' : 'pedidos'} na lista.`);
  }

  return (
    <div className="mesa">
      <p className="so-leitor" aria-live="polite">
        {anuncio}
      </p>

      <section className="mesa__fila" aria-labelledby="titulo-fila">
        <div className="mesa__titulo">
          <div>
            <h1 id="titulo-fila" className="titulo">
              Pedidos aguardando <em>liberação</em>
            </h1>
            <p className="subtitulo">A sugestão segue a sua regra de crédito. Quem decide é você.</p>
          </div>
          <p className="mesa__progresso">
            {decididos === 0 ? 'Nenhum pedido decidido ainda' : `${decididos} de ${fila.length} decididos`}
          </p>
        </div>

        <div className="resumo" role="group" aria-label="Filtrar a fila">
          {resumo.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`resumo__item resumo__item--${r.id}`}
              aria-pressed={filtro === r.id}
              onClick={() => mudarFiltro(r.id)}
            >
              <span className="resumo__rotulo">
                <span className="resumo__ponto" aria-hidden="true" />
                {r.rotulo}
              </span>
              <span className="resumo__numero">{r.numero}</span>
              <span className="resumo__detalhe">{r.detalhe}</span>
            </button>
          ))}
        </div>

        <label className="busca">
          <IconeBusca />
          <span className="so-leitor">Buscar na fila</span>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cliente, número do pedido ou vendedor"
          />
        </label>

        <div className="tabela-fila">
          <div className="tabela-fila__cabecalho" aria-hidden="true">
            <span>Sugestão</span>
            <span>Pedido e motivo</span>
            <span>Vendedor e entrada</span>
            <span className="numero">Valor</span>
            <span>Crédito usado</span>
          </div>

          {visiveis.length === 0 && <p className="vazio">Nenhum pedido com esse filtro.</p>}

          {GRUPOS.map(({ sugestao, dica }) => {
            const pedidos = visiveis.filter((p) => p.sugestao === sugestao);
            if (pedidos.length === 0) return null;
            return (
              <section key={sugestao} aria-labelledby={`grupo-${sugestao}`}>
                <div className="grupo">
                  <h2 id={`grupo-${sugestao}`} className={`grupo__titulo tom-${sugestao}`}>
                    {ROTULO_SUGESTAO[sugestao]} · {pedidos.length}
                  </h2>
                  <p className="grupo__dica">{dica}</p>
                </div>
                <ul className="linhas">
                  {pedidos.map((p) => (
                    <li key={p.numero}>
                      <LinhaPedido
                        pedido={p}
                        selecionado={p.numero === pedido?.numero}
                        decisao={decisoes[p.numero]}
                        onAbrir={() => abrir(p.numero, true)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      {pedido && (
        <Detalhe
          pedido={pedido}
          decisao={decisoes[pedido.numero]}
          tituloRef={tituloDetalhe}
          onDecidir={(d) => decidir(pedido.numero, d)}
          onDesfazer={() => desfazer(pedido.numero)}
        />
      )}
    </div>
  );
}

function SeloSugestao({ sugestao, prefixo = '' }: { sugestao: Sugestao; prefixo?: string }) {
  return (
    <span className={`selo selo--${sugestao}`}>
      <IconeStatus sugestao={sugestao} />
      {prefixo}
      {ROTULO_SUGESTAO[sugestao]}
    </span>
  );
}

function LinhaPedido({
  pedido: p,
  selecionado,
  decisao,
  onAbrir,
}: {
  pedido: PedidoFilaFinanceiro;
  selecionado: boolean;
  decisao: Decisao | undefined;
  onAbrir: () => void;
}) {
  const pct = p.limite ? Math.round((p.totalComPedido / p.limite) * 100) : null;
  return (
    <button
      type="button"
      className={`linha ${selecionado ? 'linha--selecionada' : ''} ${decisao ? 'linha--decidida' : ''}`}
      aria-current={selecionado ? 'true' : undefined}
      aria-controls="detalhe-pedido"
      onClick={onAbrir}
    >
      <span className="linha__sugestao">
        <SeloSugestao sugestao={p.sugestao} />
      </span>
      <span className="linha__principal">
        <span className="linha__topo">
          <span className="mono linha__numero">
            <span className="so-leitor">Pedido </span>
            {p.numero}
          </span>
          <span className="linha__cliente">{p.cliente?.razaoSocial ?? 'Cliente não encontrado'}</span>
          {p.alertas.length > 0 && (
            <span className="etiqueta etiqueta--info">
              <IconeAviso tamanho={12} />
              {p.alertas.length === 1 ? '1 aviso' : `${p.alertas.length} avisos`}
            </span>
          )}
          {decisao && <span className="etiqueta etiqueta--decisao">{decisao === 'liberado' ? 'Liberado' : 'Bloqueado'}</span>}
        </span>
        <span className="linha__motivo">{p.motivos[0]}</span>
      </span>
      <span className="linha__quem">
        <span className="linha__vendedor">{p.vendedor?.nome ?? 'sem vendedor'}</span>
        <span className="linha__quando">
          {formatarData(p.criadoEm)} · {formatarCanalCurto(p.canal)}
        </span>
      </span>
      <span className="linha__valor numero">{formatarReais(p.valor)}</span>
      <span className="linha__credito">
        <BarraCredito pedido={p} fina />
        <span className={`linha__pct ${p.limite !== null && p.totalComPedido > p.limite ? 'tom-bloquear' : ''}`}>
          {pct === null ? 'sem limite' : `${pct}%`}
          <span className="so-leitor"> do limite</span>
        </span>
      </span>
    </button>
  );
}

function BarraCredito({ pedido: p, fina = false }: { pedido: PedidoFilaFinanceiro; fina?: boolean }) {
  if (p.limite === null) return <span className={`barra ${fina ? 'barra--fina' : ''}`} aria-hidden="true" />;
  const escala = Math.max(p.limite, p.totalComPedido);
  const passou = p.totalComPedido > p.limite;
  return (
    <span className={`barra ${fina ? 'barra--fina' : ''}`} aria-hidden="true">
      <span className="barra__divida" style={{ width: `${(p.divida / escala) * 100}%` }} />
      <span className={`barra__pedido ${passou ? 'barra__pedido--passou' : ''}`} style={{ width: `${(p.valor / escala) * 100}%` }} />
      <span className="barra__limite" style={{ left: `${(p.limite / escala) * 100}%` }} />
    </span>
  );
}

function Detalhe({
  pedido: p,
  decisao,
  tituloRef,
  onDecidir,
  onDesfazer,
}: {
  pedido: PedidoFilaFinanceiro;
  decisao: Decisao | undefined;
  tituloRef: RefObject<HTMLHeadingElement | null>;
  onDecidir: (d: Decisao) => void;
  onDesfazer: () => void;
}) {
  const idTabela = useId();
  const bloqueia = p.sugestao === 'bloquear';
  const passou = p.limite !== null && p.totalComPedido > p.limite;

  return (
    <aside id="detalhe-pedido" className="detalhe" aria-labelledby="titulo-detalhe">
      <div className="detalhe__cabecalho">
        <div className="detalhe__linha">
          <SeloSugestao sugestao={p.sugestao} prefixo="Sugestão: " />
          <span className="mono detalhe__numero">Pedido {p.numero}</span>
        </div>
        <h2 id="titulo-detalhe" className="detalhe__cliente" ref={tituloRef} tabIndex={-1}>
          {p.cliente?.razaoSocial ?? 'Cliente não encontrado'}
        </h2>
        <p className="detalhe__meta">
          {p.vendedor?.nome ?? 'sem vendedor'} · entrou {formatarData(p.criadoEm)} por {formatarCanal(p.canal)}
        </p>
      </div>

      <div className="detalhe__corpo">
        <section aria-labelledby="sec-porque">
          <h3 id="sec-porque" className="rotulo-secao">
            Por quê
          </h3>
          <ul className="motivos">
            {p.motivos.map((m) => (
              <li key={m} className={`motivos__item tom-marcador-${p.sugestao}`}>
                {m}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sec-credito">
          <h3 id="sec-credito" className="rotulo-secao">
            Crédito
          </h3>
          {p.limite === null ? (
            <p className="tom-bloquear forte">Sem limite de crédito cadastrado.</p>
          ) : (
            <>
              <BarraCredito pedido={p} />
              <dl className="credito">
                <div>
                  <dt>
                    <span className="legenda legenda--divida" aria-hidden="true" />
                    Dívida
                  </dt>
                  <dd>{formatarReais(p.divida)}</dd>
                </div>
                <div>
                  <dt>
                    <span className={`legenda ${passou ? 'legenda--passou' : 'legenda--pedido'}`} aria-hidden="true" />
                    Este pedido
                  </dt>
                  <dd>{formatarReais(p.valor)}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd className={passou ? 'tom-bloquear forte' : 'forte'}>{formatarReais(p.totalComPedido)}</dd>
                </div>
                <div>
                  <dt>
                    <span className="legenda legenda--limite" aria-hidden="true" />
                    Limite
                  </dt>
                  <dd>{formatarReais(p.limite)}</dd>
                </div>
              </dl>
            </>
          )}
        </section>

        {p.alertas.length > 0 && (
          <section className="aviso" aria-labelledby="sec-avisos">
            <h3 id="sec-avisos" className="aviso__titulo">
              <IconeAviso tamanho={16} />
              Antes de decidir
            </h3>
            <ul className="aviso__lista">
              {p.alertas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby={idTabela}>
          <h3 id={idTabela} className="rotulo-secao">
            Boletos em aberto
          </h3>
          {p.boletosEmAberto.length === 0 ? (
            <p className="suave">Nenhum. Cliente em dia.</p>
          ) : (
            <table className="tabela">
              <caption className="so-leitor">Boletos em aberto do cliente</caption>
              <thead>
                <tr>
                  <th scope="col">Boleto</th>
                  <th scope="col">Vencimento</th>
                  <th scope="col" className="numero">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {p.boletosEmAberto.map((b) => (
                  <tr key={b.id}>
                    <td className="mono">
                      {b.id}
                      {p.cliente && b.clienteId !== p.cliente.id && <span className="etiqueta">{b.clienteId}</span>}
                    </td>
                    <td>
                      {formatarData(b.vencimento)} ·{' '}
                      <span className={b.diasAtraso > 5 ? 'tom-bloquear forte' : b.diasAtraso > 0 ? 'tom-atencao forte' : 'suave'}>
                        {b.diasAtraso > 0 ? `${b.diasAtraso} ${b.diasAtraso === 1 ? 'dia' : 'dias'} de atraso` : 'a vencer'}
                      </span>
                    </td>
                    <td className="numero forte">{formatarReais(b.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section aria-labelledby="sec-itens">
          <h3 id="sec-itens" className="rotulo-secao">
            Itens
          </h3>
          <ul className="itens">
            {p.itens.map((i, n) => (
              <li key={`${i.descricao}-${n}`}>
                <span>
                  {i.quantidade}× {i.descricao}
                </span>
                <span className="numero suave">{formatarReais(i.quantidade * i.precoUnitario)}</span>
              </li>
            ))}
          </ul>
          {p.cliente && (
            <p className="detalhe__cadastro">
              {p.cliente.id} · CNPJ {p.cliente.cnpj || 'não informado'} · {p.cliente.cidade}
            </p>
          )}
        </section>
      </div>

      <div className="detalhe__acoes">
        {decisao ? (
          <div className="decidido">
            <p>
              <strong>Marcado como {decisao}.</strong> Por enquanto fica só nesta tela; na versão integrada, grava no Sistemão e avisa o vendedor.
            </p>
            <button type="button" className="botao botao--secundario" onClick={onDesfazer}>
              Desfazer
            </button>
          </div>
        ) : (
          <>
            <div className="acoes">
              <button
                type="button"
                className={`botao ${bloqueia ? 'botao--bloquear' : 'botao--liberar'}`}
                onClick={() => onDecidir(bloqueia ? 'bloqueado' : 'liberado')}
              >
                {bloqueia ? 'Bloquear pedido' : p.sugestao === 'atencao' ? 'Liberar e pedir cobrança' : 'Liberar pedido'}
              </button>
              <button type="button" className="botao botao--secundario" onClick={() => onDecidir(bloqueia ? 'liberado' : 'bloqueado')}>
                {bloqueia ? 'Liberar mesmo assim' : 'Bloquear'}
              </button>
            </div>
            <p className="acoes__nota">Ao decidir, o próximo pedido pendente abre aqui.</p>
          </>
        )}
      </div>
    </aside>
  );
}
