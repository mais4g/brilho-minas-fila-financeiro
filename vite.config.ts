import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Cada página é construída com os dados de UM perfil só. O alias "@dados"
// aponta para o arquivo gerado daquele perfil (ver scripts/gerar.ts e
// scripts/build.ts), então o HTML de um vendedor não carrega dado de mais ninguém.
const perfil = process.env.PERFIL ?? 'financeiro';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: { '@dados': resolve(import.meta.dirname, `src/gerado/${perfil}.json`) },
  },
  build: { outDir: `.build/${perfil}`, emptyOutDir: true },
  test: { include: ['testes/**/*.test.ts'] },
});
