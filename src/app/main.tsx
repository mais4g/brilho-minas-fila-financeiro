import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/playfair-display/latin-600.css';
import '@fontsource/playfair-display/latin-600-italic.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { dados } from './dados';
import './estilos.css';
import { cssDosTemas } from './tema';
import { aplicarTema, temaSalvo } from './preferencias';

// Fontes embutidas no próprio HTML: funciona sem internet e não faz
// requisição a terceiros (nada de Google Fonts saber quem abriu a tela).

// Tema aplicado antes do primeiro desenho, para não piscar o tema errado.
const estilo = document.createElement('style');
estilo.textContent = cssDosTemas();
document.head.appendChild(estilo);
aplicarTema(temaSalvo());

const raiz = document.getElementById('raiz');
if (raiz) {
  createRoot(raiz).render(
    <StrictMode>
      <App dados={dados} />
    </StrictMode>,
  );
}
