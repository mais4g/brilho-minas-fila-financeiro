export type EscolhaTema = 'sistema' | 'claro' | 'escuro';

const CHAVE = 'brilho-minas:tema';

// localStorage pode não existir ou lançar erro (aba anônima, arquivo aberto
// direto do disco em alguns navegadores): a tela funciona igual, só não lembra.
export function temaSalvo(): EscolhaTema {
  try {
    const v = window.localStorage.getItem(CHAVE);
    return v === 'claro' || v === 'escuro' ? v : 'sistema';
  } catch {
    return 'sistema';
  }
}

export function aplicarTema(escolha: EscolhaTema): void {
  if (escolha === 'sistema') delete document.documentElement.dataset.tema;
  else document.documentElement.dataset.tema = escolha;
}

export function salvarTema(escolha: EscolhaTema): void {
  aplicarTema(escolha);
  try {
    if (escolha === 'sistema') window.localStorage.removeItem(CHAVE);
    else window.localStorage.setItem(CHAVE, escolha);
  } catch {
    // sem armazenamento: vale só nesta aba
  }
}
