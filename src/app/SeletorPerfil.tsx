import type { PerfilDisponivel } from '../dominio/visoes';

/**
 * "Ver como": cada perfil é um arquivo HTML separado, com só os dados dele.
 * Trocar de perfil é abrir o outro arquivo.
 */
export function SeletorPerfil({ perfis, atual }: { perfis: PerfilDisponivel[]; atual: string }) {
  const financeiro = perfis.filter((p) => p.id === 'financeiro');
  const vendedores = perfis.filter((p) => p.id !== 'financeiro');

  return (
    <label className="controle">
      <span className="controle__rotulo">Ver como</span>
      <select
        className="controle__campo controle__campo--forte"
        value={atual}
        onChange={(e) => {
          const destino = perfis.find((p) => p.id === e.target.value);
          if (destino) window.location.href = destino.arquivo;
        }}
      >
        <optgroup label="Financeiro">
          {financeiro.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} · Financeiro
            </option>
          ))}
        </optgroup>
        <optgroup label="Vendedores">
          {vendedores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} · {p.descricao.replace('Vendedor · ', '')}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
