import { describe, expect, it } from 'vitest';
import { avaliarCredito, type TituloParaCredito } from '../src/dominio/credito';

const HOJE = '2026-11-11';

let seq = 0;
/** Boleto que venceu `dias` atrás (negativo = ainda vai vencer). */
function boleto(valor: number, dias: number, status: TituloParaCredito['status'] = 'vencido'): TituloParaCredito {
  const venc = new Date(Date.UTC(2026, 10, 11 - dias)).toISOString().slice(0, 10);
  return { id: `T${++seq}`, valor, vencimento: venc, status };
}

const avaliar = (valorPedido: number, limite: number | null, titulos: TituloParaCredito[] = []) =>
  avaliarCredito({ valorPedido, limite, titulos, dataReferencia: HOJE });

describe('regra de crédito da Marta', () => {
  it('libera cliente sem dívida e dentro do limite', () => {
    const r = avaliar(1000, 5000);
    expect(r.sugestao).toBe('liberar');
    expect(r.motivos).toEqual([{ tipo: 'em_dia' }]);
  });

  describe('atraso', () => {
    it('boleto vencendo hoje ainda não está atrasado', () => {
      expect(avaliar(100, 5000, [boleto(100, 0, 'aberto')]).sugestao).toBe('liberar');
    });

    it('1 dia de atraso → atenção', () => {
      expect(avaliar(100, 5000, [boleto(100, 1)]).sugestao).toBe('atencao');
    });

    it('5 dias de atraso → atenção (limite inclusivo da tolerância)', () => {
      const r = avaliar(100, 5000, [boleto(100, 5)]);
      expect(r.sugestao).toBe('atencao');
      expect(r.motivos[0]).toMatchObject({ tipo: 'atraso_leve', maiorAtrasoDias: 5 });
    });

    it('6 dias de atraso → bloquear ("mais de 5 dias")', () => {
      const r = avaliar(100, 5000, [boleto(100, 6)]);
      expect(r.sugestao).toBe('bloquear');
      expect(r.motivos[0]).toMatchObject({ tipo: 'atraso_grave', maiorAtrasoDias: 6 });
    });

    it('vale o boleto mais atrasado quando há vários', () => {
      const r = avaliar(100, 50000, [boleto(100, 2), boleto(100, 30), boleto(100, -10, 'aberto')]);
      expect(r.sugestao).toBe('bloquear');
      expect(r.maiorAtrasoDias).toBe(30);
      expect(r.titulosEmAberto.map((t) => t.diasAtraso)).toEqual([30, 2, 0]);
    });

    it('usa a data de vencimento, não o status: "aberto" vencido há 12 dias bloqueia', () => {
      expect(avaliar(100, 50000, [boleto(100, 12, 'aberto')]).sugestao).toBe('bloquear');
    });

    it('boleto marcado "vencido" com vencimento futuro não conta como atraso, mas conta como dívida', () => {
      const r = avaliar(100, 5000, [boleto(300, -3, 'vencido')]);
      expect(r.sugestao).toBe('liberar');
      expect(r.divida).toBe(300);
    });

    it('boleto pago não conta, nem como atraso nem como dívida', () => {
      const r = avaliar(100, 1000, [boleto(5000, 40, 'pago')]);
      expect(r.sugestao).toBe('liberar');
      expect(r.divida).toBe(0);
    });
  });

  describe('limite de crédito', () => {
    it('dívida + pedido exatamente igual ao limite → libera ("passa do limite" é maior que)', () => {
      const r = avaliar(1000, 5000, [boleto(4000, -5, 'aberto')]);
      expect(r.totalComPedido).toBe(5000);
      expect(r.sugestao).toBe('liberar');
    });

    it('um centavo acima do limite → bloquear', () => {
      const r = avaliar(1000.01, 5000, [boleto(4000, -5, 'aberto')]);
      expect(r.sugestao).toBe('bloquear');
      expect(r.motivos[0]).toMatchObject({ tipo: 'acima_limite', excesso: 0.01 });
    });

    it('soma em centavos não sofre com ponto flutuante (0,1 + 0,2)', () => {
      const r = avaliar(0.2, 0.3, [boleto(0.1, -1, 'aberto')]);
      expect(r.totalComPedido).toBe(0.3);
      expect(r.sugestao).toBe('liberar');
    });

    it('dívida conta boletos abertos (a vencer) e vencidos', () => {
      const r = avaliar(500, 2000, [boleto(800, -10, 'aberto'), boleto(800, 2)]);
      expect(r.divida).toBe(1600);
      expect(r.sugestao).toBe('bloquear');
    });

    it('pedido sozinho maior que o limite → bloquear', () => {
      expect(avaliar(6000, 5000).sugestao).toBe('bloquear');
    });
  });

  describe('combinações e cadastro', () => {
    it('atraso leve + acima do limite → bloquear (limite prevalece)', () => {
      const r = avaliar(3000, 4000, [boleto(2000, 3)]);
      expect(r.sugestao).toBe('bloquear');
      expect(r.motivos.map((m) => m.tipo)).toEqual(['acima_limite']);
    });

    it('atraso grave + acima do limite → bloquear, listando os dois motivos', () => {
      const r = avaliar(3000, 4000, [boleto(2000, 20)]);
      expect(r.motivos.map((m) => m.tipo)).toEqual(['atraso_grave', 'acima_limite']);
    });

    it.each([0, -100, null])('cliente sem limite definido (%s) → bloquear', (limite) => {
      const r = avaliar(100, limite);
      expect(r.sugestao).toBe('bloquear');
      expect(r.motivos[0]).toEqual({ tipo: 'sem_limite' });
    });
  });
});
