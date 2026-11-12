import type { DadosInicio, PerfilDisponivel } from '../dominio/visoes';

/**
 * Página de entrada (tela/index.html): escolher quem está olhando. Não recebe
 * nenhum dado de cliente ou pedido, só a lista de perfis.
 */
export function PaginaInicial({ dados }: { dados: DadosInicio }) {
  const financeiro = dados.perfis.filter((p) => p.id === 'financeiro');
  const vendedores = dados.perfis.filter((p) => p.id !== 'financeiro');

  return (
    <div className="inicio">
      <div className="inicio__cabecalho">
        <p className="rotulo-secao">Fila de liberação de pedidos</p>
        <h1 id="titulo-inicio" className="titulo">
          Quem está <em>olhando</em>?
        </h1>
        <p className="subtitulo">Escolha um perfil. Cada um abre só com os dados que pode ver.</p>
      </div>

      <section aria-labelledby="grupo-financeiro" className="inicio__grupo">
        <h2 id="grupo-financeiro" className="rotulo-secao">
          Financeiro
        </h2>
        <ul className="perfis">
          {financeiro.map((p) => (
            <CartaoPerfil key={p.id} perfil={p} detalhe="Fila com a sugestão e o motivo de cada pedido" />
          ))}
        </ul>
      </section>

      <section aria-labelledby="grupo-vendas" className="inicio__grupo">
        <h2 id="grupo-vendas" className="rotulo-secao">
          Vendas
        </h2>
        <ul className="perfis">
          {vendedores.map((p) => (
            <CartaoPerfil key={p.id} perfil={p} detalhe={`${p.descricao.replace(/^Vendas · /, '')} · pensado para o celular`} />
          ))}
        </ul>
      </section>

      <p className="inicio__nota">
        Protótipo sem login: na versão real, cada pessoa entra com o próprio acesso e só recebe os dados do seu perfil.
      </p>
    </div>
  );
}

function CartaoPerfil({ perfil, detalhe }: { perfil: PerfilDisponivel; detalhe: string }) {
  const financeiro = perfil.id === 'financeiro';
  return (
    <li>
      <a className={`perfil ${financeiro ? 'perfil--destaque' : ''}`} href={perfil.arquivo}>
        <span className="perfil__nome">{perfil.nome}</span>
        <span className="perfil__detalhe">{detalhe}</span>
        <span className="perfil__seta" aria-hidden="true">
          →
        </span>
      </a>
    </li>
  );
}
