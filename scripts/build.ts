import { copyFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'vite';
import { arquivoDoPerfil } from '../src/dominio/visoes';
import { gravarTudo } from './gerar';

/**
 * Gera tela/: um HTML autocontido por perfil (abre com dois cliques, sem
 * servidor) e um index.html para escolher o perfil.
 *
 * Cada HTML é um build separado do Vite com o alias "@dados" apontando para
 * o JSON daquele perfil: o arquivo do vendedor não contém dado de mais ninguém.
 * O index.html também passa pelo build (perfil "inicio", só com a lista de
 * perfis), para ter o mesmo visual e tema das outras páginas.
 */

const raiz = resolve(import.meta.dirname, '..');
const saida = resolve(raiz, 'tela');

async function principal() {
  const { base, perfis } = gravarTudo();

  rmSync(saida, { recursive: true, force: true });
  mkdirSync(saida, { recursive: true });

  const paginas = [...[...perfis.keys()].map((id) => ({ id, arquivo: arquivoDoPerfil(id) })), { id: 'inicio', arquivo: 'index.html' }];
  for (const { id, arquivo } of paginas) {
    process.env.PERFIL = id;
    await build({ root: raiz, configFile: resolve(raiz, 'vite.config.ts'), logLevel: 'warn' });
    copyFileSync(resolve(raiz, `.build/${id}/index.html`), resolve(saida, arquivo));
    console.log(`tela/${arquivo}`);
  }

  // Conferência final: nenhum arquivo de vendedor pode conter CNPJ ou telefone.
  for (const id of base.vendedores.keys()) {
    const html = readFileSync(resolve(saida, arquivoDoPerfil(id)), 'utf-8');
    if (/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\+55 \d{2}/.test(html)) {
      throw new Error(`tela/${arquivoDoPerfil(id)} contém CNPJ ou telefone`);
    }
  }
}

await principal();
