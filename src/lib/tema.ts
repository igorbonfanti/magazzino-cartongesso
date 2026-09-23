import { useEffect, useState } from 'react';

export type Tema = 'chiaro' | 'scuro';

// Stessa chiave di tema.js (vedi DESIGN_SYSTEM.md): le app stanno tutte su
// igorbonfanti.github.io, quindi la scelta fatta in una vale anche nelle altre.
const CHIAVE = 'magazzino.tema';

function temaIniziale(): Tema {
  try {
    const salvato = localStorage.getItem(CHIAVE);
    if (salvato === 'chiaro' || salvato === 'scuro') return salvato;
  } catch {
    /* niente localStorage: si parte dalle preferenze del sistema */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'scuro' : 'chiaro';
}

/** Tema chiaro o scuro, ricordato fra una visita e l'altra. La stampa resta sempre chiara. */
export function useTema(): [Tema, () => void] {
  const [tema, setTema] = useState<Tema>(temaIniziale);

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    try {
      localStorage.setItem(CHIAVE, tema);
    } catch {
      /* si continua senza ricordarselo */
    }
  }, [tema]);

  return [tema, () => setTema((t) => (t === 'scuro' ? 'chiaro' : 'scuro'))];
}
