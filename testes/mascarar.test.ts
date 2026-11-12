import { describe, expect, it } from 'vitest';
import { mascararClientes } from '../scripts/mascarar';

type C = { id: string; cnpj: string; telefone_whatsapp: string };
const mascarar = (clientes: C[]) => mascararClientes(clientes) as C[];
const cliente = (id: string, cnpj: string, telefone = '+55 31 98457-3286'): C => ({ id, cnpj, telefone_whatsapp: telefone });

describe('mascaramento (ferramenta para dados reais)', () => {
  it('troca CNPJ e telefone por valores fictícios', () => {
    const [c] = mascarar([cliente('C1', '91.214.125/0001-45')]);
    expect(c?.cnpj).toMatch(/^00\.000\.\d{3}\/0001-\d{2}$/);
    expect(c?.telefone_whatsapp).toMatch(/^\+55 31 90000-\d{4}$/);
  });

  it('mantém iguais os CNPJs iguais, com ou sem pontuação (a duplicidade continua detectável)', () => {
    const [a, b, c] = mascarar([cliente('C1', '91.214.125/0001-45'), cliente('C2', '91214125000145'), cliente('C3', '11.222.333/0001-81')]);
    expect(a?.cnpj).toBe(b?.cnpj);
    expect(a?.cnpj).not.toBe(c?.cnpj);
  });

  it('deixa CNPJ vazio ou inválido como está (a anomalia continua aparecendo)', () => {
    const [vazio, invalido] = mascarar([cliente('C1', ''), cliente('C2', '123')]);
    expect(vazio?.cnpj).toBe('');
    expect(invalido?.cnpj).toBe('123');
  });

  it('não dá para voltar ao original: o falso depende só da ordem', () => {
    const [x] = mascarar([cliente('C1', '91.214.125/0001-45')]);
    const [y] = mascarar([cliente('C9', '55.666.777/0001-99')]);
    expect(x?.cnpj).toBe(y?.cnpj);
  });
});
