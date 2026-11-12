import { useEffect } from 'react';
import type { DadosPerfil } from '../dominio/visoes';
import { formatarDataLonga } from './formato';
import { IconeMarca } from './Icones';
import { BotaoTema } from './BotaoTema';
import { SeletorPerfil } from './SeletorPerfil';
import { VisaoFinanceiro } from './VisaoFinanceiro';
import { VisaoVendedor } from './VisaoVendedor';

export function App({ dados }: { dados: DadosPerfil }) {
  const financeiro = dados.perfil === 'financeiro';
  const titulo = financeiro ? 'Fila do financeiro' : `Pedidos de ${dados.vendedor.nome}`;

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
          <div className="marca">
            <span className="marca__simbolo">
              <IconeMarca />
            </span>
            <span className="marca__nome">Brilho Minas</span>
            {financeiro && <span className="marca__secao">Fila do financeiro</span>}
          </div>
          <div className="topo__controles">
            <span className="topo__data">{formatarDataLonga(dados.dataReferencia)}</span>
            <SeletorPerfil perfis={dados.perfis} atual={financeiro ? 'financeiro' : dados.vendedor.id} />
            <BotaoTema />
          </div>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className={financeiro ? 'pagina' : 'pagina pagina--celular'}>
        {financeiro ? <VisaoFinanceiro dados={dados} /> : <VisaoVendedor dados={dados} />}
      </main>
    </>
  );
}
