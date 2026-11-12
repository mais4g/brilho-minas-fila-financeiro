import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'vite';
import { carregarBase } from '../src/dominio/carregar';
import { DATA_REFERENCIA } from '../src/dominio/config';
import { arquivoDoPerfil, listarPerfis } from '../src/dominio/visoes';
import { gerarPerfis, lerDados } from './gerar';

/**
 * Gera tela/: um HTML autocontido por perfil (abre com dois cliques, sem
 * servidor) e um index.html para escolher o perfil.
 *
 * Cada HTML é um build separado do Vite com o alias "@dados" apontando para
 * o JSON daquele perfil: o arquivo do vendedor não contém dado de mais ninguém.
 */

const raiz = resolve(import.meta.dirname, '..');
const saida = resolve(raiz, 'tela');

const escapar = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

async function principal() {
  const base = carregarBase(lerDados(), DATA_REFERENCIA);
  const perfis = gerarPerfis(base);

  const gerado = resolve(raiz, 'src/gerado');
  mkdirSync(gerado, { recursive: true });
  for (const [id, dados] of perfis) writeFileSync(resolve(gerado, `${id}.json`), `${JSON.stringify(dados, null, 2)}\n`);

  rmSync(saida, { recursive: true, force: true });
  mkdirSync(saida, { recursive: true });

  for (const id of perfis.keys()) {
    process.env.PERFIL = id;
    await build({ root: raiz, configFile: resolve(raiz, 'vite.config.ts'), logLevel: 'warn' });
    copyFileSync(resolve(raiz, `.build/${id}/index.html`), resolve(saida, arquivoDoPerfil(id)));
    console.log(`tela/${arquivoDoPerfil(id)}`);
  }

  writeFileSync(resolve(saida, 'index.html'), paginaInicial(listarPerfis(base)));
  console.log('tela/index.html');

  // Conferência final: nenhum arquivo de vendedor pode conter CNPJ ou telefone.
  for (const id of base.vendedores.keys()) {
    const html = readFileSync(resolve(saida, arquivoDoPerfil(id)), 'utf-8');
    if (/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\+55 \d{2}/.test(html)) {
      throw new Error(`tela/${arquivoDoPerfil(id)} contém CNPJ ou telefone`);
    }
  }
}

function paginaInicial(perfis: ReturnType<typeof listarPerfis>): string {
  const itens = perfis
    .map((p) => `<li><a href="${p.arquivo}"><strong>${escapar(p.nome)}</strong><span>${escapar(p.descricao)}</span></a></li>`)
    .join('\n        ');
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <title>Brilho Minas · Fila do financeiro</title>
    <style>
      :root { --fundo:#f5f6f8; --sup:#fff; --borda:#dde1e7; --texto:#1b2230; --suave:#5b6578; --marca:#0f5c8c; }
      @media (prefers-color-scheme: dark) { :root { --fundo:#0f1419; --sup:#182029; --borda:#2e3a47; --texto:#e6eaf0; --suave:#9aa5b5; --marca:#6cb4e4; } }
      body { margin:0; background:var(--fundo); color:var(--texto); font:16px/1.45 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif; }
      main { max-width:560px; margin:0 auto; padding:32px 16px; }
      h1 { margin:0; color:var(--marca); font-size:1.5rem; }
      p { color:var(--suave); }
      ul { list-style:none; padding:0; display:grid; gap:8px; }
      a { display:flex; justify-content:space-between; gap:12px; padding:14px 16px; min-height:44px; background:var(--sup); border:1px solid var(--borda); border-radius:10px; color:inherit; text-decoration:none; }
      a:hover, a:focus-visible { border-color:var(--marca); }
      a span { color:var(--suave); font-size:.9rem; text-align:right; }
      small { color:var(--suave); }
    </style>
  </head>
  <body>
    <main>
      <h1>Brilho Minas</h1>
      <p>Fila de liberação de pedidos. Escolha quem está olhando:</p>
      <ul>
        ${itens}
      </ul>
      <small>Protótipo sem login: na versão real, cada pessoa entra com o próprio acesso e só recebe os dados do seu perfil.</small>
    </main>
  </body>
</html>
`;
}

await principal();
