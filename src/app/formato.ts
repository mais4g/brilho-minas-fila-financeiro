export { formatarData, formatarReais } from '../dominio/textos';

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** "2026-11-11" → "11 de novembro de 2026". */
export function formatarDataLonga(iso: string): string {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return `${dia} de ${MESES[(mes ?? 1) - 1]} de ${ano}`;
}

const CANAIS: Record<string, string> = {
  whatsapp_vendedor: 'WhatsApp do vendedor',
  telefone: 'Telefone',
  email: 'E-mail',
};
export const formatarCanal = (canal: string) => CANAIS[canal] ?? canal;

/** Versão curta, para a linha da fila. */
export const formatarCanalCurto = (canal: string) => (canal === 'whatsapp_vendedor' ? 'WhatsApp' : formatarCanal(canal));
