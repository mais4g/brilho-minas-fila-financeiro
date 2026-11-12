import { useEffect } from 'react';
import { formatarDataLonga } from './formato';
import type { DadosPerfil } from '../dominio/visoes';
import { SeletorPerfil } from './SeletorPerfil';
import { VisaoFinanceiro } from './VisaoFinanceiro';
import { VisaoVendedor } from './VisaoVendedor';

export function App({ dados }: { dados: DadosPerfil }) {
  const titulo = dados.perfil === 'financeiro' ? 'Fila do financeiro' : `Pedidos de ${dados.vendedor.nome}`;

  useEffect(() => {
    document.title = `${titulo} · Brilho Minas`;
  }, [titulo]);

  return (
    <>
      <header className="topo">
        <div className="topo__conteudo">
          <div className="marca">
            <span className="marca__nome">Brilho Minas</span>
            <span className="marca__data">Dados de {formatarDataLonga(dados.dataReferencia)}</span>
          </div>
          <SeletorPerfil perfis={dados.perfis} atual={dados.perfil === 'financeiro' ? 'financeiro' : dados.vendedor.id} />
        </div>
      </header>
      <main className="pagina">
        {dados.perfil === 'financeiro' ? <VisaoFinanceiro dados={dados} /> : <VisaoVendedor dados={dados} />}
      </main>
    </>
  );
}
