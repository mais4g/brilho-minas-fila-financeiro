import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/** amostra/ é o que vai para o repositório e para o Pages: CNPJ e telefone precisam ser fictícios. */
const clientes = JSON.parse(readFileSync(resolve(import.meta.dirname, '../amostra/clientes.json'), 'utf-8')) as {
  id: string;
  cnpj: string;
  telefone_whatsapp: string;
}[];

describe('amostra mascarada', () => {
  it('só tem CNPJs e telefones fictícios (ou vazios)', () => {
    for (const c of clientes) {
      expect(c.cnpj).toMatch(/^(00\.000\.\d{3}\/0001-\d{2})?$/);
      expect(c.telefone_whatsapp).toMatch(/^(\+55 31 90000-\d{4})?$/);
    }
  });

  it('mantém a duplicidade C001/C037 (mesmo CNPJ e telefone)', () => {
    const [c001, c037] = ['C001', 'C037'].map((id) => clientes.find((c) => c.id === id));
    expect(c001?.cnpj).toBe(c037?.cnpj);
    expect(c001?.telefone_whatsapp).toBe(c037?.telefone_whatsapp);
  });
});
