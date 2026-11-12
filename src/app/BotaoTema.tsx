import { useEffect, useState } from 'react';
import { IconeLua, IconeSol } from './Icones';
import { salvarTema, temaSalvo } from './preferencias';

type Tema = 'claro' | 'escuro';

const escuroNoSistema = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

/**
 * Um botão só, no canto: alterna entre claro e escuro. Até a pessoa escolher,
 * vale o tema do sistema. O nome acessível diz o que o clique FAZ
 * ("Usar tema escuro"), não o estado atual, que é o padrão para botões de alternar.
 */
export function BotaoTema() {
  const [tema, setTema] = useState<Tema>(() => {
    const salvo = temaSalvo();
    return salvo === 'sistema' ? (escuroNoSistema() ? 'escuro' : 'claro') : salvo;
  });

  // Enquanto a pessoa não escolheu, acompanha o sistema se ele mudar.
  useEffect(() => {
    if (temaSalvo() !== 'sistema') return;
    const consulta = window.matchMedia('(prefers-color-scheme: dark)');
    const mudou = () => setTema(consulta.matches ? 'escuro' : 'claro');
    consulta.addEventListener('change', mudou);
    return () => consulta.removeEventListener('change', mudou);
  }, []);

  const proximo: Tema = tema === 'escuro' ? 'claro' : 'escuro';
  const rotulo = proximo === 'escuro' ? 'Usar tema escuro' : 'Usar tema claro';

  return (
    <button
      type="button"
      className="botao-icone"
      aria-label={rotulo}
      title={rotulo}
      onClick={() => {
        setTema(proximo);
        salvarTema(proximo);
      }}
    >
      {tema === 'escuro' ? <IconeSol /> : <IconeLua />}
    </button>
  );
}
