import { useState } from 'react';
import type { Sugestao } from '../dominio/credito';
import type { ClienteVendedor, DadosVendedor, PedidoVendedor } from '../dominio/visoes';
import { formatarData, formatarReais } from './formato';

type Aba = 'pedidos' | 'clientes';

const ORDEM_SITUACAO: Record<Sugestao, number> = { bloquear: 0, atencao: 1, liberar: 2 };

export function VisaoVendedor({ dados }: { dados: DadosVendedor }) {
  const [aba, setAba] = useState<Aba>('pedidos');
  const primeiroNome = dados.vendedor.nome.split(' ')[0];

  // O que tem problema primeiro; dentro de cada situação, o mais recente.
  const noFinanceiro = dados.pedidos
    .filter((p) => p.situacao !== null)
    .sort((a, b) => ORDEM_SITUACAO[a.situacao?.sugestao ?? 'liberar'] - ORDEM_SITUACAO[b.situacao?.sugestao ?? 'liberar'] || b.criadoEm.localeCompare(a.criadoEm));
  const emAndamento = dados.pedidos.filter((p) => p.status === 'separacao' || p.status === 'em_rota');
  const historico = dados.pedidos.filter((p) => p.status === 'entregue' || p.status === 'cancelado');
  const travados = noFinanceiro.filter((p) => p.situacao?.sugestao === 'bloquear').length;

  return (
    <section className="vendedor" aria-labelledby="titulo-vendedor">
      <div className="cabecalho-visao">
        <h1 id="titulo-vendedor">Olá, {primeiroNome}</h1>
        <p className="subtitulo">
          {noFinanceiro.length === 0
            ? 'Nenhum pedido seu esperando o financeiro.'
            : `${noFinanceiro.length} ${noFinanceiro.length === 1 ? 'pedido esperando' : 'pedidos esperando'} o financeiro${travados > 0 ? `, ${travados} com problema` : ''}.`}
        </p>
      </div>

      <div className="abas" role="tablist" aria-label="O que ver">
        <button type="button" role="tab" id="aba-pedidos" aria-controls="painel-pedidos" aria-selected={aba === 'pedidos'} className="aba" onClick={() => setAba('pedidos')}>
          Meus pedidos
        </button>
        <button type="button" role="tab" id="aba-clientes" aria-controls="painel-clientes" aria-selected={aba === 'clientes'} className="aba" onClick={() => setAba('clientes')}>
          Meus clientes
        </button>
      </div>

      {aba === 'pedidos' ? (
        <div role="tabpanel" id="painel-pedidos" aria-labelledby="aba-pedidos">
          <Grupo titulo="Esperando o financeiro" pedidos={noFinanceiro} vazio="Nada esperando o financeiro." />
          <Grupo titulo="Em separação ou a caminho" pedidos={emAndamento} vazio="Nenhum pedido em separação ou a caminho." />
          {historico.length > 0 && (
            <details className="historico">
              <summary>Entregues e cancelados ({historico.length})</summary>
              <ol className="lista-pedidos">
                {historico.map((p) => (
                  <li key={p.numero}>
                    <CartaoPedidoVendedor pedido={p} />
                  </li>
                ))}
              </ol>
            </details>
          )}
        </div>
      ) : (
        <div role="tabpanel" id="painel-clientes" aria-labelledby="aba-clientes">
          <ListaClientes clientes={dados.clientes} />
        </div>
      )}
    </section>
  );
}

function Grupo({ titulo, pedidos, vazio }: { titulo: string; pedidos: PedidoVendedor[]; vazio: string }) {
  return (
    <section className="secao">
      <h2 className="secao__titulo">
        {titulo} <span className="secao__numero">{pedidos.length}</span>
      </h2>
      {pedidos.length === 0 ? (
        <p className="vazio">{vazio}</p>
      ) : (
        <ol className="lista-pedidos">
          {pedidos.map((p) => (
            <li key={p.numero}>
              <CartaoPedidoVendedor pedido={p} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function CartaoPedidoVendedor({ pedido: p }: { pedido: PedidoVendedor }) {
  const s = p.situacao;
  return (
    <article className={`cartao cartao--compacto ${s ? `cartao--${s.sugestao}` : 'cartao--neutro'}`}>
      <div className="cartao__linha">
        <h3 className="cartao__cliente">{p.cliente}</h3>
        <strong className="cartao__valor-simples">{formatarReais(p.valor)}</strong>
      </div>
      <p className="cartao__meta">
        Pedido {p.numero} · {formatarData(p.criadoEm)} · {p.rotuloStatus}
      </p>
      {s && (
        <div className={`situacao situacao--${s.sugestao}`}>
          <p className="situacao__titulo">
            {p.status === 'bloqueado_financeiro' ? 'Financeiro' : 'Previsão do financeiro'}{' '}
            <span className={`selo selo--${s.sugestao}`}>{s.rotulo}</span>
          </p>
          <p>{s.texto}</p>
        </div>
      )}
      {p.aviso && <p className="aviso-vendedor">{p.aviso}</p>}
      <p className="itens-resumo">{p.itens.map((i) => `${i.quantidade}× ${i.descricao}`).join(' · ')}</p>
    </article>
  );
}

function ListaClientes({ clientes }: { clientes: ClienteVendedor[] }) {
  const ordenados = [...clientes].sort(
    (a, b) => ORDEM_SITUACAO[a.situacao.sugestao] - ORDEM_SITUACAO[b.situacao.sugestao] || a.razaoSocial.localeCompare(b.razaoSocial, 'pt-BR'),
  );
  return (
    <section className="secao">
      <p className="secao__dica">Antes de prometer entrega, veja como está o cliente no financeiro.</p>
      <ul className="lista-clientes">
        {ordenados.map((c) => (
          <li key={c.id} className={`cliente cliente--${c.situacao.sugestao}`}>
            <div className="cartao__linha">
              <h3 className="cartao__cliente">{c.razaoSocial}</h3>
              <span className={`selo selo--${c.situacao.sugestao}`}>{c.situacao.rotulo}</span>
            </div>
            <p className="cartao__meta">{c.cidade}</p>
            {c.situacao.sugestao !== 'liberar' && <p className="cliente__texto">{c.situacao.texto}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
