import { useState } from 'react';
import type { Sugestao } from '../dominio/credito';
import type { ClienteVendedor, DadosVendedor, PedidoVendedor } from '../dominio/visoes';
import { formatarData, formatarReais } from './formato';
import { IconeAviso, IconeBusca, IconeClientes, IconePedidos, IconeStatus } from './Icones';

type Aba = 'pedidos' | 'clientes';

const ORDEM: Record<Sugestao, number> = { bloquear: 0, atencao: 1, liberar: 2 };

/** Enquanto a Marta não decide, o vendedor vê uma previsão, nunca uma decisão. */
const PREVISAO: Record<Sugestao, string> = {
  bloquear: 'Deve ser bloqueado',
  atencao: 'Deve sair · cobrar cliente',
  liberar: 'Deve ser liberado',
};

const SITUACAO_CLIENTE: Record<Sugestao, string> = {
  bloquear: 'Bloqueado',
  atencao: 'Atenção',
  liberar: 'Liberado',
};

function abaDoEndereco(): Aba {
  return window.location.hash === '#clientes' ? 'clientes' : 'pedidos';
}

export function VisaoVendedor({ dados }: { dados: DadosVendedor }) {
  const [aba, setAbaEstado] = useState<Aba>(abaDoEndereco);
  const primeiroNome = dados.vendedor.nome.split(' ')[0];

  // A aba fica no endereço (#clientes) para dar para salvar um atalho direto.
  const setAba = (nova: Aba) => {
    setAbaEstado(nova);
    window.history.replaceState(null, '', nova === 'clientes' ? '#clientes' : window.location.pathname);
    window.scrollTo({ top: 0 });
  };

  const noFinanceiro = dados.pedidos
    .filter((p) => p.situacao !== null)
    .sort((a, b) => ORDEM[a.situacao?.sugestao ?? 'liberar'] - ORDEM[b.situacao?.sugestao ?? 'liberar'] || b.criadoEm.localeCompare(a.criadoEm));
  const precisam = noFinanceiro.filter((p) => p.situacao?.sugestao !== 'liberar');
  const devemSair = noFinanceiro.filter((p) => p.situacao?.sugestao === 'liberar');
  const andamento = dados.pedidos.filter((p) => p.status === 'separacao' || p.status === 'em_rota');
  const historico = dados.pedidos.filter((p) => p.status === 'entregue' || p.status === 'cancelado');
  const conta = (s: Sugestao) => noFinanceiro.filter((p) => p.situacao?.sugestao === s).length;

  return (
    <div className="celular">
      <nav className="abas-inferiores" aria-label="Seções">
        <button type="button" className="aba-inferior" aria-current={aba === 'pedidos' ? 'page' : undefined} onClick={() => setAba('pedidos')}>
          <IconePedidos />
          Meus pedidos
        </button>
        <button type="button" className="aba-inferior" aria-current={aba === 'clientes' ? 'page' : undefined} onClick={() => setAba('clientes')}>
          <IconeClientes />
          Meus clientes
        </button>
      </nav>
      {aba === 'pedidos' ? (
        <section aria-labelledby="titulo-vendedor">
          <div className="celular__cabecalho">
            <h1 id="titulo-vendedor" className="titulo">
              Olá, <em>{primeiroNome}</em>
            </h1>
            <p className="subtitulo">
              {noFinanceiro.length === 0
                ? 'Nenhum pedido seu esperando o financeiro.'
                : `${noFinanceiro.length} ${noFinanceiro.length === 1 ? 'pedido esperando' : 'pedidos esperando'} o financeiro`}
            </p>
            {noFinanceiro.length > 0 && (
              <ul className="contadores" aria-label="Resumo">
                <li className="contadores__item contadores__item--bloquear">
                  <strong>{conta('bloquear')}</strong> travados
                </li>
                <li className="contadores__item contadores__item--atencao">
                  <strong>{conta('atencao')}</strong> cobrar cliente
                </li>
                <li className="contadores__item contadores__item--liberar">
                  <strong>{conta('liberar')}</strong> devem sair
                </li>
              </ul>
            )}
          </div>

          <Grupo titulo="Precisam de você" pedidos={precisam} />
          <Grupo titulo="Devem ser liberados" pedidos={devemSair} />
          <Grupo titulo="Em separação ou a caminho" pedidos={andamento} />
          {historico.length > 0 && (
            <details className="historico">
              <summary>Ver {historico.length} entregues e cancelados</summary>
              <ul className="cartoes">
                {historico.map((p) => (
                  <li key={p.numero}>
                    <CartaoPedido pedido={p} />
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      ) : (
        <Clientes clientes={dados.clientes} />
      )}

    </div>
  );
}

function Grupo({ titulo, pedidos }: { titulo: string; pedidos: PedidoVendedor[] }) {
  if (pedidos.length === 0) return null;
  return (
    <section className="celular__grupo" aria-label={titulo}>
      <h2 className="rotulo-secao">
        {titulo} · {pedidos.length}
      </h2>
      <ul className="cartoes">
        {pedidos.map((p) => (
          <li key={p.numero}>
            <CartaoPedido pedido={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CartaoPedido({ pedido: p }: { pedido: PedidoVendedor }) {
  const s = p.situacao;
  const barrado = p.status === 'bloqueado_financeiro';
  return (
    <article className="cartao" aria-labelledby={`pedido-${p.numero}`}>
      <div className="cartao__linha">
        {s ? (
          <span className={`selo selo--${s.sugestao}`}>
            <IconeStatus sugestao={s.sugestao} />
            {barrado ? 'Barrado pelo financeiro' : PREVISAO[s.sugestao]}
          </span>
        ) : (
          <span className="selo selo--neutro">{p.rotuloStatus}</span>
        )}
        <span className="cartao__valor">{formatarReais(p.valor)}</span>
      </div>
      <h3 id={`pedido-${p.numero}`} className="cartao__cliente">
        {p.cliente}
      </h3>
      {s && <p className="cartao__mensagem">{s.texto}</p>}
      {p.aviso && (
        <p className="cartao__aviso">
          <IconeAviso tamanho={16} />
          {p.aviso}
        </p>
      )}
      <p className="cartao__meta">
        <span className="mono">Pedido {p.numero}</span> · {formatarData(p.criadoEm)}
        {s && !barrado ? ' · na fila do financeiro' : ''}
      </p>
      <p className="cartao__itens">{p.itens.map((i) => `${i.quantidade}× ${i.descricao}`).join(' · ')}</p>
    </article>
  );
}

function Clientes({ clientes }: { clientes: ClienteVendedor[] }) {
  const [busca, setBusca] = useState('');
  const termo = busca.trim().toLowerCase();
  const filtrados = clientes
    .filter((c) => !termo || c.razaoSocial.toLowerCase().includes(termo))
    .sort((a, b) => ORDEM[a.situacao.sugestao] - ORDEM[b.situacao.sugestao] || a.razaoSocial.localeCompare(b.razaoSocial, 'pt-BR'));
  const conversar = filtrados.filter((c) => c.situacao.sugestao !== 'liberar');
  const emDia = filtrados.filter((c) => c.situacao.sugestao === 'liberar');

  return (
    <section aria-labelledby="titulo-clientes">
      <div className="celular__cabecalho">
        <h1 id="titulo-clientes" className="titulo">
          Meus <em>clientes</em>
        </h1>
        <p className="subtitulo">Antes de prometer entrega, veja como o cliente está no financeiro.</p>
        <label className="busca busca--redonda">
          <IconeBusca />
          <span className="so-leitor">Buscar cliente</span>
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente" />
        </label>
      </div>

      {filtrados.length === 0 && <p className="vazio">Nenhum cliente com esse nome.</p>}

      {conversar.length > 0 && (
        <section className="celular__grupo" aria-label="Precisam de conversa">
          <h2 className="rotulo-secao">Precisam de conversa · {conversar.length}</h2>
          <ul className="cartoes">
            {conversar.map((c) => (
              <li key={c.id} className="cartao">
                <div className="cartao__linha">
                  <div>
                    <h3 className="cartao__cliente">{c.razaoSocial}</h3>
                    <p className="cartao__meta">{c.cidade}</p>
                  </div>
                  <span className={`selo selo--${c.situacao.sugestao}`}>
                    <IconeStatus sugestao={c.situacao.sugestao} />
                    {SITUACAO_CLIENTE[c.situacao.sugestao]}
                  </span>
                </div>
                <p className="cartao__mensagem">{c.situacao.texto}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {emDia.length > 0 && (
        <section className="celular__grupo" aria-label="Em dia">
          <h2 className="rotulo-secao">Em dia · {emDia.length}</h2>
          <ul className="lista-compacta">
            {emDia.map((c) => (
              <li key={c.id}>
                <div>
                  <h3 className="cartao__cliente">{c.razaoSocial}</h3>
                  <p className="cartao__meta">{c.cidade}</p>
                </div>
                <span className="selo selo--liberar">
                  <IconeStatus sugestao="liberar" />
                  Liberado
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
