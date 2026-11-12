import type { Sugestao } from '../dominio/credito';

// Ícones decorativos (aria-hidden): o significado está sempre no texto ao lado.
// Cada status tem forma própria, para não depender só da cor.

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
} as const;

export function IconeStatus({ sugestao, tamanho = 14 }: { sugestao: Sugestao; tamanho?: number }) {
  const props = { ...base, width: tamanho, height: tamanho, strokeWidth: 2.6 };
  if (sugestao === 'bloquear') return <svg {...props}><path d="M6 6l12 12M18 6L6 18" /></svg>;
  if (sugestao === 'atencao') return <svg {...props}><path d="M12 6v7M12 17.5h.01" /></svg>;
  return <svg {...props}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
}

export const IconeAviso = ({ tamanho = 14 }: { tamanho?: number }) => (
  <svg {...base} width={tamanho} height={tamanho} strokeWidth={2.2}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.5h.01" />
  </svg>
);

export const IconeBusca = () => (
  <svg {...base} width={16} height={16} strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

export const IconeMarca = () => (
  <svg {...base} width={16} height={16} strokeWidth={2.2}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
  </svg>
);

export const IconePedidos = () => (
  <svg {...base} width={22} height={22} strokeWidth={2}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
);

export const IconeClientes = () => (
  <svg {...base} width={22} height={22} strokeWidth={2}>
    <path d="M4 21V8l8-5 8 5v13" />
    <path d="M9 21v-6h6v6" />
  </svg>
);

export const IconeSol = () => (
  <svg {...base} width={20} height={20} strokeWidth={2}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const IconeLua = () => (
  <svg {...base} width={20} height={20} strokeWidth={2}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </svg>
);
