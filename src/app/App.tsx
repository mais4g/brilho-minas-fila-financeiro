import { useEffect } from 'react';
import type { DadosPagina } from '../dominio/visoes';
import { formatarDataLonga } from './formato';
import { IconeMarca } from './Icones';
import { BotaoTema } from './BotaoTema';
import { PaginaInicial } from './PaginaInicial';
import { SeletorPerfil } from './SeletorPerfil';
import { VisaoFinanceiro } from './VisaoFinanceiro';
import { VisaoVendedor } from './VisaoVendedor';

export function App({ dados }: { dados: DadosPagina }) {
  const titulo =
    dados.perfil === 'inicio' ? 'Escolha o perfil' : dados.perfil === 'financeiro' ? 'Fila do financeiro' : `Pedidos de ${dados.vendedor.nome}`;

  useEffect(() => {
    document.title = `${titulo} · Brilho Minas`;
  }, [titulo]);

  return (
    <>
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="topo">
        <div className="topo__conteudo">
          <a className="marca" href="index.html" aria-label="Brilho Minas: escolher perfil">
            <span className="marca__simbolo">
              <IconeMarca />
            </span>
            <span className="marca__nome">Brilho Minas</span>
            {dados.perfil !== 'vendedor' && <span className="marca__secao">Fila do financeiro</span>}
          </a>
          <div className="topo__controles">
            <span className="topo__data">{formatarDataLonga(dados.dataReferencia)}</span>
            {dados.perfil !== 'inicio' && (
              <SeletorPerfil perfis={dados.perfis} atual={dados.perfil === 'financeiro' ? 'financeiro' : dados.vendedor.id} />
            )}
            <BotaoTema />
          </div>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className={dados.perfil === 'vendedor' ? 'pagina pagina--celular' : 'pagina'}>
        {dados.perfil === 'inicio' ? (
          <PaginaInicial dados={dados} />
        ) : dados.perfil === 'financeiro' ? (
          <VisaoFinanceiro dados={dados} />
        ) : (
          <VisaoVendedor dados={dados} />
        )}
      </main>
    </>
  );
}
