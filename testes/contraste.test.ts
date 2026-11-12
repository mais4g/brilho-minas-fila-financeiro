import { describe, expect, it } from 'vitest';
import { CLARO, contraste, ESCURO, PARES_GRAFICOS, PARES_TEXTO } from '../src/app/tema';

/**
 * WCAG 2.2 AA: texto precisa de 4,5:1 (1.4.3) e elementos gráficos e bordas
 * de controles precisam de 3:1 (1.4.11). Vale para os dois temas.
 */
describe.each([
  ['claro', CLARO],
  ['escuro', ESCURO],
] as const)('tema %s', (_, tema) => {
  it.each(PARES_TEXTO)('texto %s sobre %s ≥ 4,5:1', (frente, fundo) => {
    expect(contraste(tema[frente], tema[fundo])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(PARES_GRAFICOS)('gráfico %s sobre %s ≥ 3:1', (frente, fundo) => {
    expect(contraste(tema[frente], tema[fundo])).toBeGreaterThanOrEqual(3);
  });
});

it('a fórmula de contraste bate com valores conhecidos', () => {
  expect(contraste('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  expect(contraste('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
});
