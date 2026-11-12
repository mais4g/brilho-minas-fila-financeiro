import type { PerfilDisponivel } from '../dominio/visoes';

/**
 * "Ver como": ferramenta de demonstração (no sistema real, quem você é vem do
 * login). Por isso fica discreta, no canto. Cada perfil é um arquivo HTML
 * separado, com só os dados dele; trocar de perfil é abrir o outro arquivo.
 */
export function SeletorPerfil({ perfis, atual }: { perfis: PerfilDisponivel[]; atual: string }) {
  const financeiro = perfis.filter((p) => p.id === 'financeiro');
  const vendedores = perfis.filter((p) => p.id !== 'financeiro');

  return (
    <label className="ver-como">
      <span className="ver-como__rotulo">Ver como</span>
      <select
        className="ver-como__campo"
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
              {p.nome}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
